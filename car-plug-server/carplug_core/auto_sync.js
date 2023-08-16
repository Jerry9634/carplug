const {
	TIME_BASE,

	//CAN_MSG_STATUS_UPDATED,
	CAN_MSG_STATUS_CHANGED,
	CAN_MSG_STATUS_OVERWRITE,
	CAN_MSG_STATUS_NEVER_SENT,
	//CAN_MSG_STATUS_NEVER_RECEIVED,
	//CAN_MSG_STATUS_E2E_PROFILE_05,
	//CAN_MSG_STATUS_E2E_PROFILE_11,
	CAN_MSG_STATUS_CLEAR_FLAGS
} = require('./options');

const {
	getCanMessageStorage,	
	extractSignal,
	insertSignal
} = require('./signal_db');

const canMessageStorage = getCanMessageStorage();


function scanStorage(buf) {
	var index = buf.len;
	canMessageStorage.canMsgGroups.forEach((canMsgGroup) => {
		let timeoutOccurs = false;

		if (canMsgGroup.cycle > 0) {
			if (canMsgGroup.timer > 0) {
				canMsgGroup.timer--;
			}

			if (canMsgGroup.timer == 0) {
				canMsgGroup.timer = canMsgGroup.cycle / TIME_BASE;
				timeoutOccurs = true;
			}
		}
		else {
			timeoutOccurs = true;
		}

		if (timeoutOccurs) {
			for (const canMessage of canMsgGroup.canMessages) {
				const id = canMessage.id;
				const dlc = canMessage.DLC;
				const status = canMessage.status;

				if ((status & (CAN_MSG_STATUS_CHANGED | CAN_MSG_STATUS_NEVER_SENT)) != 0) {
					buf.buf[index] = ((id >>> 24) & 0xff);
					buf.buf[index+1] = ((id >>> 16) & 0xff);
					buf.buf[index+2] = ((id >>> 8) & 0xff);
					buf.buf[index+3] = (id & 0xff);
					buf.buf[index+4] = (dlc);
					buf.buf[index+5] = (status & CAN_MSG_STATUS_OVERWRITE);
					
					index += 6;
					
					for (let i = 0; i < dlc; i++) {
						buf.buf[index+i] = (canMessage.data[i]);
					}
					
					index += dlc;
					
					canMessage.status &= (~CAN_MSG_STATUS_CLEAR_FLAGS & 0xff);
				}
			}
		}
	});
	
	buf.len = index;
}

function syncStorage(buf) {
	const len = buf.length;
	var index = 0;
	
	while (index < len) {
		const canId = (buf[index] << 24) + (buf[index+1] << 16) + (buf[index+2] << 8) + (buf[index+3]);
		const dlc = buf[index+4];
		const status = buf[index+5];
		const canMessage = canMessageStorage.pduIdMap.get(canId);

		index += 6;
		if (canMessage != null) {
			if (canMessage.id == canId && canMessage.DLC == dlc) {
				for (let i = 0; i < dlc; i++) {
					canMessage.data[i] = buf[index + i];
				}
				canMessage.signals.forEach((signal) => {
					extractSignal(canMessage, signal);
				});
				
				canMessage.status &= (~CAN_MSG_STATUS_CLEAR_FLAGS & 0xff);
				if ((status & CAN_MSG_STATUS_OVERWRITE) != 0) {
					// TODO : overwritten buffer
					console.log("overwritten buffer: " + canMessage.name);
				}
			}
			else {
				console.log("Can Id or DLC inconsistent: " + canId + ", " + dlc);
			}
		}
		else {
			console.log("Can Id cannot be mapped: " + canId);
		}

		index += dlc;
	}
}

function setNeverSent() {
	canMessageStorage.canMsgGroups.forEach((canMsgGroup) => {
		for (const canMessage of canMsgGroup.canMessages) {
			canMessage.status |= CAN_MSG_STATUS_NEVER_SENT;
		}
	});
}

function printLog(buf) {
	const len = buf.length;
	var index = 0;
	var messageCnt = 0;
	
	while (index < len) {
		const canId = (buf[index] << 24) + (buf[index+1] << 16) + (buf[index+2] << 8) + (buf[index+3]);
		const dlc = buf[index+4];
		let logline = "ID = " + formatCanId(canId.toString(16)) + ", DLC = " + formatByte(dlc.toString()) + ", DATA =";

		index += 6;
		for (let i = 0; i < dlc; i++) {
			logline += " " + formatByte(Number(buf[index + i]).toString(16));
		}
		index += dlc;
		console.log(logline);
		
		messageCnt++;
	}

	canMessageStorage.totalMessageCnt += messageCnt;

	console.log("\033[35;1m-------------------------------------------------------------------------");
	console.log("Now " + len + " bytes exchanged");
	console.log("Now " + messageCnt + " messages exchanged");
	console.log("Total " + canMessageStorage.totalMessageCnt + " messages exchanged");
	console.log("-------------------------------------------------------------------------\033[0m");
}

function formatCanId(str) {
	const len = str.length;
	str = str.toUpperCase();
	for (let i = 0; i < (3-len); i++) {
		str = "0" + str;
	}
	return str;
}

function formatByte(str) {
	const len = str.length;
	if (len < 2) {
		str = "0" + str;
	}
	return str;
}

module.exports = {
	scanStorage,
	syncStorage,
	printLog,
	setNeverSent
}
