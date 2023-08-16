/**
 * 
 */
import React from "react";
import { memo } from "react";
import { searchItems, sortTable } from "./Common.js";

const ID = "ID";
const IDHEX = "HEX";
const DLC = "DLC";
const BUS = "BUS";
const SENDER = "SENDER";
const RECEIVER = "RECEIVER";
const GenMsgSendType = "SENDTYPE";
const GenMsgCycleTime = "CYCLE";
const SIGNAL = "SIGNAL";
const GenSigSendType = "SENDTYPE";
const ANY = "ANY";

const COLUMNS = {
	INDEX    : 0,
	MESSAGE  : 1,
	ID       : 2,
	IDHEX    : 3,
	DLC      : 4,
	BUS      : 5,
	SENDER   : 6,
	RECEIVER : 7,
	GenMsgSendType  : 8,
	GenMsgCycleTime : 9,
	SIGNAL          : 10,
	GenSigSendType  : 11
};

const DEFAULT_SEARCH_ITEMS = [ COLUMNS.MESSAGE ];
const EXTRA_SEARCH_ITEMS = [ ID, IDHEX, DLC, BUS, SENDER, RECEIVER, 
							 GenMsgSendType, GenMsgCycleTime, SIGNAL, GenSigSendType ];
const EXTRA_SEARCH_INDICES = [
	COLUMNS.ID,
	COLUMNS.IDHEX,
	COLUMNS.DLC,
	COLUMNS.BUS,
	COLUMNS.SENDER,
	COLUMNS.RECEIVER,
	COLUMNS.GenMsgSendType,
	COLUMNS.GenMsgCycleTime,
	COLUMNS.SIGNAL_COLUMN,
	COLUMNS.GenSigSendType
];


class PDUs extends React.Component {

	pdus = [];
	ecus = [];
	receiverMap = new Map();
	signalMap = new Map();
			
	constructor(props) {
		super(props);
		
		const ecuMap = new Map();

		if (props.signalDB != null) {
			props.signalDB.pdus.forEach((pdu) => {
				this.pdus.push(pdu);
				
				const receiverSet = new Set();
				const signals = [];
				
				pdu.signals.forEach((signal) => {
					if (signal.receiverAry != null && signal.receiverAry.length !== 0) {
						for (const receiver of signal.receiverAry) {
							receiverSet.add(receiver);
						}
					}
					signals.push(signal.name);
					
					ecuMap.set(pdu.sender, pdu.sender);
				});
				
				const receivers = [];
				receiverSet.forEach((receiver) => {
					receivers.push(receiver);
				});
				receivers.sort();
				this.receiverMap.set(pdu, receivers);
				
				signals.sort();
				this.signalMap.set(pdu, signals);
			});
		}
		
		ecuMap.forEach((ecu) => {
			this.ecus.push(ecu);
		});
		this.ecus.sort();
	}

	changeSender(sender) {
		var search = false;
		if (sender === ANY) {
			if (document.getElementById("selectReceiver").value === ANY) {
				document.getElementById("searchPDU").value = "";
				search = true;
			}
		}
		else {
			document.getElementById("searchPDU").value = "?sender=" + sender;
			document.getElementById("selectReceiver").value = ANY;
			search = true;
		}
		
		if (search) {
			const itemsFound = searchItems("searchPDU", DEFAULT_SEARCH_ITEMS, EXTRA_SEARCH_ITEMS, EXTRA_SEARCH_INDICES);
			this.regenIndex(itemsFound);
		}
	}
	
	changeReceiver(receiver) {
		var search = false;
		if (receiver === ANY) {
			if (document.getElementById("selectSender").value === ANY) {
				document.getElementById("searchPDU").value = "";
				search = true;
			}
		}
		else {
			document.getElementById("searchPDU").value = "?receiver=" + receiver;
			document.getElementById("selectSender").value = ANY;
			search = true;
		}
		
		if (search) {
			const itemsFound = searchItems("searchPDU", DEFAULT_SEARCH_ITEMS, EXTRA_SEARCH_ITEMS, EXTRA_SEARCH_INDICES);
			this.regenIndex(itemsFound);
		}
	}
	
	regenIndex(itemsFound) {
		for (let i = 0; i < itemsFound.length; i++) {
			let td = itemsFound[i].getElementsByTagName("td")[0];
			if (td) {
				td.innerText = i + 1;
			}
		}
	}
	
