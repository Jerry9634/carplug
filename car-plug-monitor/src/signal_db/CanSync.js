import { serverInfo } from './VssSocket';
import routingDB from '../signal_db/routingDB.json';


const MSG_HEADER_LEN = 7;

const IP_SOF_NM_DATA = 0x00;
const IP_SOF_CAN_DATA = 0x01;
//const IP_SOF_CMD_DATA = 0x02;
const IP_SOF_NM_DATA2 = 0x03;


export const startCAN = () => {
    serverInfo.socket.off("receive_udp");
    startNM();
    serverInfo.socket.on("receive_udp", (msg) => {
        const payload = msg.data.slice(MSG_HEADER_LEN);
        if (msg.type === IP_SOF_NM_DATA) {
            receiveNM(payload, msg.seq, msg.zone, msg.address);
        }
        else if (msg.type === IP_SOF_NM_DATA2) {
            handleUnknown(payload, msg.zone);
        }
        else if (msg.type === IP_SOF_CAN_DATA) {
            syncStorage(payload, msg.seq, msg.zone);
        }
    });
};

export const pauseCAN = () => {
    serverInfo.socket.off("receive_udp");
    pauseNM();
};

export const sendResetRequest = () => {
    resetNM();
    serverInfo.socket.emit("send_udp", {
        data: "reset"
    });
};

/*
 * signal_nm.js
 */
const UNKNOWN_MSG_HEADER_LEN = 6;

const zones = new Set();
const channels = new Set();
const ecus = new Set();

const ecuChannelMap = new Map();
const ecuTimeoutMap = new Map();
const channelZoneMap = new Map();

const zoneAddressMap = new Map();
const zoneTimeoutMap = new Map();

const nmMsgSeqMap = new Map();

const sysTimeMap = new Map();
const totalCanTxMap = new Map();
const deltaCanTxMap = new Map();
const totalCanRxMap = new Map();
const deltaCanRxMap = new Map();

const channelAliveMap = new Map();

const unknownCanMsgMap = new Map();

const syncTimers = {
    refreshInterval: null
};

/* global BigInt */


const startNM = () => {
    if (syncTimers.refreshInterval) {
        clearInterval(syncTimers.refreshInterval);
    }
    syncTimers.refreshInterval = setInterval(() => {
        channelZoneMap.forEach((zone, channel) => {
            if (channelAliveMap.has(channel)) {
                let timeout = channelAliveMap.get(channel);
                if (timeout > 0) {
                    timeout--;
                    channelAliveMap.set(channel, timeout);
                    if (timeout === 0) {
                        channelAliveMap.delete(channel);
                    }
                }
            }
        });

        unknownCanMsgMap.forEach((msgObj, key) => {
            if (msgObj.timeout > 0) {
                msgObj.timeout--;
            }
            if (msgObj.timeout === 0) {
                unknownCanMsgMap.delete(key);
            }
        });

        for (const ecu of ecus) {
            let timeout = ecuTimeoutMap.get(ecu);
            if (timeout > 0) {
                timeout--;
                ecuTimeoutMap.set(ecu, timeout);
                if (timeout === 0) {
                    ecuChannelMap.delete(ecu);
                }
            }
        }

        for (const zone of zones) {
            let timeout = zoneTimeoutMap.get(zone);
            if (timeout > 0) {
                timeout--;
                zoneTimeoutMap.set(zone, timeout);
                if (timeout === 0) {
                    zoneAddressMap.set(zone, "-");
                }
            }
        }

        serverInfo.socket.emit("watchdog_udp", "heartbeat");
    }, 100);
};

const pauseNM = () => {
    if (syncTimers.refreshInterval) {
        clearInterval(syncTimers.refreshInterval);
        syncTimers.refreshInterval = null;
    }
};

