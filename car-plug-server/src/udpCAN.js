import dgram from "node:dgram";
import { Buffer } from "node:buffer";
import os from "node:os";

import { getSignal, setSignal } from "./vssDB.js";


const MSG_HEADER_LEN = 7;

const IP_SOF_BYTE1 = 0x12;
const IP_SOF_BYTE2 = 0x34;

const IP_SOF_CMD_DATA = 0x02;
const IP_SOF_VSS_CMD = 0x10;
const IP_SOF_VSS_RES = 0x11;

const ZONES = {
    ZONE_FRONT: 0,
    ZONE_LEFT: 1,
    ZONE_RIGHT: 2,
    ZONE_REAR: 3,
    ZONE_COMMANDER_ID: 0xFC
};

const serverInfo = {
    SELF_IP: "127.0.0.1",
    UDP_PORT: 49152,
    UDP_BROADCAST_ADDR: "192.168.0.255",
    UDP_MULTICAST_ADDR: "239.255.255.250",
    udpServer: null
};


export const startCAN = (coipPort, socketIOServer, watchdogCounters) => {

    const udpServer = serverInfo.udpServer = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    const UDP_PORT = serverInfo.UDP_PORT = coipPort;
    const IO = socketIOServer;

    const networkInterfaces = os.networkInterfaces();
    let validAddr = false;
    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const iface of interfaces) {
            // Check for IPv4 and non-internal addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                serverInfo.SELF_IP = iface.address;
                const IPs = iface.address.split(".");
                serverInfo.UDP_BROADCAST_ADDR = `${IPs[0]}.${IPs[1]}.${IPs[2]}.255`;
                console.log(`UDP broadcast address: ${serverInfo.UDP_BROADCAST_ADDR}`);
                validAddr = true;
                break;
            }
        }
        if (validAddr) {
            break;
        }
    }

    const receive_udp = (msg) => {
        if (watchdogCounters.has("watchdog_udp")) {
            if (watchdogCounters.get("watchdog_udp") > 0) {
                IO.emit("receive_udp", msg);
            }
        }
    };

    udpServer.on('error', (err) => {
        console.error(`server error:\n${err.stack}`);
        udpServer.close();
    });

    udpServer.on('listening', () => {
        const address = udpServer.address();
        console.log(`UDP socket listening on ${address.address}:${address.port}`);
        udpServer.setBroadcast(true);        
        //udpServer.addMembership(serverInfo.UDP_MULTICAST_ADDR); // Join the multicast group
        //console.log(`Joined multicast group: ${serverInfo.UDP_MULTICAST_ADDR}`);
    });

    udpServer.bind(UDP_PORT, serverInfo.SELF_IP);

    udpServer.on('message', (msg, rinfo) => {
        if (msg[0] === IP_SOF_BYTE1 && msg[1] === IP_SOF_BYTE2 && msg.length > MSG_HEADER_LEN) {
            const type = msg[2];
            const seq = msg[3];
            const len = (msg[4] << 8) + msg[5];
            const zone = msg[6];
            if (zone !== ZONES.ZONE_COMMANDER_ID && len === msg.length) {
                if (type < IP_SOF_VSS_CMD) {
                    const zoneMsg = {
                        address: rinfo.address,
                        type: type,
                        seq: seq,
                        len: len,
                        zone: zone,
                        data: Array.from(msg)
                    };
                    receive_udp(zoneMsg);
                }
                else if (type === IP_SOF_VSS_RES) {
                    const json = JSON.parse(msg.subarray(MSG_HEADER_LEN).toString());
                    if (json && json.signals) {
                        if (json.type === "vss") {
                            for (const signal of json.signals) {
                                setSignal(signal.name, signal.value);
                            }
                        }
                        else if (json.type === "get") {
                            json.type = "vss";
                            for (const signal of json.signals) {
                                const storedSignal = getSignal(signal.name);
                                signal.value = storedSignal.value;
                            }
                            send_vss(json, IP_SOF_VSS_RES);
                        }
                    }
                }
            }
        }
    });
};

