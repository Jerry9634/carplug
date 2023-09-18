import net from 'node:net';
import os from 'os';
import {
	Worker,
	isMainThread,
	setEnvironmentData,
	getEnvironmentData,
	parentPort
} from 'node:worker_threads';
import fs from 'fs';

import { getSignal, setSignal, getCanMessageStorage } from "./signal_db.js";


const SOCKET_NAME = "/tmp/carplug.socket";
const SOCKET_NAME_WIN = "\\\\.\\pipe\\carplug.socket";

const settings = {
	socketName: SOCKET_NAME
};

const ColorType = {
	Default_Color    : 30,	//	\033[30m	\033[40m
	Red_Color        : 31,	//	\033[31m	\033[41m
	Green_Color      : 32,	//	\033[32m	\033[42m
	Yellow_Color     : 33,	//	\033[33m	\033[43m
	Blue_Color       : 34,	//	\033[34m	\033[44m
	Magenta_Color    : 35,	//	\033[35m	\033[45m
	Cyan_Color       : 36,	//	\033[36m	\033[46m
	Light_Gray_Color : 37	//	\033[37m	\033[47m
};

const Bold_Style = 1;


export function start_server() {
	if (!isMainThread)
		return;
		
	if (os.type() == "Windows_NT") {
		settings.socketName = SOCKET_NAME_WIN;
	}
	else {
		settings.socketName = SOCKET_NAME;
	}

	setEnvironmentData("socketName", settings.socketName);
	
	// This re-loads the current file inside a Worker instance.
	const worker = new Worker(__filename);

	worker.on('message', (message) => {
		// after processing, return the result
		let cmd = String(message);
		if (!cmd.substring(cmd.length-1).match("[A-Za-z0-9_]")) {
			cmd = cmd.substring(0, cmd.length-1);
		}
		//console.log(cmd);
		let response = null;
		
		if (cmd.indexOf("get") == 0) {
			const names = String(cmd).substring(4).split(" ");
			for (const name of names) {
				const signal = getSignal(name);
				if (response == null) {
					if (signal != null) {
						response = signal.physicalValue;
					}
					else {
						response = "unknown";
					}
				}
				else {
					if (signal != null) {
						response += " " + signal.physicalValue;
					}
					else {
						response += " unknown";
					}
				}
			}
		}
		else if (cmd.indexOf("set") == 0) {
			const names = String(cmd).substring(4).split(" ");
			for (let i = 0; i < names.length; i += 2) {
				const name = names[i];
				const value = names[i + 1];
				const signal = setSignal(name, value);
				if (response == null) {
					if (signal != null) {
						response = signal.physicalValue;
					}
					else {
						response = "unknown";
					}
				}
				else {
					if (signal != null) {
						response += " " + signal.physicalValue;
					}
					else {
						response += " unknown";
					}
				}
			}
		}
		else if (cmd.indexOf("sig") ==0) {
			response = getSignalDef(cmd.substring(4), signalDB);
		}
		else if (cmd.indexOf("msg") == 0) {
			response = getMessageDef(cmd.substring(4), signalDB);
		}
		
		if (response == null) {
			response = "NAK";
		}
		//console.log("response: " + response);
		//console.log();
		
		worker.postMessage(String(response));
	});

	//worker.on('data', () => { });
	//worker.on('error', () => { });
	worker.on('exit', (code) => {
		if (code !== 0)
			console.error(`Worker stopped with exit code ${code}`);
	});
}

export function start_client() {
	if (isMainThread)
		return;
	
	settings.socketName = getEnvironmentData("socketName");

	fs.unlink(settings.socketName, () => {
		// nothing to do
	});
	
	const server = net.createServer((c) => {
		// 'connection' listener.
		console.log('client connected');

		c.on('end', () => {
			console.log('client disconnected');
		});

		// command received
		c.on('data', (data) => {
			parentPort.postMessage(data.toString());
		});
		
		parentPort.on('message', (message) => {
			const buf = Buffer.alloc(message.length + 1);
			buf.write(message);
			buf[message.length] = 0;
			c.write(buf);
		});
	});

	server.on('error', (err) => {
		throw err;
	});
	
	server.listen(settings.socketName, () => {
		console.log('server bound');
	});
}


