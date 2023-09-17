import { Server } from "socket.io";
import { setSignal, getSignal } from './carplug_core/signal_db.js';
import { extraDataSet } from "./ExtraDataSet.js";

const subscribedChannels = new Map();
const subscribedExtDataChannels = new Map();

export function initVehicleSocketIO(httpServer) {
    const IO = new Server(httpServer, { cors: { origin: "*" } });

    IO.on('connection', (socket) => {
        socket.on("set", msg => {
            if (msg && msg.signals) {
                const jsonResp = {
                    signals: [],
                };

                for (const requestedSignal of msg.signals) {
                    const signal = setSignal(requestedSignal.name, requestedSignal.value);
                    if (signal != null) {
                        jsonResp.signals.push({
                            name  : requestedSignal.name,
                            value : signal.physicalValue
                        });
                    }
                }

                IO.emit("set", jsonResp);
            }
        });

        socket.on("get", msg => {
            if (msg && msg.signals) {
                const jsonResp = {
                    signals: [],
                };

                for (const requestedSignal of msg.signals) {
                    const signal = getSignal(requestedSignal.name);
                    if (signal != null) {
                        jsonResp.signals.push({
                            name  : requestedSignal.name,
                            value : signal.physicalValue
                        });
                    }
                }

                IO.emit("get", jsonResp);
            }
        });

        socket.on("subscribe", msg => {
            if (msg && msg.signals && msg.channel) {
                const jsonResp = {
                    signals: [],
                    channel: msg.channel
                };
                for (const requestedSignal of msg.signals) {
                    const signal = getSignal(requestedSignal.name);
                    if (signal != null) {
                        jsonResp.signals.push({
                            name: signal.name,
                            value: signal.physicalValue
                        });
                    }
                }

                subscribedChannels.set(msg.channel, jsonResp.signals);
                IO.emit("notify/" + msg.channel, jsonResp);
            }
        });

        socket.on("unsubscribe", msg => {
            if (msg && msg.channel) {
                subscribedChannels.delete(msg.channel);
            }
        });

        socket.on("set-ext", msg => {
            if (msg) {
                Object.keys(msg).map((key) => {
                    extraDataSet[key] = msg[key];
                });

                IO.emit("set-ext", extraDataSet);
            }
        });

        socket.on("get-ext", msg => {
            if (msg) {
                IO.emit("get-ext", extraDataSet);
            }
        });

        socket.on("subscribe-ext", msg => {
            if (msg && msg.channel) {
                const dataCopy = Object.assign({}, extraDataSet);
                subscribedExtDataChannels.set(msg.channel, dataCopy);
                IO.emit("notify-ext/" + msg.channel, extraDataSet);
            }
        });

        socket.on("unsubscribe-ext", msg => {
            if (msg && msg.channel) {
                subscribedExtDataChannels.delete(msg.channel);
            }
        });
    });

    setInterval(() => {
        for (const key of subscribedChannels.keys()) {
            const jsonResp = {
                signals: [],
                channel: key
            };

            const signalsInChannel = subscribedChannels.get(key);
            for (const signalInChannel of signalsInChannel) {
                const signal = getSignal(signalInChannel.name);
                if (signal != null) {
                   if (signal.physicalValue !== signalInChannel.value) {
                        signalInChannel.value = signal.physicalValue;
                        jsonResp.signals.push({
                            name  : signal.name,
                            value : signal.physicalValue
                        });
                    }
                }
            }

            if (jsonResp.signals.length > 0) {
                IO.emit("notify/" + key, jsonResp);
            }
        }

        for (const key of subscribedExtDataChannels.keys()) {
            if (JSON.stringify(subscribedExtDataChannels.get(key)) !== JSON.stringify(extraDataSet)) {
                const dataCopy = Object.assign({}, extraDataSet);
                subscribedExtDataChannels.set(key, dataCopy);
                IO.emit("notify-ext/" + key, extraDataSet);
            }
        }
    }, 100);
}