export const send_udp = (msg) => {
    const txt = msg.data;
    const LEN = MSG_HEADER_LEN + txt.length;
    const tx_buf = Buffer.alloc(LEN);

    tx_buf[0] = IP_SOF_BYTE1;
    tx_buf[1] = IP_SOF_BYTE2;
    tx_buf[2] = IP_SOF_CMD_DATA;
    tx_buf[3] = 0x00;
    tx_buf[4] = (LEN >>> 8) & 0xFF;
    tx_buf[5] = LEN & 0xFF;
    tx_buf[6] = ZONES.ZONE_COMMANDER_ID;

    const command = Buffer.from(txt);
    command.copy(tx_buf, MSG_HEADER_LEN, 0);
    serverInfo.udpServer.send(tx_buf, serverInfo.UDP_PORT, serverInfo.UDP_BROADCAST_ADDR);
    //serverInfo.udpServer.send(tx_buf, serverInfo.UDP_PORT, serverInfo.UDP_MULTICAST_ADDR);
};

const send_vss = (msg, type) => {
    const txt = JSON.stringify(msg);
    const LEN = MSG_HEADER_LEN + txt.length;
    const tx_buf = Buffer.alloc(LEN);

    tx_buf[0] = IP_SOF_BYTE1;
    tx_buf[1] = IP_SOF_BYTE2;
    tx_buf[2] = type;
    tx_buf[3] = 0x00;
    tx_buf[4] = (LEN >>> 8) & 0xFF;
    tx_buf[5] = LEN & 0xFF;
    tx_buf[6] = ZONES.ZONE_COMMANDER_ID;

    const command = Buffer.from(txt);
    command.copy(tx_buf, MSG_HEADER_LEN, 0);
    serverInfo.udpServer.send(tx_buf, serverInfo.UDP_PORT, serverInfo.UDP_BROADCAST_ADDR);
    //serverInfo.udpServer.send(tx_buf, serverInfo.UDP_PORT, serverInfo.UDP_MULTICAST_ADDR);
    if (LEN > 1024) {
        console.log("\nVSS cmd len: " + LEN);
    }
};

const INTERNAL_SIGNALS = [
    "Vehicle.Cabin.Infotainment.HMI.Brightness",
    "Vehicle.Cabin.Infotainment.HMI.CurrentLanguage",
    "Vehicle.Cabin.Infotainment.HMI.DateFormat",
    "Vehicle.Cabin.Infotainment.HMI.DayNightMode",
    "Vehicle.Cabin.Infotainment.HMI.DisplayOffDuration",
    "Vehicle.Cabin.Infotainment.HMI.DistanceUnit",
    "Vehicle.Cabin.Infotainment.HMI.EVEconomyUnits",
    "Vehicle.Cabin.Infotainment.HMI.EVEnergyUnits",
    "Vehicle.Cabin.Infotainment.HMI.FontSize",
    "Vehicle.Cabin.Infotainment.HMI.IsScreenAlwaysOn",
    "Vehicle.Cabin.Infotainment.HMI.LastActionTime",
    "Vehicle.Cabin.Infotainment.HMI.SpeedUnit",
    "Vehicle.Cabin.Infotainment.HMI.TemperatureUnit",
    "Vehicle.Cabin.Infotainment.HMI.TimeFormat",
    "Vehicle.Cabin.Infotainment.HMI.TirePressureUnit",
    "Vehicle.Powertrain.Range",
    "Vehicle.TraveledDistance",
    "Vehicle.TraveledDistanceSinceStart",
    "Vehicle.CurrentLocation.Timestamp",
    "Vehicle.CurrentLocation.Latitude",
    "Vehicle.CurrentLocation.Longitude",
    "Vehicle.CurrentLocation.Heading",
];

const internalVssSignals = new Set(INTERNAL_SIGNALS);

export const send_vss_cmd = (msg) => {
    if (msg && msg.signals) {
        const outSignals = [];
        const inSignals = [];
        for (const signal of msg.signals) {
            if (internalVssSignals.has(signal.name)) {
                inSignals.push(signal);
            }
            else {
                outSignals.push(signal);
            }
        }
        if (inSignals.length > 0) {
            msg.signals = inSignals;
            send_vss(msg, IP_SOF_VSS_RES);
        }
        if (outSignals.length > 0) {
            msg.signals = outSignals;
            send_vss(msg, IP_SOF_VSS_CMD);
        }
    }
};
