
const map = new Map();

export function setValue(key, value) {
    map.set(key, value);
}

export function getValue(key) {
    return map.get(key);
}
