import SocketIOClient from 'socket.io-client';
import vssApi from './VssAPI.json';
import { saveData, getData, getDataSafely } from '../persistency/PersistentMemory';


const IO_IP_ADDRESS = process.env.REACT_APP_IO_IP_ADDRESS;
const IO_PORT = process.env.REACT_APP_IO_PORT;

export const serverInfo = {
    SERVER_IP: IO_IP_ADDRESS,
    socket: SocketIOClient(`http://${IO_IP_ADDRESS}:${IO_PORT}`),
    serverFound: false
};

export const SIGNAL_TYPES = {
    VSS: "vss", // COVESA Vehicle Signal Spec
    EXT: "ext"  // Extended
};

const KEY_CLIENT_NAME = "car-plug.client";
const BASE_CLIENT_NAME = "car-plug/0000";
const clientInfo = {
    name: getDataSafely(KEY_CLIENT_NAME, BASE_CLIENT_NAME)
};
const watchdogChannel = {
    intervalHandle: null,
    heartbeat: 0,
    timeoutCounter: 5,
    lastTime: -1
};
const SUBSCRIPTION_DELAY = 500;
const subscriptionDataMap = new Map();
const channelCallbackMap = new Map();
const signalCallbackMap = new Map();


export const setSignal = (signalName, physicalValue, callback = null) => {
    const jsonData = {
        signals: [{ name: signalName, value: physicalValue }]
    };
    setSignals(jsonData, callback);
};

export const getSignal = (signalName, callback) => {
    const jsonData = {
        signals: [{ name: signalName }]
    };
    getSignals(jsonData, (json) => {
        if (json.signals && json.signals.length > 0) {
            if (callback) {
                callback(json.signals[0].value);
            }
        }
    });
};

export const setSignals = (jsonData, callback = null) => {
    if (serverInfo.serverFound) {
        if (!jsonData.type) {
            jsonData.type = SIGNAL_TYPES.VSS;
        }

        for (const signal of jsonData.signals) {
            saveData(signal.name, signal.value);
        }

        serverInfo.socket.emit("set", jsonData);
        serverInfo.socket.off("set");
        serverInfo.socket.on("set", (msg) => {
            serverInfo.socket.off("set");
            if (callback) {
                callback(msg);
            }
        });
    }
};

export const getSignals = (jsonData, callback) => {
    if (serverInfo.serverFound) {
        if (!jsonData.type) {
            jsonData.type = SIGNAL_TYPES.VSS;
        }
        serverInfo.socket.emit("get", jsonData);
        serverInfo.socket.off("get");
        serverInfo.socket.on("get", (msg) => {
            serverInfo.socket.off("get");
            if (callback) {
                callback(msg);
            }
        });
    }
};

export const subscribeSignals = (jsonData, callback) => {
    if (!jsonData.client) {
        jsonData.client = clientInfo.name;
        jsonData.channel = clientInfo.name + "/" + jsonData.channel;
    }

    const channel = jsonData.channel;
    subscriptionDataMap.set(channel, jsonData);
    channelCallbackMap.set(channel, callback);

    if (serverInfo.serverFound) {
        serverInfo.socket.emit("subscribe", jsonData);
        serverInfo.socket.off("notify/" + channel);
        serverInfo.socket.on("notify/" + channel, callback);
    }
};

export const unsubscribeSignals = (jsonData) => {
    const channel = jsonData.channel;
    subscriptionDataMap.delete(channel);
    channelCallbackMap.delete(channel);
    
    if (serverInfo.serverFound) {
        serverInfo.socket.emit("unsubscribe", jsonData);
        serverInfo.socket.off("notify/" + channel);
    }
};

export const subscribeChannel = (channel, signalArray) => {
    const signals = [];
    for (const signalObj of signalArray) {
        const signal = signalObj.signal;
        signals.push({ name: signal.name });

        const uniqueName = channel + "/" + signal.name;
        if (signalObj.callback) {
            signalCallbackMap.set(uniqueName, signalObj.callback);
        }
        else {
            if (signal.datatype === "boolean") {
                signalCallbackMap.set(uniqueName, (value) => signalObj.setter(value === "True"));
            }
            else {
                signalCallbackMap.set(uniqueName, (value) => signalObj.setter(value));
            }
        }
    }

    const msgCallback = (msg) => {
        for (const signal of msg.signals) {
            if (signal.value != null && signal.value !== "undefined") {
                const uniqueName = channel + "/" + signal.name;
                const callback = signalCallbackMap.get(uniqueName);
                if (callback) {
                    callback(signal.value);
                }
            }
        }
    };

    subscribeSignals({
        channel: channel,
        type: SIGNAL_TYPES.VSS,
        signals: signals
    }, msgCallback);
};

