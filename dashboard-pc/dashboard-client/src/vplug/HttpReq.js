import { getServerPort } from "./WsReq";

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
    // set url
    const url = getServerPort() + "/carplug/set";

    let requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
    };

    fetch(url, requestOptions)
    .then((response) => response.json())
    .then((json) => {
        if (json.signals != null && json.signals.length > 0) {
            if (callback != null) {
                callback(json);
            }
        }
    })
    .catch((error) => {
        //
    });
};

export const getSignals = (jsonData, callback) => {
    // get url
    const url = getServerPort() + "/carplug/get";

    let requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
    };

    fetch(url, requestOptions)
    .then((response) => response.json())
    .then((json) => {
        if (json.signals != null && json.signals.length > 0) {
            if (callback != null) {
                callback(json);
            }
        }
    })
    .catch((error) => {
        //
    });
};
