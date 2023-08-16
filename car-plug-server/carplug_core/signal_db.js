const {
	GATEWAY,
	TIME_BASE,

	CAN_DIRECTION_TX,
	CAN_DIRECTION_RX,
	
	DATA_BYTE_LEN_MAX,

	CAN_MSG_STATUS_UPDATED,
	CAN_MSG_STATUS_CHANGED,
	//CAN_MSG_STATUS_OVERWRITE,
	CAN_MSG_STATUS_NEVER_SENT,
	CAN_MSG_STATUS_NEVER_RECEIVED,
	CAN_MSG_STATUS_E2E_PROFILE_05,
	CAN_MSG_STATUS_E2E_PROFILE_11
} = require('./options');

var fs = require('fs');

const E_SIGNAL_OK                 = 0x01;
const E_SIGNAL_DEFINITION_INVALID = 0x02;
const E_INPUT_OUT_OF_RANGE        = 0x04;

const busMap = new Map();
const ecuMap = new Map();
const pduMap = new Map();
const pduIdMap = new Map();
const signalMap = new Map();

const txCanMessageGroups = new Map();
const rxCanMessageGroups = new Map();

const { Buffer } = require('node:buffer');

const canMessageStorage = {
	canMsgGroups : txCanMessageGroups,
	pduIdMap: pduIdMap,
	totalMessageCnt: 0
};


function initSignalDB(serverLoc) {
	fs.readFile('SignalDB.json', function(err, data) {
		const jsonData = JSON.parse(data);

		jsonData.pdus.forEach((pdu) => {
			if (!busMap.has(pdu.bus)) {
				busMap.set(pdu.bus, pdu.bus);
			}
			
			if (!ecuMap.has(pdu.sender)) {
				ecuMap.set(pdu.sender, pdu.sender);
			}
			
			if (!pduMap.has(pdu.name)) {
				pduMap.set(pdu.name, pdu);
				pduIdMap.set(pdu.id, pdu);
				
				addCanMessageObject(pdu, serverLoc);
			}
			
			for (const signal of pdu.signals) {
				signal.canId = pdu.id;
				signalMap.set(signal.name, signal);
				
				// set init value
				if (signal.length <= 32) {
					signal.value = physToRaw(signal.initValue, signal);
					signal.valueHigh = 0;
					signal.physicalValue = signal.initValue;
				}
				else {
					const bigValue = BigInt(signal.initValue.toString());
					signal.value = Number(bigValue % 0x100000000n);
					signal.valueHigh = Number(bigValue / 0x100000000n);
					signal.physicalValue = bigValue.toString();
				}
				
				if (signal.value != 0 || signal.valueHigh != 0) {
					insertSignal(pdu, signal);
				}
			}
		});
	});
}

function getCanMessageStorage() {
	return canMessageStorage;
}

function addCanMessageObject(pdu, serverLoc) {
	const dlc = pdu.DLC;
	pdu.dlc = dlc;
	pdu.data = Buffer.alloc(dlc);
	
	if (pdu.sender == "CGW_CCU") {
		if (serverLoc == GATEWAY) {
			pdu.direction = CAN_DIRECTION_RX;
		}
		else {
			pdu.direction = CAN_DIRECTION_TX;
		}
	}
	else {
		if (serverLoc == GATEWAY) {
			pdu.direction = CAN_DIRECTION_TX;
		}
		else {
			pdu.direction = CAN_DIRECTION_RX;
		}
	}
	
	if (pdu.profileName == "PROFILE_05") {
		pdu.status |= CAN_MSG_STATUS_E2E_PROFILE_05;
	}
	else if (pdu.profileName == "PROFILE_11") {
		pdu.status |= CAN_MSG_STATUS_E2E_PROFILE_11;
	}
	
	var canMsgGroup = null;
	const key = pdu.GenMsgCycleTime / TIME_BASE;
	
	if (pdu.direction == CAN_DIRECTION_TX) {
		if (!txCanMessageGroups.has(key)) {
			txCanMessageGroups.set(key, {
				cycle: pdu.GenMsgCycleTime,
				timer: key,
				direction: CAN_DIRECTION_TX,
				canMessages: []
			});
		}
		canMsgGroup = txCanMessageGroups.get(key);
		if (serverLoc == GATEWAY) {
			canMsgGroup.cycle2 = 1000,
			canMsgGroup.timer2 = 1000 / TIME_BASE;
		}
		pdu.status |= CAN_MSG_STATUS_NEVER_SENT;
	}
	else {
		if (!rxCanMessageGroups.has(key)) {
			rxCanMessageGroups.set(key, {
				cycle: pdu.GenMsgCycleTime,
				timer: key,
				direction: CAN_DIRECTION_RX,
				canMessages: []
			});
		}
		canMsgGroup = rxCanMessageGroups.get(key);
		pdu.status |= CAN_MSG_STATUS_NEVER_RECEIVED;
	}
	
	canMsgGroup.canMessages.push(pdu);
}

