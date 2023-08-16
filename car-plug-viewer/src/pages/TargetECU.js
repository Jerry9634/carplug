/**
 * 
 */
import React from "react";
import { memo, useState } from "react";
import { searchItems, sortTable } from "./Common.js";
import SocketIOClient from 'socket.io-client';
import vehicleApi from "./VehicleAPI.json";

/* global BigInt */


const GATEWAY = "gateway";
const PHONE = "phone";
const CAR = "car";

//const REFRESH_CYCLE = 1000; // 1000 ms = 1 s

const settings = {
	serverLoc  : GATEWAY,
	serverPort : 5001,
	serverUrl  : "http://localhost:5002/carplug/",
	targetECU  : "_VPLUG_",
	busySignal : null
}

const SENDER = "SENDER";
const RECEIVER = "RECEIVER";

const COLUMNS = {
	INDEX      : 0,
	SIGNAL     : 1,
	INIT_VALUE : 6,
	TYPE       : 8,
	SENDER     : 11,
	RECEIVER   : 12,
};

const DEFAULT_SEARCH_ITEMS = [ COLUMNS.SIGNAL ];
const EXTRA_SEARCH_ITEMS = [ SENDER, RECEIVER ];
const EXTRA_SEARCH_INDICES = [ COLUMNS.SENDER, COLUMNS.RECEIVER ];

var socket = SocketIOClient("http://localhost:3501");


class TargetECU extends React.Component {
	
	allSignals = [];
	pdus = [];
	ecus = [];
	
	senderMap = new Map();
	receiverMap = new Map();
	signalToPduMap = new Map();

	vplugSingals = [
		vehicleApi.Vehicle.Multimedia.H_U_MM.HU_DATC_DrTempSetC.name,	// "HU_DATC_DrTempSetC", 
		vehicleApi.Vehicle.Multimedia.H_U_MM.HU_DATC_PsTempSetC.name,	// "HU_DATC_PsTempSetC", 
		vehicleApi.Vehicle.Extended.DATC.DATC_AUTOActv.name,			// "DATC_AUTOActv", 
		vehicleApi.Vehicle.Extended.DATC.DATC_AcDis.name,				// "DATC_AcDis",
		vehicleApi.Vehicle.Powertrain2.VCU.VCU_GearPosSta.name,			// "VCU_GearPosSta",
		vehicleApi.Vehicle.Extended.CLU.CLU_DisSpdVal.name,				// "CLU_DisSpdVal",
		vehicleApi.Vehicle.Extended.CLU.CLU_OdoVal.name,				// "CLU_OdoVal",
		vehicleApi.Vehicle.Extended.CLU.CLU_EVDTEDisp.name,				// "CLU_EVDTEDisp",
		vehicleApi.Vehicle.Multimedia.H_U_MM.C_HazardFromCCS.name,		// "C_HazardFromCCS",
	];
	
	constructor(props) {
		super(props);

		const signalMap = new Map();
		const ecuMap = new Map();

		ecuMap.set("_VPLUG_", "_VPLUG_");
		
		if (props.signalDB != null) {
			props.signalDB.pdus.forEach((pdu) => {
				this.pdus.push(pdu);
				
				pdu.signals.forEach((signal) => {
					const receivers = [];
					if (signal.receiverAry != null && signal.receiverAry.length !== 0) {
						for (const receiver of signal.receiverAry) {
							receivers.push(receiver);
						}
					}
					receivers.sort();
					this.receiverMap.set(signal, receivers);
					
					ecuMap.set(pdu.sender, pdu.sender);
					this.signalToPduMap.set(signal.name, pdu);
					
					signalMap.set(signal, signal);
					this.senderMap.set(signal, pdu.sender);
				});
			});
		}
		
		signalMap.forEach((signal) => {
			this.allSignals.push(signal);
		});
		this.allSignals.sort();
		
		ecuMap.forEach((ecu) => {
			this.ecus.push(ecu);
		});
		this.ecus.sort();
		
		this.state = this.changeTargetECU(settings.targetECU, false);
	}
	