export const unsubscribeChannel = (channel) => {
    const uniqueChannel = clientInfo.name + "/" + channel;
    if (subscriptionDataMap.has(uniqueChannel)) {
        unsubscribeSignals(subscriptionDataMap.get(uniqueChannel));
    }
};

export const getServerIP = () => {
    return "http://" + serverInfo.SERVER_IP;
};

export const startVSS = () => {
    talkToServer();

    if (watchdogChannel.intervalHandle) {
        clearInterval(watchdogChannel.intervalHandle);
    }
    watchdogChannel.intervalHandle = setInterval(() => {
        const date = new Date();
        const thisTime = date.getTime();
        if (watchdogChannel.lastTime !== -1) {
            const timeDelta = thisTime - watchdogChannel.lastTime;
            if (timeDelta > 5000) {
                watchdogChannel.timeoutCounter = 0;
                serverInfo.serverFound = false;
            }
        }
        watchdogChannel.lastTime = thisTime;

        if (watchdogChannel.timeoutCounter > 0) {
            watchdogChannel.timeoutCounter--;
            if (watchdogChannel.timeoutCounter === 0) {
                serverInfo.serverFound = false;
            }
        }

        if (!serverInfo.serverFound) {
            talkToServer();
        }
        else {
            refreshWatchdog();
        }
    }, 1000);
};

export const pauseVSS = () => {
    serverInfo.socket.off("watchdog/" + clientInfo.name);
    if (watchdogChannel.intervalHandle) {
        clearInterval(watchdogChannel.intervalHandle);
        watchdogChannel.intervalHandle = null;
    }
};

const talkToServer = () => {
    watchdogChannel.heartbeat++;

    const jsonData = {
        name: clientInfo.name,
        value: watchdogChannel.heartbeat
    };

    serverInfo.socket.emit("watchdog", jsonData);
    serverInfo.socket.off("watchdog/" + clientInfo.name);
    serverInfo.socket.on("watchdog/" + clientInfo.name, (res) => {
        serverInfo.socket.off("watchdog/" + clientInfo.name);
        if (!serverInfo.serverFound) {
            clientInfo.name = res.name;
            saveData(KEY_CLIENT_NAME, clientInfo.name);
            serverInfo.serverFound = true;
            setTimeout(() => {
                subscriptionDataMap.forEach((subscriptionData, channel) => {
                    subscribeSignals(subscriptionData, channelCallbackMap.get(channel));
                });
            }, SUBSCRIPTION_DELAY);

            for (const signal of IN_SIGNALS) {
                signal.value = getDataSafely(signal.name, signal.value);
            }
            setSignals({ signals : IN_SIGNALS });

            let timeout = 0;
            for (const zoneSignals of OUT_SIGNALS) {
                for (const signal of zoneSignals.signals) {
                    signal.value = getDataSafely(signal.name, signal.value);
                }
                
                let index = 0;
                while (index < zoneSignals.signals.length) {
                    const jsonData = {
                        signals: zoneSignals.signals.slice(index, index + 4)
                    };
                    setTimeout(() => setSignals(jsonData), timeout);
                    index += 4;
                    timeout += 100;
                }
            }
        }
    });
};

const refreshWatchdog = () => {
    watchdogChannel.heartbeat++;

    const jsonData = {
        name: clientInfo.name,
        value: watchdogChannel.heartbeat
    };

    serverInfo.socket.emit("watchdog", jsonData);
    serverInfo.socket.off("watchdog/" + clientInfo.name);
    serverInfo.socket.on("watchdog/" + clientInfo.name, () => {
        serverInfo.socket.off("watchdog/" + clientInfo.name);
        watchdogChannel.timeoutCounter = 5;
    });
};

const LightSwitchType = vssApi.Vehicle.Body.Lights.LightSwitch;
const FrontWipingType = vssApi.Vehicle.Body.Windshield.Front.Wiping;
const HMIType = vssApi.Vehicle.Cabin.Infotainment.HMI;
const ChargingType = vssApi.Vehicle.Powertrain.TractionBattery.Charging;