const receiveNM = (buf, seq, zone, address) => {
    if (nmMsgSeqMap.has(zone)) {
        const oldSeq = nmMsgSeqMap.get(zone);
        if (oldSeq === seq) {
            return;
        }
    }
    nmMsgSeqMap.set(zone, seq);

    let index = 0;
    let extInfo = false;
    while (index < buf.length) {
        const ecu = buf[index++];
        const channel = buf[index++];
        if (ecu === 0xFF && channel === 0xFF) {
            extInfo = true;
            break;
        }
        if (!zones.has(zone)) {
            zones.add(zone);
        }
        if (!channels.has(channel)) {
            channels.add(channel);
        }
        if (!ecus.has(ecu)) {
            ecus.add(ecu);
        }
        if (!channelZoneMap.has(channel)) {
            channelZoneMap.set(channel, zone);
        }

        ecuChannelMap.set(ecu, channel);
        ecuTimeoutMap.set(ecu, 15);

        zoneAddressMap.set(zone, address);
        zoneTimeoutMap.set(zone, 15);
    }

    if (extInfo) {
        while (index < buf.length) {
            const channel = buf[index++];
            if (channel !== 0xFF) {
                channelAliveMap.set(channel, 15);

                // CAN Tx:
                const totalCanTxHigh = (buf[index] << 24) + (buf[index + 1] << 16) + (buf[index + 2] << 8) + buf[index + 3];
                index += 4;
                const totalCanTxLow = (buf[index] << 24) + (buf[index + 1] << 16) + (buf[index + 2] << 8) + buf[index + 3];
                index += 4;
                const totalCanTx = (BigInt.asUintN(32, BigInt(totalCanTxHigh)) << 32n) + BigInt.asUintN(32, BigInt(totalCanTxLow));
                let deltaCanTx = 0n;
                if (totalCanTxMap.has(channel)) {
                    deltaCanTx = totalCanTx - totalCanTxMap.get(channel);
                }
                totalCanTxMap.set(channel, totalCanTx);
                deltaCanTxMap.set(channel, deltaCanTx);
                // CAN Rx:
                const totalCanRx = getTotalCanRx(channel);
                let deltaCanRx = 0n;
                if (totalCanRxMap.has(channel)) {
                    deltaCanRx = totalCanRx - totalCanRxMap.get(channel);
                }
                totalCanRxMap.set(channel, totalCanRx);
                deltaCanRxMap.set(channel, deltaCanRx);
            }
            else {
                const sysTimeHigh = (buf[index] << 24) + (buf[index + 1] << 16) + (buf[index + 2] << 8) + (buf[index + 3]);
                index += 4;
                const sysTimeLow = (buf[index] << 24) + (buf[index + 1] << 16) + (buf[index + 2] << 8) + (buf[index + 3]);
                const sysTime = (BigInt.asUintN(32, BigInt(sysTimeHigh)) << 32n) + BigInt.asUintN(32, BigInt(sysTimeLow));

                let msTime = sysTime / 1000n;
                let secTime = msTime / 1000n;
                let minTime = secTime / 60n;
                const hourTime = minTime / 60n;

                msTime = msTime % 1000n;
                secTime %= 60n;
                minTime %= 60n;

                const sysTimeString = hourTime + ":" + minTime.toString().padStart(2, '0') + ":"
                                      + secTime.toString().padStart(2, '0') + "." + msTime.toString().padStart(3, '0');
                sysTimeMap.set(zone, sysTimeString);

                break;
            }
        }
    }
};

const resetNM = () => {
    zones.clear();
    channels.clear();
    ecus.clear();
    ecuChannelMap.clear();
    ecuTimeoutMap.clear();
    channelZoneMap.clear();
    zoneAddressMap.clear();

    zoneTimeoutMap.clear();
    nmMsgSeqMap.clear();
    sysTimeMap.clear();
    totalCanTxMap.clear();
    deltaCanTxMap.clear();
    totalCanRxMap.clear();
};

const handleUnknown = (buf, zone) => {
    const len = buf.length;
    let index = 0;
    if (len > UNKNOWN_MSG_HEADER_LEN) {
        const channel = buf[index];
        const canId = (buf[index + 1] << 24) + (buf[index + 2] << 16) + (buf[index + 3] << 8) + (buf[index + 4]);
        const DLC = buf[index + 5];
        index += UNKNOWN_MSG_HEADER_LEN;

        if ((index + DLC) === len) {
            const msgKey = channel + ":" + canId;
            const timestamp = Date.now();
            let message;
            if (!unknownCanMsgMap.has(msgKey)) {
                message = {
                    zone: zone,
                    channel: channel,
                    id: canId,
                    DLC: 0,
                    data: null,
                    timestamp: 0,
                    known: false,
                    timeout: 0
                };
                unknownCanMsgMap.set(msgKey, message);
            }
            else {
                message = unknownCanMsgMap.get(msgKey);
            }

            message.DLC = DLC;
            const data = [];
            for (let i = 0; i < DLC; i++) {
                data.push(buf[index + i]);
            }
            message.data = data;
            message.timestamp = timestamp;
            message.timeout = 10;
        }
    }
};

const getTotalCanTx = (channel) => {
    if (totalCanTxMap.has(channel)) {
        return totalCanTxMap.get(channel);
    }
    else {
        return BigInt(0);
    }
};