	doSearch(searchTxt) {
		document.getElementById("selectSender").value = ANY;
		document.getElementById("selectReceiver").value = ANY;
		const itemsFound = searchItems("searchPDU", DEFAULT_SEARCH_ITEMS, EXTRA_SEARCH_ITEMS, EXTRA_SEARCH_INDICES);
		this.regenIndex(itemsFound);

		if (searchTxt.toLowerCase().indexOf("?sender=") > -1) {
			if (itemsFound.length > 0 && searchTxt.length > "?sender=".length) {
				const filter = searchTxt.substring("?sender=".length).toUpperCase();
				const options = document.getElementById("selectSender").getElementsByTagName("option");
				for (const option of options) {
					if (option.innerText.toUpperCase() === filter) {
						document.getElementById("selectSender").value = option.innerText;
					}
				}
			}
		}
		else if (searchTxt.toLowerCase().indexOf("?receiver=") > -1) {
			if (itemsFound.length > 0 && searchTxt.length > "?receiver=".length) {
				const filter = searchTxt.substring("?receiver=".length).toUpperCase();
				const options = document.getElementById("selectReceiver").getElementsByTagName("option");
				for (const option of options) {
					if (option.innerText.toUpperCase() === filter) {
						document.getElementById("selectReceiver").value = option.innerText;
					}
				}
			}
		}
	}
		
	render() {
		var index = 1;
		
		return (
			<div className="w3-margin-top w3-margin-left w3-margin-right">
				<div className="w3-row-padding">
					<div className="w3-third">
						<label className="w3-text-blue">Select Sender:</label>
						<select className="w3-select w3-border" name="option" id="selectSender"
							defaultValue={ANY}
							onChange={(e) => {
								this.changeSender(e.target.value);
							}} >
							{this.ecus.map((ecu) => 
							<option key={ecu}>{ecu}</option>
							)}
							<option>{ANY}</option>
						</select>
					</div>
					<div className="w3-third">
						<label className="w3-text-blue">Select Receiver:</label>
						<select className="w3-select w3-border" name="option" id="selectReceiver"
							defaultValue={ANY}
							onChange={(e) => {
								this.changeReceiver(e.target.value);
							}} >
							{this.ecus.map((ecu) => 
							<option key={ecu}>{ecu}</option>
							)}
							<option>{ANY}</option>
						</select>
					</div>
					<div className="w3-third">
						<label className="w3-text-blue">Search:</label>
						<input className="w3-input w3-border w3-padding" type="text"
							placeholder="Search for names... For others, type '?ID=111'" id="searchPDU"
							onKeyUp={(e) => {
								this.doSearch(e.target.value);
							}}
						/>
					</div>
				</div>
				<table className="w3-table-all w3-hoverable w3-margin-top MyStckyHeader" id="myTable">
					<thead>
						<tr className="w3-light-green MyStckyHeader">
							<th onClick={() => {sortTable(COLUMNS.INDEX, true);}} >Index</th>
							<th onClick={() => {sortTable(COLUMNS.MESSAGE);}}     >Message</th>
							<th onClick={() => {sortTable(COLUMNS.ID, true);}}    >ID</th>
							<th onClick={() => {sortTable(COLUMNS.IDHEX);}}       >ID (Hex)</th>
							<th onClick={() => {sortTable(COLUMNS.DLC, true);}}   >DLC</th>
							<th onClick={() => {sortTable(COLUMNS.BUS);}}         >Bus</th>
							<th onClick={() => {sortTable(COLUMNS.SENDER);}}      >Sender</th>
							<th>Receivers</th>
							<th onClick={() => {sortTable(COLUMNS.GenMsgSendType);}}        >Tx Method</th>
							<th onClick={() => {sortTable(COLUMNS.GenMsgCycleTime, true);}} >Cycle Time</th>
							<th>Signals</th>
							<th onClick={() => {sortTable(COLUMNS.GenSigSendType);}}        >GenSigSendType</th>
						</tr>
					</thead>
					<tbody>
						{this.pdus.map((pdu) => 
						<Pdu key = {pdu.name}
							index={index++} 
							pdu={pdu} 
							receivers={this.receiverMap.get(pdu)}
							signals={this.signalMap.get(pdu)}
						/>)}
					</tbody>
				</table>
			</div>
		);
	}
}

function Pdu(props) {
	var genSigSendType = "None";
	if (props.pdu.signals.length > 0) {
		genSigSendType = props.pdu.signals[0].GenSigSendType;
	}
	return (
		<tr>
			<td>{props.index}</td>
			<td>{props.pdu.name}</td>
			<td>{props.pdu.id}</td>
			<td>{props.pdu.hexId}</td>
			<td>{props.pdu.DLC}</td>
			<td>{props.pdu.bus}</td>
			<td>{props.pdu.sender}</td>
			{
			props.receivers.length !== 0 ?
			<td>
				<select style={{width: "100%"}} >
				{props.receivers.map((receiver) => 
				<Receiver key={props.pdu.name + "_" + receiver} receiver={receiver} />					
				)}
				</select>
			</td>
			:
			<td>-</td> }
			<td>{props.pdu.GenMsgSendType}</td>
			<td>{props.pdu.GenMsgCycleTime}</td>
			<td>
				<select style={{width: "100%"}} >
				{props.signals.map((signal) => 
				<Signal key={props.pdu.name + "_" + signal} signal={signal} />					
				)}
				</select>
			</td>
			<td>{genSigSendType}</td>
		</tr>
	);
}

function Receiver(props) {
	return (
		<option>{props.receiver}</option>
	);
}

function Signal(props) {
	return (
		<option>{props.signal}</option>
	);
}

export default memo(PDUs);