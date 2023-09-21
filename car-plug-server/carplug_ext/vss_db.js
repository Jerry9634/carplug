import { readFile } from 'fs';


const signalMap = new Map();


function getSubTree(node, path) {
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
	readFile('./carplug_ext/VssDB.json', function(err, data) {
		const jsonData = JSON.parse(data);

		Object.keys(jsonData).forEach((key) => {
			getSubTree(jsonData[key], key);
		});
	});
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