	changeTargetECU(target, mounted) {
		const txSignalMap = new Map();
		const rxSignalMap = new Map();
		const txSignals = [];
		const rxSignals = [];
		
		settings.targetECU = target;
		
		if (target === "_VPLUG_") {
			const vplugMap = new Map();

			for (const vplugSingal of this.vplugSingals) {
				vplugMap.set(vplugSingal, vplugSingal);
			}

			for (const signal of this.allSignals) {
				if (vplugMap.has(signal.name)) {
					txSignalMap.set(signal.name, signal);
				}
			}

			txSignalMap.forEach((signal) => {
				txSignals.push(signal.name);
			});

			txSignals.sort();
		}
		else {
			for (const pdu of this.pdus) {
				if (pdu.sender === target) {
					for (const signal of pdu.signals) {
						txSignalMap.set(signal.name, signal);
					}
				}
			}
			for (const signal of this.allSignals) {
				for (const receiver of this.receiverMap.get(signal)) {
					if (receiver === target) {
						rxSignalMap.set(signal.name, signal);
					}
				}
			}

			txSignalMap.forEach((signal) => {
				if (!signal.name.match("([A-Za-z0-9_]+)(AlvCnt|Crc)([0-9]+)Val")) {
					  txSignals.push(signal.name);
				  }
			});

			if (target !== "CGW_CCU") {
				rxSignalMap.forEach((signal) => {
					if (!signal.name.match("([A-Za-z0-9_]+)(AlvCnt|Crc)([0-9]+)Val")) {
						rxSignals.push(signal.name);
					}
				});
			}

			txSignals.sort();
			rxSignals.sort();
		}		
		
		const stateObj = {
			target: target,
			txSignalMap: txSignalMap,
			rxSignalMap: rxSignalMap,
			txSignals: txSignals,
			rxSignals: rxSignals
		};
		
		if (mounted) {
			this.setState(stateObj);
			this.unsubscribe();
			setTimeout(() => {
				this.subscribe();
			}, 100);
		}
		
		return stateObj;
    }

	updateSetGetButtons() {
		this.changeTargetECU(settings.targetECU, true);
	}

	isReadOnlySignal(name) {
		if (this.state.txSignalMap.has(name)) {
			if (this.state.target !== "CGW_CCU" && settings.serverLoc === GATEWAY) {
				return false;
			}
			else if (this.state.target === "CGW_CCU" && settings.serverLoc !== GATEWAY) {
				return false;
			}
		}
		return true;
	}
		
	componentDidMount() {
		//console.log("componentDidMount()");
		this.subscribe();
	}
	
	componentDidUpdate() {
		//console.log("componentDidUpdate()");
	}

	componentWillUnmount() {
		//console.log("componentWillUnmount()");
		this.unsubscribe();
	}

	subscribe() {
		const txSignalMap = this.state.txSignalMap;
		const rxSignalMap = this.state.rxSignalMap;
		const txSignals = this.state.txSignals;
		const rxSignals = this.state.rxSignals;
		
		const jsonData = {
			signals: [],
			channel: "signalviewer",
		};

		for (const name of txSignals) {
			jsonData.signals.push({
				name: name
			});
		}

		for (const name of rxSignals) {
			jsonData.signals.push({
				name: name
			});
		}

		subscribeSignals(jsonData, (json) => {
			if (json.signals != null) {
				for (const signal of json.signals) {
					const physical_value_field_name = "physical_value_field_" + signal.name;
					const raw_value_field_name = "raw_value_field_" + signal.name;
					const value_desc_name = "value_desc_" + signal.name;
					const htmlElem1 = document.getElementById(physical_value_field_name);
					if (htmlElem1 != null) {
						// eslint-disable-next-line
						if (htmlElem1.value != signal.value) {
							if (settings.busySignal == null || signal.name !== settings.busySignal.name) {
								htmlElem1.value = Number(signal.value);
							}
							else {
								let readonly = true;
								if (txSignalMap.has(signal.name)) {
									if (settings.targetECU !== "CGW_CCU" && settings.serverLoc === GATEWAY) {
										readonly = false;
									}
									else if (settings.targetECU === "CGW_CCU" && settings.serverLoc !== GATEWAY) {
										readonly = false;
									}
								}

								if (readonly) {
									htmlElem1.value = signal.value;
								}
							}
						}
						
						const htmlElem2 = document.getElementById(raw_value_field_name);
						if (htmlElem2 != null) {
							let sigDef = rxSignalMap.get(signal.name);
							if (sigDef == null) {
								sigDef = txSignalMap.get(signal.name);
							}
							if (sigDef != null) {
								const rawValue = physToRaw(signal.value, sigDef);
								htmlElem2.innerText = rawValue;
								const htmlElem3 = document.getElementById(value_desc_name);
								if (htmlElem3 != null) {
									const options = htmlElem3.getElementsByTagName("option");
									for (let i = 0; i < options.length; i++) {
										if (options[i].innerText.startsWith(String(rawValue))) {
											htmlElem3.selectedIndex = i;
											break;
										}
									}
								}
							}
						}
					}
				}
			}
		});
	}

	unsubscribe() {
		unsubscribeSignals({ channel: "signalviewer" });
	};

