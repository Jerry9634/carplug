import vssJSON from './vss.json' with { type: 'json' };

const signalMap = new Map();


function getSubTree(node, path) {
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
}

export function initVssDB() {
    for (const key in vssJSON) {
        getSubTree(vssJSON[key], key);
    }
}

export function getSignal(name) {
    return signalMap.get(name);
}

export function setSignal(name, value) {
    const signal = signalMap.get(name);
    if (signal) {
        signal.value = value;
    }
    return signal;
}