function getBusNum() {
	return busMap.size;
}

function getEcuNum() {
	return ecuMap.size;
}

function getPduNum() {
	return pduMap.size;
}

function getSignalNum() {
	return signalMap.size;
}

function extractSignal(msg, signal) {
	const startBitOffset = signal.startBit % 8;
	const endBit = signal.startBit + signal.length - 1;
	const endBitOffset = endBit % 8;
	const startByte = Math.floor(signal.startBit / 8);
	const endByte = Math.floor(endBit / 8);
	const byteLen = endByte - startByte + 1;

	// definition check
	if (signal.startBit >= (DATA_BYTE_LEN_MAX * 8) || signal.length == 0) {
		signal.error = E_SIGNAL_DEFINITION_INVALID;
	}
	// big value
	else if (signal.length >= 32) {
		if (startBitOffset != 0) {
			signal.error = E_SIGNAL_DEFINITION_INVALID;
		}
		else {
			signal.error = E_SIGNAL_OK;
			
			let sigVal = 0;
			let byteIndex = startByte;
			for (let i = 0; i < 4; i++, byteIndex++) {
				sigVal += msg.data[byteIndex] * (1 << (i * 8));
			}
			
			signal.value = sigVal;
			signal.physicalValue = rawToPhys(sigVal, signal);
			
			if (signal.length > 32) {
				const limit = byteLen - 4;
				let sigValHigh = 0;
				for (let i = 0; i < limit; i++, byteIndex++) {
					sigValHigh += msg.data[byteIndex] * (1 << (i * 8));
				}
				signal.valueHigh = sigValHigh;
				
				let physicalValue = BigInt(sigVal);
				physicalValue += BigInt(sigValHigh) * 0x100000000n;
				signal.physicalValue = physicalValue.toString();
			}
		}
	}
	else {
		signal.error = E_SIGNAL_OK;
		let sigVal = 0;
		
		for (let i = 0; i < byteLen; i++) {
			let maskLow = 0xFF;
			let maskHigh = 0xFF;

			if (i == 0) {
				if (startBitOffset != 0) {
					maskLow = (maskLow << startBitOffset) & 0xFF;
				}
				if ((byteLen == 1) && (endBitOffset != 7)) {
					maskHigh = maskHigh >>> (7 - endBitOffset);
				}
			}
			else if (i == (byteLen - 1)) {
				if (endBitOffset != 7) {
					maskHigh = maskHigh >>> (7 - endBitOffset);
				}
			}

			const mask = maskHigh & maskLow;
			let delta = msg.data[startByte + i] & mask;
			if (i != 0) {
				delta <<= (i * 8);
			}
			sigVal |= delta;
		}

		if (startBitOffset != 0) {
			sigVal >>>= startBitOffset;
		}

		signal.value = sigVal;
		signal.physicalValue = rawToPhys(sigVal, signal);
	}

//	if (signal.error != E_SIGNAL_OK) {
//		console.log("ERROR extractSignal(): " + signal.name);
//		console.log("startBit: " + signal.startBit);
//		console.log("length: " + signal.length);
//		console.log();
//	}
}