	changeSettings(loc) {
		if (loc === "gw" || loc === "GW" || loc === "CCU" || loc === GATEWAY) {
			settings.serverLoc = GATEWAY;
			settings.serverPort = 5001;
		}
		else if (loc === PHONE || loc === CAR) {
			settings.serverLoc = loc;
			settings.serverPort = 5002;
		}
		settings.serverUrl = "http://localhost:" + settings.serverPort + "/carplug/";
	}
	
	regenIndex(itemsFound) {
		for (let i = 0; i < itemsFound.length; i++) {
			let td = itemsFound[i].getElementsByTagName("td")[0];
			if (td) {
				td.innerText = i + 1;
			}
		}
	}

	render() {
		var index = 1;
		settings.busySignal = null;

		return (
			<div className="w3-margin-top w3-margin-left w3-margin-right">
				<div className="w3-row-padding">
					<div className="w3-third">
						<label className="w3-text-blue">Select Target ECU:</label>
						<select className="w3-select w3-border" name="option" id="selectTarget"
							defaultValue={settings.targetECU}
							onChange={(e) => {
								this.changeTargetECU(e.target.value, true);
							}} >
							{this.ecus.map((ecu) => 
							<option key={ecu}>{ecu}</option>
							)}
						</select>
					</div>
					<div className="w3-third">
						<label className="w3-text-blue">Select Node Location:</label>
						<select className="w3-select w3-border" name="option" id="selectServer"
							defaultValue={settings.serverLoc}
							onChange={(e) => {
								if (e.target.value === GATEWAY) {
									this.changeSettings(GATEWAY);
								}
								else {
									this.changeSettings(PHONE);
								}
								this.updateSetGetButtons();
							}}>
							<option value={PHONE}>Phone/Car</option>
							<option value={GATEWAY}>Gateway</option>
						</select>
					</div>
					<div className="w3-third">
						<label className="w3-text-blue">Search:</label>
						<input className="w3-input w3-border w3-padding" type="text"
							placeholder="Search for names..." id="searchTarget"
							defaultValue={
								settings.targetECU === "CGW_CCU" ? "?sender=CGW_CCU" : ""
							}
							onKeyUp={() => {
								const itemsFound = searchItems("searchTarget", DEFAULT_SEARCH_ITEMS, EXTRA_SEARCH_ITEMS, EXTRA_SEARCH_INDICES); 
								this.regenIndex(itemsFound);
							}}
						/>
					</div>
				</div>
				<table className="w3-table-all w3-hoverable w3-margin-top MyStckyHeader" id="myTable">
					<thead>
						<tr className="w3-light-green MyStckyHeader">
							<th onClick={() => {sortTable(COLUMNS.INDEX, true);}} >Index</th>
							<th onClick={() => {sortTable(COLUMNS.SIGNAL);}}      >Signal</th>
							<th>Physical Value</th>
							<th>Raw Value</th>
							<th>Value Descriptions</th>
							<th>Set</th>
							<th onClick={() => {sortTable(COLUMNS.INIT_VALUE, true);}} >Init Value</th>
							<th onClick={() => {sortTable(COLUMNS.TYPE);}}             >Type</th>
							<th>Range</th>
							<th>Description</th>
							<th onClick={() => {sortTable(COLUMNS.SENDER);}}           >Sender</th>
							<th>Receivers</th>
						</tr>
					</thead>
					<tbody>
						{this.state.txSignals.map((name) => 
							<EcuSignal key={name} 
								index={index++} 
								signal={this.state.txSignalMap.get(name)}
								pdu={this.signalToPduMap.get(name)}
								tx={true} readonly={this.isReadOnlySignal(name)} />)}
						{this.state.rxSignals.map((name) => 
							<EcuSignal key={name} 
								index={index++} 
								signal={this.state.rxSignalMap.get(name)}
								pdu={this.signalToPduMap.get(name)}
								tx={false}  readonly={this.isReadOnlySignal(name)} />)}
					</tbody>
				</table>
			</div>
		);
	}
}