const getDeltaCanTx = (channel) => {
    if (channelAliveMap.has(channel) && deltaCanTxMap.has(channel)) {
        return deltaCanTxMap.get(channel);
    }
    else {
        return BigInt(0);
    }
};

const getDeltaCanRx = (channel) => {
    if (channelAliveMap.has(channel) && deltaCanRxMap.has(channel)) {
        return deltaCanRxMap.get(channel);
    }
    else {
        return BigInt(0);
    }
};

export const getZoneConfig = () => {
    const jsonData = {
        zones: [],
        channels: []
    };

    routingDB.zones.forEach((zoneData, zone) => {
        const zoneObj = {
            zone: zone,
            name: zoneData.name,
            address: zoneAddressMap.get(zone),
            systemTime: sysTimeMap.get(zone),
            channels: []
        };
        jsonData.zones.push(zoneObj);

        zoneData.channels.forEach((channelData) => {
            const channel = channelData.index;
            zoneObj.channels.push(channel);

            const channelObj = {
                channel: channel,
                name: channelData.name,
                zone: zone,
                totalCanRx: "0",
                deltaCanRx: "0",
                totalCanTx: "0",
                deltaCanTx: "0",
                ecus: [],
                pduList: [],
                hasUnknownEcu: false
            };
            jsonData.channels.push(channelObj);

            if (channels.has(channel)) {
                channelObj.totalCanRx = getTotalCanRx(channel).toString();
                channelObj.deltaCanRx = getDeltaCanRx(channel).toString();
                channelObj.totalCanTx = getTotalCanTx(channel).toString();
                channelObj.deltaCanTx = getDeltaCanTx(channel).toString();
            }

            ecus.forEach((ecu) => {
                if (channel === ecuChannelMap.get(ecu)) {
                    channelObj.ecus.push(ecu);
                }
            });
        });
    });

    const storageMap = getStorageMap();
    const timeNow = Date.now();
    storageMap.forEach((msgObj) => {
        if (msgObj.channel < jsonData.channels.length) {
            msgObj.timestamp_now = timeNow;
            jsonData.channels[msgObj.channel].pduList.push(msgObj);
        }
    });

    unknownCanMsgMap.forEach((msgObj) => {
        if (msgObj.channel < jsonData.channels.length) {
            jsonData.channels[msgObj.channel].pduList.push(msgObj);
            jsonData.channels[msgObj.channel].hasUnknownEcu = true;
        }
    });

    return jsonData;
};

export const getUnknownCanMsgMap = () => {
    return unknownCanMsgMap;
};


/*
 * signal_sync.js
 */
const canStorageMap = new Map();
const canMsgSeqMap = new Map();
const canRxMap = new Map();


const syncStorage = (buf, seq, zone) => {
    if (canMsgSeqMap.has(zone)) {
        const oldSeq = canMsgSeqMap.get(zone);
        if (oldSeq === seq) {
            return;
        }
    }
    canMsgSeqMap.set(zone, seq);

    const len = buf.length;
    let index = 0;

    while (index < len) {
        const channel = buf[index++];

        if (!canRxMap.has(channel)) {
            canRxMap.set(channel, BigInt(0));
        }
        let totalCanRx = canRxMap.get(channel);
        totalCanRx++;
        canRxMap.set(channel, totalCanRx);

        const sender = buf[index++];
        const canId = (buf[index] << 24) + (buf[index + 1] << 16) + (buf[index + 2] << 8) + (buf[index + 3]);
        const DLC = buf[index + 4];
        index += 5;

        const id = (channel << 29) + canId;
        const timestamp = Date.now();
        if (!canStorageMap.has(id)) {
            const message = {
                id: id,
                zone: zone,
                channel: channel,
                sender: sender,
                canId: canId,
                DLC: DLC,
                data: [],
                timestamp: timestamp,
                known: true
            };
            for (let i = 0; i < DLC; i++) {
                message.data.push(buf[index + i]);
            }
            canStorageMap.set(id, message);
        }
        else {
            const message = canStorageMap.get(id);
            message.sender = sender;
            message.DLC = DLC;
            message.data = [];
            for (let i = 0; i < DLC; i++) {
                message.data.push(buf[index + i]);
            }
            message.timestamp = timestamp;
        }

        index += DLC;
    }
};

export const getStorageMap = () => {
    return canStorageMap;
};

const getTotalCanRx = (channel) => {
    if (canRxMap.has(channel)) {
        return canRxMap.get(channel);
    }
    else {
        return BigInt(0);
    }
};
