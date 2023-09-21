import { Server } from "socket.io";
import { 
    setSignal as setRawSignal, 
    getSignal as getRawSignal
} from '../carplug_core/signal_db.js';
import { 
    initExtDB,
    getExtData,
    setExtData
} from "./ExtraDataSet.js";
import { 
    initVssDB, 
    getSignal as getVssSignal, 
    setSignal as setVssSignal 
} from "./vss_db.js";
import {
    initConverterMap, canToVssMap, vssToCanMap
} from "./signalConverter.js";


const SIGNAL_TYPES = {
    RAW: "raw", // CAN
    VSS: "vss", // COVESA Vehicle Signal Spec
    EXT: "ext"  // Extended
};

const subscribedChannels = new Map();


function setSignal(signal) {
    if (signal.type === SIGNAL_TYPES.VSS) {
        return setVssSignal(signal.name, signal.value);
    }
    else if (signal.type === SIGNAL_TYPES.EXT) {
        return setExtData(signal.name, signal.value);
    }
    else {
        return setRawSignal(signal.name, signal.value);
    }
}

function getSignal(signal) {
    if (signal.type === SIGNAL_TYPES.VSS) {
        return getVssSignal(signal.name);
    }
    else if (signal.type === SIGNAL_TYPES.EXT) {
        return getExtData(signal.name);
    }
    else {
        return getRawSignal(signal.name);
    }
}

function getSignalValue(signal, type) {
    if (type === SIGNAL_TYPES.RAW) {
        return signal.physicalValue;
    }
    else {
        return signal.value;
    }
}

function setSignalValue(signal, value, type) {
    if (type === SIGNAL_TYPES.RAW) {
        signal.physicalValue = value;
    }
    else {
        signal.value = value;
    }
}

export function initVehicleSocketIO(httpServer) {

    initVssDB();
    initExtDB();
    initConverterMap();

    const IO = new Server(httpServer, { cors: { origin: "*" } });

    IO.on('connection', (socket) => {

        // Init VSS signals
        canToVssMap.forEach((conv_func, canSig) => {
            const canSigObj = getRawSignal(canSig);
            if (canSigObj) {
                conv_func(canSigObj.physicalValue);
            }
        });

        socket.on("set", msg => {
            if (msg.signals) {
                const jsonResp = {
                    signals: [],
                };

                for (const signalReq of msg.signals) {
                    const signal = setSignal(signalReq);
                    if (signal != null) {
                        const newValue = getSignalValue(signal, signalReq.type);
                        jsonResp.signals.push({
                            name  : signal.name,
                            value : newValue,
                            type  : signalReq.type
                        });
                        if (signalReq.type === SIGNAL_TYPES.RAW) {
                            if (canToVssMap.has(signal.name)) {
                                (canToVssMap.get(signal.name))(newValue);
                            }
                        }
                        else if (signalReq.type === SIGNAL_TYPES.VSS) {
                            if (vssToCanMap.has(signal.name)) {
                                (vssToCanMap.get(signal.name))(newValue);
                            }
                        }
                    }
                }

                IO.emit("set", jsonResp);
            }
        });

        socket.on("get", msg => {
            if (msg.signals) {
                const jsonResp = {
                    signals: [],
                };
                for (const signalReq of msg.signals) {
                    const signal = getSignal(signalReq);
                    if (signal != null) {
                        jsonResp.signals.push({
                            name  : signal.name,
                            value : getSignalValue(signal, signalReq.type),
                            type  : signalReq.type
                        });
                    }
                }
                IO.emit("get", jsonResp);
            }
        });

        socket.on("subscribe", msg => {
            if (msg.signals && msg.channel) {
                const jsonResp = {
                    signals: [],
                    channel: msg.channel,
                    type: msg.type
                };
                for (const signalReq of msg.signals) {
                    const signal = getSignal(signalReq);
                    if (signal != null) {
                        jsonResp.signals.push({
                            name  : signal.name,
                            value : getSignalValue(signal, signalReq.type),
                            type  : signalReq.type
                        });
                    }
                }

                subscribedChannels.set(msg.channel, jsonResp);
                IO.emit("notify/" + msg.channel, jsonResp);
            }
        });

        socket.on("unsubscribe", msg => {
            if (msg.channel) {
                subscribedChannels.delete(msg.channel);
            }
        });
    });

    setInterval(() => {
        for (const key of subscribedChannels.keys()) {
            const jsonResp = {
                signals: [],
                channel: key
            };

            const storedResponse = subscribedChannels.get(key);
            const oldSignals = storedResponse.signals;
            for (const oldSignal of oldSignals) {
                const newSignal = getSignal(oldSignal);
                if (newSignal != null) {
                    const type = oldSignal.type;
                    const oldValue = getSignalValue(oldSignal, type);
                    const newValue = getSignalValue(newSignal, type);
                    if (newValue !== oldValue) {
                        setSignalValue(oldSignal, newValue, type);
                        jsonResp.signals.push({
                            name  : newSignal.name,
                            value : newValue,
                            type  : type
                        });
                    }
                }
            }

            if (jsonResp.signals.length > 0) {
                IO.emit("notify/" + key, jsonResp);
            }
        }
    }, 100);
}
