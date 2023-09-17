/*
 * auto_sync_com
 */
import { createSocket } from 'node:dgram';
import { Buffer } from 'node:buffer';

import { 
	DASHBOARD, 
	BUFLEN, SYNC_MESSAGE_LEN_MIN, 
	TIME_BASE, SYNC_PERIOD_TICKS, ALIVE_TIMEOUT 
} from './options.js';

import { initSignalDB } from './signal_db.js';
import { setNeverSent, syncStorage, scanStorage } from './auto_sync.js';


const udpClient = createSocket('udp4');

const settings = {
	serverLoc : DASHBOARD,
	serverAddr : "127.0.0.1", // localhost
	serverPort : 0,
	clientPort : 0
};

var aliveCounter = 0;
var otherAlive = false;
//var address = null;


function heartBeat() {
	const message = Buffer.from("Hello!");
	var heartBeatTimer = 0;
	
	setInterval(function() {
		//send the message
		if (heartBeatTimer == 0) {
			udpClient.send(message, settings.serverPort, settings.serverAddr, (err) => {
				if (err != null) {
					console.log(err);
				}
			});
			heartBeatTimer = 1000 / (SYNC_PERIOD_TICKS * TIME_BASE);
		}
		else {
			heartBeatTimer--;
		}

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
	udpClient.on('message', (msg, rinfo) => {
		if (msg.length > 0) {
			if (!otherAlive) {
				otherAlive = true;
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
				if (msg.toString() === "Knock!") {
					const message = Buffer.from("Coming!");
					udpClient.send(message, process.env.FIND_SERVER_PORT, rinfo.address, (err) => {
						if (err != null) {
						  console.log(err);
					  }
				  });
				}
			}
		}
	});
}

export const start = (arg) => {
	const tx_buf = {
		buf: Buffer.alloc(BUFLEN),
		len: 0,
		iteration: 0
	};
	
	settings.serverLoc = arg.serverLoc;
	settings.serverAddr = arg.serverAddr;
	settings.serverPort = arg.serverPort;
	settings.clientPort = arg.clientPort;
	initSignalDB(settings.serverLoc);
	
	udpClient.on('error', (err) => {
		console.error(`server error:\n${err.stack}`);
		udpClient.close();
	});

	udpClient.on('listening', () => {
		const address = udpClient.address();
		console.log(`server listening ${address.address}:${address.port}`);
	});

	udpClient.bind(settings.clientPort);
	// Prints: server listening 0.0.0.0:41235
	
	heartBeat();
	
	fromOther();
	
	setInterval(function() {
		if (otherAlive) {
			scanStorage(tx_buf);
		}
		
		tx_buf.iteration++;
		
		if (tx_buf.iteration == SYNC_PERIOD_TICKS) {
			if (otherAlive && tx_buf.len > 0) {
				const msg = tx_buf.buf.subarray(0, tx_buf.len);
				udpClient.send(msg, settings.serverPort, settings.serverAddr, (err) => {
					if (err != null) {
						console.log(err);
					}
					else {
						//autoSync.printLog(msg);
					}
				});
			}
			
			tx_buf.iteration = 0;
			tx_buf.len = 0;
		}
	}, TIME_BASE);
}
