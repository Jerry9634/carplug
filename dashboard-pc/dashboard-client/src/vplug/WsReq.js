import SocketIOClient from 'socket.io-client';

var SERVER_IP = "localhost";
var socket = SocketIOClient("http://" + SERVER_IP + ":3501");
var serverFound = false;

export const setSignal = (signalName, physicalValue) => {
    let jsonData = {
        signals: [{ name: signalName, value: physicalValue }]
    };
    setSignals(jsonData);
};

export const getSignal = (signalName, callback) => {
    let jsonData = {
        signals: [{ name: signalName, value: null }]
    };
    getSignals(jsonData, (json) => {
        if (json.signals != null && json.signals.length > 0) {
            if (callback != null) {
                callback(json.signals[0].value);
            }
        }
    });
};

export const setSignals = (jsonData, callback = null) => {
    socket.emit("set", jsonData);
    if (callback) {
        socket.on("set", callback);
    }
};

export const getSignals = (jsonData, callback) => {
    socket.emit("get", jsonData);
    if (callback) {
        socket.on("get", callback);
    }
};

export const subscribeSignals = (jsonData, callback = null) => {
    socket.emit("subscribe", jsonData);
    if (callback) {
        socket.on("notify/" + jsonData.channel, callback);
    }
}

export const unsubscribeSignals = (jsonData, callback = null) => {
    socket.emit("unsubscribe", jsonData);
    socket.off("notify/" + jsonData.channel);
}

export const getServerPort = () => {
    return "http://" + SERVER_IP + ":5001";
}

export const getServerIP = () => {
    return "http://" + SERVER_IP;
}

export const findServer = async () => {
    const url = "http://localhost:5000";
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 500);

    fetch(url, { signal: controller.signal })
    .then((response) => response.json())
    .then((json) => {
        if (json != null && json.ip != null) {
            //console.log(json.ip);
            setServer(json.ip);
        }
    })
   .catch((error) => {
        controller.abort();
    });
}

function setServer(ip) {
    if (!serverFound) {
        serverFound = true;
        if (ip !== SERVER_IP) {
            SERVER_IP = ip;
            socket.disconnect();
            socket.close();
            socket = SocketIOClient("http://" + ip + ":3501");
        }
    }
}

export const setExtData = (jsonData, callback = null) => {
    socket.emit("set-ext", jsonData);
    if (callback) {
        socket.on("set-ext", callback);
    }
};

export const getExtData = (jsonData, callback) => {
    socket.emit("get-ext", jsonData);
    if (callback) {
        socket.on("get-ext", callback);
    }
};

export const subscribeExtData = (jsonData, callback = null) => {
    socket.emit("subscribe-ext", jsonData);
    if (callback) {
        socket.on("notify-ext/" + jsonData.channel, callback);
    }
}

export const unsubscribeExtData = (jsonData, callback = null) => {
    socket.emit("unsubscribe-ext", jsonData);
    socket.off("notify-ext/" + jsonData.channel);
}
