import { Server } from 'socket.io';

import { startCAN, send_udp, send_vss } from './udpCAN.js';
import { initVssDB, getSignal } from './vssDB.js';
import { sendHttpRequest, getOpenWeather, getRadioStreamingURLs } from './webApi.js';


export function initIO(httpServer, coipPort) {
    const socketIOServer = new Server(httpServer, {
        cors: { origin: "*" },
        maxHttpBufferSize: 2e8 // 200 MB,
    });
    const watchdogCounters = new Map();

    startSocketIO(socketIOServer, watchdogCounters);
    startCAN(coipPort, socketIOServer, watchdogCounters);
}


function startSocketIO(socketIOServer, watchdogCounters) {

    const IO = socketIOServer;

    const NOTIFY_INTERVAL = 100;
    const SUBSCRIPTION_DELAY = 1000;

    const subscribedChannels = new Map();

    function syncSubscribedSignals(client) {
        for (const channel of subscribedChannels.keys()) {
            const storedResponse = subscribedChannels.get(channel);
            if (client === storedResponse.client) {
                const oldSignals = storedResponse.signals;
                const type = storedResponse.type;
                const jsonResp = {
                    signals: [],
                    channel: channel,
                    type: type
                };

                for (const oldSignal of oldSignals) {
                    const name = oldSignal.name;
                    const newSignal = getSignal(name);
                    if (newSignal) {
                        const oldValue = oldSignal.value;
                        const newValue = newSignal.value;
                        if (newValue !== oldValue) {
                            oldSignal.value = newValue;
                        }
                        jsonResp.signals.push({
                            name: name,
                            value: newValue,
                        });
                    }
                }

                if (jsonResp.signals.length > 0) {
                    IO.emit("notify/" + channel, jsonResp);
                }
            }
        }
    }

    function needsUpdate(client) {
        if (client) {
            if (watchdogCounters.has(client)) {
                return (watchdogCounters.get(client) > 0);
            }
        }
        return false;
    }

    let client_count = 0;

    initVssDB();

    IO.on('connection', (socket) => {

        socket.on("set", msg => {
            if (msg.signals) {
                for (const signalReq of msg.signals) {
                    const signal = getSignal(signalReq.name);
                    if (signal) {
                        signalReq.type = signal.type;
                        signalReq.datatype = signal.datatype;
                        signal.value = signalReq.value;
                        //setVssSignal(signal.name, signalReq.value);
                    }
                }

                // send to real zone controllers
                send_vss(msg);
                IO.emit("set", msg);
            }
        });

        socket.on("get", msg => {
            if (msg.signals) {
                const type = msg.type;
                const jsonResp = {
                    signals: [],
                    type: type
                };
                for (const signalReq of msg.signals) {
                    const name = signalReq.name;
                    const signal = getSignal(name);
                    if (signal) {
                        jsonResp.signals.push({
                            name: name,
                            value: signal.value,
                        });
                    }
                }
                IO.emit("get", jsonResp);
            }
        });

        socket.on("subscribe", msg => {
            if (msg.signals && msg.channel) {
                const type = msg.type;
                const jsonResp = {
                    signals: [],
                    channel: msg.channel,
                    type: type,
                    client: msg.client
                };
                for (const signalReq of msg.signals) {
                    const name = signalReq.name;
                    const signal = getSignal(name);
                    if (signal) {
                        jsonResp.signals.push({
                            name: name,
                            value: signal.value,
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

        socket.on("watchdog", msg => {
            let client = msg.name;
            if (client) {
                if (watchdogCounters.has(client)) {
                    if (watchdogCounters.get(client) === 0) {
                        setTimeout(() => syncSubscribedSignals(client), SUBSCRIPTION_DELAY);
                    }
                }
                else {
                    client_count++;
                    // rename the client
                    const tokens = client.split("/");
                    client = tokens[0] + "/" + client_count.toString().padStart(4, "0");
                    console.log("New client connected:", client, msg.value);
                }
                watchdogCounters.set(client, 5000);

                const jsonResp = {
                    name: client,
                };
                IO.emit("watchdog/" + msg.name, jsonResp);
            }
        });

        socket.on("send_udp", (msg) => {
            send_udp(msg.data);
        });

        socket.on("watchdog_udp", (msg) => {
            if (msg === "heartbeat") {
                watchdogCounters.set("watchdog_udp", 1000);
            }
        });

        socket.on("httpRequest/req", (query) => {
            sendHttpRequest(query).then((result) => {
                IO.emit("httpRequest/res", result);
            });
        });

        socket.on("openweathermap/req", (msg) => {
            getOpenWeather(msg.apiKey, msg.latitude, msg.longitude, msg.city).then((data) => {
                IO.emit("openweathermap/res", data);
            });
        });

        socket.on("internet-radios/req", (msg) => {
            getRadioStreamingURLs(msg).then((data) => {
                IO.emit("internet-radios/res", data);
            });
        });
    });

    setInterval(() => {
        for (const client of watchdogCounters.keys()) {
            let value = watchdogCounters.get(client);
            value -= NOTIFY_INTERVAL;
            if (value < 0) {
                value = 0;
            }
            watchdogCounters.set(client, value);
        }
        for (const channel of subscribedChannels.keys()) {
            const storedResponse = subscribedChannels.get(channel);
            if (needsUpdate(storedResponse.client)) {
                const oldSignals = storedResponse.signals;
                const type = storedResponse.type;
                const jsonResp = {
                    signals: [],
                    channel: channel,
                    type: type
                };

                for (const oldSignal of oldSignals) {
                    const name = oldSignal.name;
                    const newSignal = getSignal(name);
                    if (newSignal) {
                        const oldValue = oldSignal.value;
                        const newValue = newSignal.value;
                        if (newValue !== oldValue) {
                            oldSignal.value = newValue;
                            jsonResp.signals.push({
                                name: name,
                                value: newValue,
                            });
                        }
                    }
                }

                if (jsonResp.signals.length > 0) {
                    IO.emit("notify/" + channel, jsonResp);
                }
            }
        }
    }, NOTIFY_INTERVAL);
}
