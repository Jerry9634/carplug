/*
 * ccu_simulator
 */
import { createSocket } from 'node:dgram';
import { Buffer } from 'node:buffer';

import { 
	GATEWAY, 
	BUFLEN, SYNC_MESSAGE_LEN_MIN, 
	TIME_BASE, SYNC_PERIOD_TICKS, ALIVE_TIMEOUT, 
	CAN_MSG_STATUS_E2E_PROFILE_05, CAN_MSG_STATUS_E2E_PROFILE_11 
} from './options.js';

import { getCanMessageStorage, initSignalDB, rawToPhys, setSignal } from './signal_db.js';
import { setNeverSent, syncStorage, scanStorage } from './auto_sync.js';


const udpServer = createSocket('udp4');

const settings = {
	serverLoc  : GATEWAY,
	serverPort : 0,
	clientPort : 0,
	trafficGen : false
};

const canMessageStorage = getCanMessageStorage();

var aliveCounter = 0;
var otherAlive = false;
var address = null;


function heartBeat() {
	setInterval(function() {
		if (otherAlive) {
			if (aliveCounter > 0) {
				aliveCounter--;
			}

			if (aliveCounter == 0) {
				otherAlive = false;
				console.log("CarPlug disconnected!");
				setNeverSent();
			}
		}
	}, SYNC_PERIOD_TICKS * TIME_BASE);
}

function fromOther() {
	const message = Buffer.from("Aloha!");
	
	udpServer.on('message', (msg, rinfo) => {
		if (msg.length > 0) {
			if (!otherAlive) {
				otherAlive = true;
				address = rinfo.address;
				console.log("CarPlug connected!");
			}

			if (otherAlive) {
				aliveCounter = ALIVE_TIMEOUT / (SYNC_PERIOD_TICKS * TIME_BASE);
			}

			if (msg.length >= SYNC_MESSAGE_LEN_MIN) {
				syncStorage(msg);
				//autoSync.printLog(msg);
			}
			else {
				//console.log(msg.toString());
				udpServer.send(message, settings.clientPort, address, (err) => {
  					if (err != null) {
						console.log(err);
					}
				});
			}
		}
	});
}

export function start(arg) {
	const tx_buf = {
		buf: Buffer.alloc(BUFLEN),
		len: 0,
		iteration: 0
	};
	
	settings.serverLoc = arg.serverLoc;
	settings.serverPort = arg.serverPort;
	settings.clientPort = arg.clientPort;
	settings.trafficGen = arg.trafficGen;
	initSignalDB(settings.serverLoc);
	
	udpServer.on('error', (err) => {
		console.error(`server error:\n${err.stack}`);
		udpServer.close();
	});

	udpServer.on('listening', () => {
		const address = udpServer.address();
		console.log(`server listening ${address.address}:${address.port}`);
	});

	udpServer.bind(settings.serverPort);
	// Prints: server listening 0.0.0.0:41234
	
	heartBeat();
	
	fromOther();
	
	setInterval(function() {
		if (otherAlive) {
			if (settings.trafficGen == true) {
				updateBus();
			}
			scanStorage(tx_buf);
		}
		
		tx_buf.iteration++;
		
		if (tx_buf.iteration == SYNC_PERIOD_TICKS) {
			if (otherAlive && tx_buf.len > 0) {
				if (address != null) {
					const msg = tx_buf.buf.subarray(0, tx_buf.len);
					udpServer.send(msg, settings.clientPort, address, (err) => {
						if (err != null) {
							console.log(err);
						}
						else {
							//auto_sync.printLog(msg, canMessageStorage);
						}
					});
				}
			}
			
			tx_buf.iteration = 0;
			tx_buf.len = 0;
		}
	}, TIME_BASE);
}

/*
 *
 */
function updateBus() {
	const DUMMY_CRC16_VAL = 0x160C;
	const DUMMY_CRC8_VAL = 0xC8;
	
	canMessageStorage.canMsgGroups.forEach((canMsgGroup) => {
		let timeoutOccurs = false;

		if (canMsgGroup.timer2 > 0) {
			canMsgGroup.timer2--;
		}

		if (canMsgGroup.timer2 == 0) {
			timeoutOccurs = true;
			canMsgGroup.timer2 = canMsgGroup.cycle2 / TIME_BASE;
		}

		if (timeoutOccurs) {
			for (const canMessage of canMsgGroup.canMessages) {
				// update data bytes : 25 percent
				for (const signal of canMessage.signals) {
					if (!signal.name.match("([A-Za-z0-9_]+)(AlvCnt|Crc)([0-9]+)Val")) {
						if (signal.length <= 32) {
							let max;
							if (signal.length < 32) {
								max = (1 << signal.length) - 1;
							}
							else {
								max = 0xFFFFFFFF;
							}
							
							let value = signal.value;
							if (signal.length >= 24) {
								value += 1000000;
							}
							else if (signal.length >= 16) {
								value += 1000;
							}
							else {
								value++;
							}
							
							if (value > max) {
								value = 0;
							}
							
							const physVal = rawToPhys(value, signal);
							setSignal(signal.name, physVal);
						}
						else {
							let max = 0xFFFFFFFFFFFFFFFFn;
							if (signal.length < 64) {
								let div = BigInt(1 << (64 - signal.length));
								max /= div;
							}
							
							let bigValue = BigInt(signal.physicalValue);
							if (signal.length >= 48) {
								bigValue += 1000000000000n;
							}
							else {
								bigValue += 1000000000n;
							}
							
							if (bigValue > max) {
								bigValue = 0n;
							}
							
							setSignal(signal.name, bigValue.toString());
						}
					}
				}

				// update E2E (Alive Counter, CRC)
				if ((canMessage.status & CAN_MSG_STATUS_E2E_PROFILE_05) != 0) {
					canMessage.data[2]++;
					canMessage.data[2] &= 0xFF;

					// TODO Profile-05 CRC (16-bit)
					let crcVal = DUMMY_CRC16_VAL;
					canMessage.data[0] = (crcVal & 0xFF);
					canMessage.data[1] = ((crcVal >>> 8) & 0xFF);
				}
				else if ((canMessage.status & CAN_MSG_STATUS_E2E_PROFILE_11) != 0) {
					let alvCntVal = (canMessage.data[1] >>> 4) & 0xFF;
					alvCntVal++;
					canMessage.data[1] &= 0x0F;
					canMessage.data[1] |= (alvCntVal << 4) & 0xF0;

					// TODO Profile-11 CRC (8-bit)
					crcVal = DUMMY_CRC8_VAL;
					canMessage.data[0] = (crcVal & 0xFF);
				}
			}
		}
	});
}
