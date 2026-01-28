import vssJSON from "./vss.json" with { type: "json" };

const signalMap = new Map();


const getSubTree = (node, path) => {
    if (node.type === 'branch') {
        for (const key in node.children) {
            getSubTree(node.children[key], path + "." + key, key);
        }
    }
    else {
        if (node.default !== null) {
            node.value = node.default;
        }
        else {
            node.value = "undefined";
        }
        signalMap.set(path, node);
    }
};

export const initVssDB = () => {
    for (const key in vssJSON) {
        getSubTree(vssJSON[key], key);
    }
};

export const getSignal = (name) => {
    return signalMap.get(name);
};

export const setSignal = (name, value) => {
    const signal = signalMap.get(name);
    if (signal) {
        signal.value = value;
    }
    return signal;
};