// Vehicle Computer
const IN_SIGNALS = [
    { name: "Vehicle.Cabin.Infotainment.HMI.Brightness", value: 100 },
    { name: "Vehicle.Cabin.Infotainment.HMI.CurrentLanguage", value: "en" },
    { name: "Vehicle.Cabin.Infotainment.HMI.DateFormat", value: HMIType.DateFormat.allowed.YYYY_MM_DD },
    { name: "Vehicle.Cabin.Infotainment.HMI.DayNightMode", value: HMIType.DayNightMode.allowed.DAY },
    { name: "Vehicle.Cabin.Infotainment.HMI.DisplayOffDuration", value: 0 },
    { name: "Vehicle.Cabin.Infotainment.HMI.DistanceUnit", value: HMIType.DistanceUnit.allowed.KILOMETERS },
    { name: "Vehicle.Cabin.Infotainment.HMI.EVEconomyUnits", value: HMIType.EVEconomyUnits.allowed.KILOMETERS_PER_KILOWATT_HOUR },
    { name: "Vehicle.Cabin.Infotainment.HMI.EVEnergyUnits", value: HMIType.EVEnergyUnits.allowed.KILOWATT_HOURS },
    { name: "Vehicle.Cabin.Infotainment.HMI.FontSize", value: HMIType.FontSize.allowed.STANDARD },
    { name: "Vehicle.Cabin.Infotainment.HMI.IsScreenAlwaysOn", value: "False" },
    { name: "Vehicle.Cabin.Infotainment.HMI.LastActionTime", value: "" },
    { name: "Vehicle.Cabin.Infotainment.HMI.SpeedUnit", value: HMIType.SpeedUnit.allowed.KILOMETERS_PER_HOUR },
    { name: "Vehicle.Cabin.Infotainment.HMI.TemperatureUnit", value: HMIType.TemperatureUnit.allowed.C },
    { name: "Vehicle.Cabin.Infotainment.HMI.TimeFormat", value: HMIType.TimeFormat.allowed.HR_12 },
    { name: "Vehicle.Cabin.Infotainment.HMI.TirePressureUnit", value: HMIType.TirePressureUnit.allowed.PSI },
    { name: "Vehicle.CurrentLocation.Heading", value: 0 },
    { name: "Vehicle.CurrentLocation.Latitude", value: 37.486592 },
    { name: "Vehicle.CurrentLocation.Longitude", value: 127.1136256 },
    { name: "Vehicle.CurrentLocation.Timestamp", value: "" },
    { name: "Vehicle.Powertrain.Range", value: 500000 },
    { name: "Vehicle.TraveledDistance", value: 0 },
    { name: "Vehicle.TraveledDistanceSinceStart", value: 0 },
];

