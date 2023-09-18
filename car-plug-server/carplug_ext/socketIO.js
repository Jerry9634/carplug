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

const subscribedChannels = new Map();

function setSignal(name, value, type) {
    if (type === "vss") {
        return setVssSignal(name, value);
    }
    else if (type === "ext") {
        return setExtData(name, value);
    }
    else {
        return setRawSignal(name, value);
    }
}

function getSignal(name, type) {
    if (type === "vss") {
        return getVssSignal(name);
    }
    else if (type === "ext") {
        return getExtData(name);
    }
    else {
        return getRawSignal(name);
    }
}

function getSignalValue(signal, type) {
    if (type === "raw") {
        return signal.physicalValue;
    }
    else {
        return signal.value;
    }
}

function setSignalValue(signal, value, type) {
    if (type === "raw") {
        signal.physicalValue = value;
    }
    else {
        signal.value = value;
    }
}

export function initVehicleSocketIO(httpServer) {

    initVssDB();
    initExtDB();

    const IO = new Server(httpServer, { cors: { origin: "*" } });

    IO.on('connection', (socket) => {
        socket.on("set", msg => {
            if (msg.signals) {
                const jsonResp = {
                    signals: [],
                };

                for (const requestedSignal of msg.signals) {
                    const signal = setSignal(requestedSignal.name, requestedSignal.value, msg.type);
                    if (signal != null) {
                        jsonResp.signals.push({
                            name  : signal.name,
                            value : getSignalValue(signal, msg.type)
                        });
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
                for (const requestedSignal of msg.signals) {
                    const signal = getSignal(requestedSignal.name, msg.type);
                    if (signal != null) {
                        jsonResp.signals.push({
                            name  : signal.name,
                            value : getSignalValue(signal, msg.type)
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
                for (const requestedSignal of msg.signals) {
                    const signal = getSignal(requestedSignal.name, msg.type);
                    if (signal != null) {
                        jsonResp.signals.push({
                            name: signal.name,
                            value: getSignalValue(signal, msg.type)
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
            const type = storedResponse.type;
            for (const oldSignal of oldSignals) {
                const newSignal = getSignal(oldSignal.name, type);
                if (newSignal != null) {
                    const oldValue = getSignalValue(oldSignal, type);
                    const newValue = getSignalValue(newSignal, type);
                    if (newValue !== oldValue) {
                        setSignalValue(oldSignal, newValue, type);
                        jsonResp.signals.push({
                            name  : newSignal.name,
                            value : newValue
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