function EcuSignal(props) {
	const initPhysicalValue = props.signal.initValue;
	const initRawValue = physToRaw(initPhysicalValue, props.signal);
	
	const [physicalValue, setPhysicalValue] = useState(Number(initPhysicalValue));
	
	const physical_value_field_name = "physical_value_field_" + props.signal.name;
	const raw_value_field_name = "raw_value_field_" + props.signal.name;
	const set_button_name = "set_button_" + props.signal.name;
	const value_desc_name = "value_desc_" + props.signal.name;
	
	const receivers = [];
	if (props.signal.receiverAry != null && props.signal.receiverAry.length !== 0) {
		for (const receiver of props.signal.receiverAry) {
			receivers.push(receiver);
		}
	}
	receivers.sort();

	const update = (name, value = physicalValue) => {
		settings.busySignal = null;
		let valueToSend = value;
		if (props.signal.length <= 32) {
			valueToSend = Number(value);
		}
		
		let jsonData = {
			signals: [ { name : name, value : valueToSend } ]
		};
		
		setSignals(jsonData);
	}

	function getRange(signal) {
		let min = 0;
		let max;
		if (signal.length <= 32) {
			const enumSizeMax = 1 << signal.length;
			const enumSize = signal.valueDescAry.length;

			if (signal.isSigned && enumSize < enumSizeMax) {
				if (signal.length < 32) {
					max = (1 << (signal.length - 1)) - 1;
					min = -(max + 1);
				}
				else {
					max = 0x7FFFFFFF;
					min = -(0x80000000);
				}
			}
			else {
				if (signal.length < 32) {
					max = (1 << signal.length) - 1;
				}
				else {
					max = 0xFFFFFFFF;
				}
			}

			if (signal.factor !== 1) {
				max *= signal.factor;
				min *= signal.factor;
			}
			if (signal.offset !== 0) {
				max += signal.offset;
				min += signal.offset;
			}
			if (signal.factor !== 1) {
				max = Number(Number(max).toFixed(5));
				min = Number(Number(min).toFixed(5));
			}
		}
		else {
			max = 0xFFFFFFFFFFFFFFFFn;
			let div = BigInt(1 << (64 - signal.length));
			max /= div;
		}

		let range = min + " ~ " + max;

		return range;
	}

	function setRawValue(value) {
		if (settings.serverLoc === GATEWAY) {
			const rawVal = String(value).split(" : ")[0];
			let physVal = Number(rawVal) * Number(props.signal.factor) + Number(props.signal.offset);
			physVal = Number(physVal.toFixed(5));
			update(props.signal.name, physVal);
		}
	}

	function setRawValue2(event) {
		const options = event.target.getElementsByTagName("option");
		if (options.length === 1) {
			setRawValue(event.target.value);
		}
	}

	return (
		<tr>
			<td>{props.index}</td>
			<td>{props.signal.name}</td>
			<td>
				<input
					type="text" id={physical_value_field_name}
					value={physicalValue} 
					onChange={(e) => { setPhysicalValue(e.target.value); }}
					onFocus={() => { settings.busySignal = props.signal; }}
					readOnly={props.readonly} >
				</input>
			</td>
			<td id={raw_value_field_name}>{initRawValue}</td>
			{
			Object.keys(props.signal.valueDescAry).length > 0 ?
			<td>
				<select 
					id={value_desc_name} 
					style={{width: "100%"}} 
					onChange={(e) => {setRawValue(e.target.value)}} 
					onFocus={(e) => {setRawValue2(e)}}
				>
				{
					Object.keys(props.signal.valueDescAry).map((key) => 
						<option key={key}>
						{key.substring(5) + " : " + props.signal.valueDescAry[key]}
						</option>
					)
				}
				</select>
			</td>
			: 
			<td>-</td>
			}
			{
			props.tx ?
			<td><button id={set_button_name} onClick={() => update(props.signal.name)} disabled={props.readonly}>Set</button></td>
			:
			<td>-</td>
			}
			<td>{props.signal.initValue}</td>
			<td>{props.signal.apType}</td>
			<td>{getRange(props.signal)}</td>
			<td>{props.signal.desc}</td>
			<td>{props.pdu.sender}</td>
			{
			receivers.length !== 0 ?
			<td>
				<select style={{width: "100%"}} >
				{receivers.map((receiver) => 
				<Receiver key={props.signal.name + "_" + receiver} receiver={receiver} />					
				)}
				</select>
			</td>
			:
			<td>-</td>
			}
		</tr>
	);
}

function Receiver(props) {
	return (
		<option>{props.receiver}</option>
	);
}

function physToRaw(physVal, signal) {
	let rawVal = physVal;
	if (signal.factor > 0) {
		rawVal -= signal.offset;
		rawVal /= signal.factor;
		rawVal = Math.round(rawVal.toString());
	}
	return rawVal;
}

export function setTarget(target) {
	settings.targetECU = target;
}

/*
 * New socket.io vehicle api
 */
const setSignals = (jsonData, callback = null) => {
    socket.emit("set", jsonData);
    if (callback) {
        socket.on("set", callback);
    }
};

// const getSignals = (jsonData, callback) => {
//     socket.emit("get", jsonData);
//     if (callback) {
//         socket.on("get", callback);
//     }
// };

const subscribeSignals = (jsonData, callback = null) => {
    socket.emit("subscribe", jsonData);
    if (callback) {
        socket.on("notify/" + jsonData.channel, callback);
    }
}

const unsubscribeSignals = (jsonData, callback = null) => {
    socket.emit("unsubscribe", jsonData);
    socket.off("notify/" + jsonData.channel);
}

export default memo(TargetECU);