const OUT_SIGNALS = [
    // FRONT
    {
        zone: 0,
        signals: [
            { name: "Vehicle.Body.Horn.IsActive", value: "False" },
            { name: "Vehicle.Body.Lights.Beam.Low.IsOn", value: "False" },
            { name: "Vehicle.Body.Lights.Beam.High.IsOn", value: "False" },
            { name: "Vehicle.Body.Lights.Hazard.IsSignaling", value: "False" },
            { name: "Vehicle.Body.Lights.IsHighBeamSwitchOn", value: "False" },
            { name: "Vehicle.Body.Lights.LightSwitch", value: LightSwitchType.allowed.OFF },
            { name: "Vehicle.Body.Lights.Parking.IsOn", value: "False" },
            { name: "Vehicle.Body.Lights.Running.IsOn", value: "False" },
            { name: "Vehicle.Body.Raindetection.Intensity", value: 0 },
            { name: "Vehicle.Body.Trunk.Front.IsOpen", value: "False" },
            { name: "Vehicle.Body.Trunk.Front.IsLocked", value: "False" },
            { name: "Vehicle.Body.Windshield.Front.Wiping.Mode", value: FrontWipingType.Mode.allowed.OFF },
            { name: "Vehicle.Cabin.HVAC.IsAirConditioningActive", value: "False" },
            { name: "Vehicle.Cabin.HVAC.IsFrontDefrosterActive", value: "False" },
            { name: "Vehicle.Cabin.HVAC.IsRecirculationActive", value: "False" },
            { name: "Vehicle.Cabin.HVAC.Station.Row1.Driver.AirDistribution", value: vssApi.Vehicle.Cabin.HVAC.Station.Row1.Driver.AirDistribution.allowed.UP },
            { name: "Vehicle.Cabin.HVAC.Station.Row1.Driver.Temperature", value: 25 },
            { name: "Vehicle.Cabin.HVAC.Station.Row1.Passenger.Temperature", value: 25 },
            { name: "Vehicle.Cabin.IsWindowChildLockEngaged", value: "False" },
            { name: "Vehicle.Cabin.Light.IsGloveBoxOn", value: "False" },
            { name: "Vehicle.Exterior.AirTemperature", value: 25 },
            { name: "Vehicle.Exterior.Humidity", value: 50 },
            { name: "Vehicle.Exterior.LightIntensity", value: 100 },
            { name: "Vehicle.Powertrain.Transmission.SelectedGear", value: 126 },
            { name: "Vehicle.Speed", value: 0 },
        ]
    },
    // LEFT
    {
        zone: 1,
        signals: [
            { name: "Vehicle.Body.Lights.DirectionIndicator.Left.IsSignaling", value: "False" },
            { name: "Vehicle.Body.Mirrors.DriverSide.IsFolded", value: "False" },
            { name: "Vehicle.Cabin.Door.Row1.DriverSide.IsLocked", value: "False" },
            { name: "Vehicle.Cabin.Door.Row1.DriverSide.IsOpen", value: "False" },
            { name: "Vehicle.Cabin.Door.Row1.DriverSide.Window.Position", value: 0 },
            { name: "Vehicle.Cabin.Door.Row2.DriverSide.IsChildLockActive", value: "False" },
            { name: "Vehicle.Cabin.Door.Row2.DriverSide.IsLocked", value: "False" },
            { name: "Vehicle.Cabin.Door.Row2.DriverSide.IsOpen", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row1.DriverSide.IsBelted", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row1.DriverSide.IsOccupied", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row1.DriverSide.Switch.IsWarmerEngaged", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row2.DriverSide.IsBelted", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row2.DriverSide.IsOccupied", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row2.DriverSide.Switch.IsWarmerEngaged", value: "False" },
        ]
    },
    // RIGHT
    {
        zone: 2,
        signals: [
            { name: "Vehicle.Body.Lights.DirectionIndicator.Right.IsSignaling", value: "False" },
            { name: "Vehicle.Body.Mirrors.PassengerSide.IsFolded", value: "False" },
            { name: "Vehicle.Cabin.Door.Row1.PassengerSide.IsLocked", value: "False" },
            { name: "Vehicle.Cabin.Door.Row1.PassengerSide.IsOpen", value: "False" },
            { name: "Vehicle.Cabin.Door.Row1.PassengerSide.Window.Position", value: 0 },
            { name: "Vehicle.Cabin.Door.Row2.PassengerSide.IsChildLockActive", value: "False" },
            { name: "Vehicle.Cabin.Door.Row2.PassengerSide.IsLocked", value: "False" },
            { name: "Vehicle.Cabin.Door.Row2.PassengerSide.IsOpen", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row1.PassengerSide.IsBelted", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row1.PassengerSide.IsOccupied", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row1.PassengerSide.Switch.IsWarmerEngaged", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row2.PassengerSide.IsBelted", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row2.PassengerSide.IsOccupied", value: "False" },
            { name: "Vehicle.Cabin.Seat.Row2.PassengerSide.Switch.IsWarmerEngaged", value: "False" },
        ]
    },
    // REAR
    {
        zone: 3,
        signals: [
            { name: "Vehicle.Body.Trunk.Rear.IsLocked", value: "False" },
            { name: "Vehicle.Body.Trunk.Rear.IsOpen", value: "False" },
            { name: "Vehicle.Cabin.HVAC.IsRearDefrosterActive", value: "False" },
            { name: "Vehicle.Powertrain.TractionBattery.Charging.ChargingPort.AnyPosition.IsFlapOpen", value: "False" },
            { name: "Vehicle.Powertrain.TractionBattery.Charging.StartStopCharging", value: ChargingType.StartStopCharging.allowed.STOP },
        ]
    },
];

export const initBoolFromVSS = (type) => {
    return getData(type.name) === "True" ? true : false;
};

export const initEnumFromVSS = (type) => {
    const vssVal = getData(type.name);
    if (type.name === LightSwitchType.name) {
        return getLightSwitch(vssVal);
    }
    else if (type.name === FrontWipingType.Mode.name) {
        return getFrontWipingMode(vssVal);
    }
    else if (type.name === HMIType.DayNightMode.name) {
        return vssVal === HMIType.DayNightMode.allowed.NIGHT ? "Dark" : "Light";
    }
    else if (type.name === HMIType.TimeFormat.name) {
        return vssVal === HMIType.TimeFormat.allowed.HR_12 ? "12 Hour" : "24 Hour";
    }
    else if (type.name === HMIType.DistanceUnit.name) {
        return vssVal === HMIType.DistanceUnit.allowed.KILOMETERS ? "Kilometers" : "Miles";
    }
    else if (type.name === HMIType.TemperatureUnit.name) {
        return vssVal === HMIType.TemperatureUnit.allowed.F ? "\u00B0F" : "\u00B0C";
    }
    else if (type.name === HMIType.TirePressureUnit.name) {
        return vssVal === HMIType.TirePressureUnit.allowed.BAR ? "Bar" : "PSI";
    }
    return "";
};

export const getVssFromEnum = (type, enumVal) => {
    if (type.name === LightSwitchType.name) {
        return getVssLightSwitch(enumVal);
    }
    else if (type.name === FrontWipingType.Mode.name) {
        return getVssFrontWipingMode(enumVal);
    }
    else if (type.name === HMIType.DayNightMode.name) {
        return enumVal === "Dark" ? HMIType.DayNightMode.allowed.NIGHT : HMIType.DayNightMode.allowed.DAY;
    }
    else if (type.name === HMIType.TimeFormat.name) {
        return enumVal === "12 Hour" ? HMIType.TimeFormat.allowed.HR_12 : HMIType.TimeFormat.allowed.HR_24;
    }
    else if (type.name === HMIType.DistanceUnit.name) {
        return enumVal === "Kilometers" ? HMIType.DistanceUnit.allowed.KILOMETERS : HMIType.DistanceUnit.allowed.MILES;
    }
    else if (type.name === HMIType.TemperatureUnit.name) {
        return enumVal === "\u00B0F" ? HMIType.TemperatureUnit.allowed.F : HMIType.TemperatureUnit.allowed.C;
    }
    else if (type.name === HMIType.TirePressureUnit.name) {
        return enumVal === "Bar" ? HMIType.TirePressureUnit.allowed.BAR : HMIType.TirePressureUnit.allowed.PSI;
    }
    return "";
};

const getLightSwitch = (vssVal) => {
    if (vssVal === LightSwitchType.allowed.POSITION) {
        return "Parking";
    }
    else if (vssVal === LightSwitchType.allowed.BEAM) {
        return "On";
    }
    else if (vssVal === LightSwitchType.allowed.AUTO) {
        return "Auto";
    }
    else {
        return "Off";
    }
};

const getFrontWipingMode = (vssVal) => {
    if (vssVal === FrontWipingType.Mode.allowed.INTERVAL) {
        return "I";
    }
    else if (vssVal === FrontWipingType.Mode.allowed.SLOW) {
        return "II";
    }
    else if (vssVal === FrontWipingType.Mode.allowed.MEDIUM) {
        return "III";
    }
    else if (vssVal === FrontWipingType.Mode.allowed.FAST) {
        return "IIII";
    }
    else if (vssVal === FrontWipingType.Mode.allowed.RAIN_SENSOR) {
        return "Auto";
    }
    else {
        return "Off";
    }
};

const getVssLightSwitch = (enumVal) => {
    if (enumVal === "Parking") {
        return LightSwitchType.allowed.POSITION;
    }
    else if (enumVal === "On") {
        return LightSwitchType.allowed.BEAM;
    }
    else if (enumVal === "Auto") {
        return LightSwitchType.allowed.AUTO;
    }
    else {
        return LightSwitchType.allowed.OFF;
    }
};

const getVssFrontWipingMode = (enumVal) => {
    if (enumVal === "I") {
        return FrontWipingType.Mode.allowed.INTERVAL;
    }
    else if (enumVal === "II") {
        return FrontWipingType.Mode.allowed.SLOW;
    }
    else if (enumVal === "III") {
        return FrontWipingType.Mode.allowed.MEDIUM;
    }
    else if (enumVal === "IIII") {
        return FrontWipingType.Mode.allowed.FAST;
    }
    else if (enumVal === "Auto") {
        return FrontWipingType.Mode.allowed.RAIN_SENSOR;
    }
    else {
        return FrontWipingType.Mode.allowed.OFF;
    }
};

export const sendToServer = (name, params, callback) => {
    const req_name = name + "/req";
    const res_name = name + "/res";
    serverInfo.socket.emit(req_name, params);
    serverInfo.socket.off(res_name);
    serverInfo.socket.on(res_name, (res) => {
        serverInfo.socket.off(res_name);
        callback(res);
    });
};
