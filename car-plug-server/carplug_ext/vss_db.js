import { readFile } from 'fs';
import { Buffer } from 'node:buffer';


const signalMap = new Map();



function getSubTree(node, path, name) {
	const children = node['children'];
	if (node['type'] === 'branch') {
		Object.keys(children).forEach((key) => {
			getSubTree(children[key], path + "." + key, key);
		});
	}
	else {
		if (node.default) {
			node.value = node.default;
		}
		else {
			node.value = "undefined";
		}
		signalMap.set(path, node);
	}
}

export function initVssDB() {
	readFile('./carplug_ext/VssAPI.json', function(err, data) {
		const jsonData = JSON.parse(data);

		Object.keys(jsonData).forEach((key) => {
			getSubTree(jsonData[key], key, key);
		});
	});
}

export function getSignal(name) {
	return signalMap.get(name);
}

export function setSignal(name, value) {
	const signal = signalMap.get(name);
	signal.value = value;
	return signal;
}