function getSignalDef(name, signalDB) {
	var result = null;

	const sigObj = getSignal(name);
	if (sigObj != null) {
		result = "\n";
		result += "name:       \"" + decorateText(sigObj.name, ColorType.Blue_Color, Bold_Style) + "\"\n";
		result += "CAN ID:     " + 
					decorateValue(sigObj.canId, ColorType.Blue_Color, Bold_Style) + "(0x" + 
					decorateCanId(sigObj.canId, ColorType.Blue_Color, Bold_Style) + ")\n";
		result += "startBit:   " + sigObj.startBit + "\n";
		result += "length:     " + sigObj.length + "\n";
		result += "isMotorola: " + (sigObj.isMotorola ? "true" : "false") + "\n";
		result += "isSigned:   " + (sigObj.isSigned ? "true" : "false") + "\n";
		result += "initValue:  " + sigObj.initValue + "\n";
		result += "factor:     " + sigObj.factor + "\n";
		result += "offset:     " + sigObj.offset + "\n";
		result += "min:        " + sigObj.min + "\n";
		result += "max:        " + sigObj.max + "\n";
		result += "type:       \"" + decorateText(sigObj.apType, ColorType.Blue_Color, Bold_Style) + "\"\n";
		
		canMessageStorage = getCanMessageStorage();
		const msgObj = canMessageStorage.pduIdMap.get(Number(sigObj.canId));
		result += "sender:     " + decorateText(msgObj.sender, ColorType.Green_Color, Bold_Style) + "\n";
		result += "receivers:\n";
		for (const receiver of sigObj.receiverAry) {
			result += "\t" + decorateText(receiver, ColorType.Green_Color, Bold_Style) + "\n";
		}
		result += "value descriptions:\n";
		const valueDescAry = sigObj.valueDescAry;
		for (const valueDesc in valueDescAry) {
 			result += "\t" 
 				+ decorateText(valueDesc.substring(5), ColorType.Magenta_Color, Bold_Style) + " : " 
 				+ decorateText(valueDescAry[valueDesc], ColorType.Magenta_Color, Bold_Style) + "\n";
		}
	}

    return result;
}

function getMessageDef(canId, signalDB) {
	var result = null;

	canMessageStorage = getCanMessageStorage();
	const msgObj = canMessageStorage.pduIdMap.get(Number(canId));

	if (msgObj != null) {
		result = "\n";
		result += "ID:      " + 
					decorateValue(msgObj.id, ColorType.Blue_Color, Bold_Style) 
					+ "(0x" + decorateCanId(msgObj.id, ColorType.Blue_Color, Bold_Style) + ")\n";

		result += "Message: \"" + decorateText(msgObj.name, ColorType.Blue_Color, Bold_Style) + "\"\n";
		result += "Sender:  \"" + decorateText(msgObj.sender, ColorType.Blue_Color, Bold_Style) + "\"\n";
		result += "Bus:     \"" + decorateText(msgObj.bus, ColorType.Blue_Color, Bold_Style) + "\"\n";

		result += "\n";
		result += "signals:\n";
		for (const sigObj of msgObj.signals) {
			result += "\tname=\"" + decorateText(sigObj.name, ColorType.Blue_Color, Bold_Style) 
					+ "\", startBit=\"" + decorateValue(sigObj.startBit, ColorType.Blue_Color, Bold_Style) 
					+ "\", length=\"" + decorateValue(sigObj.length, ColorType.Blue_Color, Bold_Style)
					+ "\", type=\"" + decorateText(sigObj.apType, ColorType.Blue_Color, Bold_Style) + "\"\n";
		}
	}

	return result;
}

function decorateText(txt, color, style) {
	return "\x1b[" + color + ";" + style + "m" + txt + "\x1b[0m";
}

function decorateValue(value, color, style) {
	return "\x1b[" + color + ";" + style + "m" + value + "\x1b[0m";
}

function decorateCanId(canId, color, style) {
	return "\x1b[" + color + ";" + style + "m" + formatCanId(canId.toString(16)) + "\x1b[0m";
}

function formatCanId(str) {
	const len = str.length;
	str = str.toUpperCase();
	for (let i = 0; i < (3-len); i++) {
		str = "0" + str;
	}
	return str;
}