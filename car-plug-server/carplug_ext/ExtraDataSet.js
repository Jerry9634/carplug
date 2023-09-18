export const extraDataSet = {
	signals: [
		{ name: "time", 				value: 0  },
		{ name: "latitude", 			value: 0  },
		{ name: "longitude", 			value: 0  },
		{ name: "heading", 				value: 0  },
		{ name: "pitch", 				value: 0  },
		{ name: "speed", 				value: 0  },
		{ name: "destination", 			value: "" },
		{ name: "distanceToDirection",	value: 0  },
		{ name: "maneuver", 			value: "" },
		{ name: "direction",			value: "" },
	]
};

export const extraDataMap = new Map();

export function initExtDB() {
	for (const signal of extraDataSet.signals) {
		extraDataMap.set(signal.name, signal);
	}
}

export function getExtData(name) {
	return extraDataMap.get(name);
}

export function setExtData(name, value) {
	const signal = extraDataMap.get(name);
	if (signal) {
		signal.value = value;
	}
	return signal;
}