function insertSignal(msg, signal) {
	const startBitOffset = signal.startBit % 8;
	const endBit = signal.startBit + signal.length - 1;
	const endBitOffset = endBit % 8;
	const startByte = Math.floor(signal.startBit / 8);
	const endByte = Math.floor(endBit / 8);
	const byteLen = endByte - startByte + 1;

	// definition check
	if (signal.startBit >= (DATA_BYTE_LEN_MAX * 8) || signal.length == 0) {
		signal.error = E_SIGNAL_DEFINITION_INVALID;
	}
	// big value
	else if (signal.length >= 32) {
		if (startBitOffset != 0) {
			signal.error = E_SIGNAL_DEFINITION_INVALID;
		}
		else {
			signal.error = E_SIGNAL_OK;
			
			const sigVal = signal.value;
			let byteIndex = startByte;
			for (let i = 0; i < 4; i++, byteIndex++) {
				const originalByte = msg.data[byteIndex];
				const byteToWrite = (sigVal >>> (i * 8)) & 0xFF
				msg.data[byteIndex] = byteToWrite;
				if (originalByte != byteToWrite) {
					msg.status |= CAN_MSG_STATUS_CHANGED;
				}
			}
			
			if (signal.length > 32) {
				const limit = byteLen - 4;
				const sigValHigh = signal.valueHigh;
				for (let i = 0; i < limit; i++, byteIndex++) {
					const originalByte = msg.data[byteIndex];
					const byteToWrite = (sigValHigh >>> (i * 8)) & 0xFF
					msg.data[byteIndex] = byteToWrite;
					if (originalByte != byteToWrite) {
						msg.status |= CAN_MSG_STATUS_CHANGED;
					}
				}
			}
			
			msg.status |= CAN_MSG_STATUS_UPDATED;
		}
	}
	else {
		let max;
		if (signal.length < 32) {
			max = (1 << signal.length) - 1;
		}
		else {
			max = 0xFFFFFFFF;
		}
	
		// range check
		if (signal.value > max) {
			signal.error = E_INPUT_OUT_OF_RANGE;
		}
		else {
			signal.error = E_SIGNAL_OK;
			
			const mulFactor = 1 << startBitOffset;
			const shifted = signal.value * mulFactor;
			let byteIndex = startByte;
			
			for (let i = 0; i < byteLen; i++, byteIndex++) {
				let byteToWrite;
				if (i == 0) {
					byteToWrite = shifted & 0xFF;
				}
				else {
					byteToWrite = (shifted >>> (i * 8)) & 0xFF;
				}

				const originalByte = msg.data[byteIndex];
				let maskLow = 0xFF;
				let maskHigh = 0xFF;

				if (i == 0) {
					if (startBitOffset != 0) {
						maskLow = (maskLow << startBitOffset) & 0xFF;
					}
					if ((byteLen == 1) && (endBitOffset != 7)) {
						maskHigh = maskHigh >>> (7 - endBitOffset);
					}
				}
				else if (i == (byteLen - 1)) {
					if (endBitOffset != 7) {
						maskHigh = maskHigh >>> (7 - endBitOffset);
					}
				}

				const mask = maskHigh & maskLow;
				const inv_mask = ~mask & 0xFF;
				msg.data[byteIndex] = (originalByte & inv_mask) | (byteToWrite & mask);
				if (msg.data[byteIndex] != originalByte) {
					msg.status |= CAN_MSG_STATUS_CHANGED;
				}
			}
			msg.status |= CAN_MSG_STATUS_UPDATED;
		}
	}

//	if (signal.error != E_SIGNAL_OK) {
//		console.log("ERROR insertSignal(): " + signal.name);
//		console.log("startBit: " + signal.startBit);
//		console.log("length: " + signal.length);
//		console.log();
//	}
}

function getSignal(name) {
	return signalMap.get(name);
}

function setSignal(name, value) {
	const signal = signalMap.get(name);
	
	if (signal != null) {
		const msg = pduIdMap.get(signal.canId);
		if (msg != null && msg.direction == CAN_DIRECTION_TX) {
			if (signal.length <= 32) {
				let max;
				if (signal.length < 32) {
					max = (1 << signal.length) - 1;
				}
				else {
					max = 0xFFFFFFFF;
				}
				
				const rawVal = physToRaw(value, signal);
				if (rawVal >= 0 && rawVal <= max) {
					signal.physicalValue = value;
					signal.value = rawVal;
					insertSignal(msg, signal);
				}
			}
			else {
				let max = 0xFFFFFFFFFFFFFFFFn;
				if (signal.length < 64) {
					let div = BigInt(1 << (64 - signal.length));
					max /= div;
				}
				
				const bigValue = BigInt(value);
				if (bigValue <= max) {
					signal.value = Number(bigValue % 0x100000000n);
					signal.valueHigh = Number(bigValue / 0x100000000n);
					signal.physicalValue = bigValue.toString();
					insertSignal(msg, signal);
				}
			}
		}
	}

	return signal;
}

function physToRaw(physVal, signal) {
	let rawVal = physVal;
	if (signal.factor > 0) {
		rawVal -= signal.offset;
		rawVal /= signal.factor;
	}
	rawVal = Math.round(rawVal);
	return rawVal;
}

function rawToPhys(rawVal, signal) {
	let physVal = rawVal;
	if (signal.factor > 0) {
		physVal *= signal.factor;
		physVal += signal.offset;
		if (!Number.isInteger(physVal) || signal.apType == "float") {
			physVal = Number(physVal.toFixed(5));
		}
	}
	return physVal;
}

module.exports = {	
	initSignalDB,
	getCanMessageStorage,
	
	getBusNum,
	getEcuNum,
	getPduNum,
	getSignalNum,
	getSignal,
	setSignal,
	
	extractSignal,
	insertSignal,
	rawToPhys
}