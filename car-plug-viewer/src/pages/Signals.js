/**
 * 
 */
import React from "react";
import { memo } from "react";
import { sortTable } from "./Common.js";

import * as Popover from '@radix-ui/react-popover';
import { Cross2Icon } from '@radix-ui/react-icons';
import './styles.css';

/* global BigInt */


const SENDER = "SENDER";
const RECEIVER = "RECEIVER";
const MESSAGE = "MESSAGE";
const MSG = "MSG";
const PDU = "PDU";
const SIGNAL = "SIGNAL";
const ANY = "ANY";

const COLUMNS = {
	INDEX      : 0,
	SIGNAL     : 1,
	DESC       : 2,
	VALUE_DESC : 3,
	MESSAGE    : 4,
	SENDER     : 5,
	RECEIVER   : 6,
	STARTBIT   : 7,
	LENGTH     : 8,
	INIT_VALUE : 9,
	FACTOR     : 10,
	OFFSET     : 11,
	MIN        : 12,
	MAX        : 13,
	TYPE       : 14,
	RANGE      : 15,
};

const EXTRA_SEARCH_ITEMS = [ SENDER, RECEIVER, MESSAGE, MSG, PDU ];


class Signals extends React.Component {
	
	allSignals = [];
	pdus = [];
	ecus = [];
	
	senderMap = new Map();
	receiverMap = new Map();
	signalToPduMap = new Map();

	signalDB = null;
	
	constructor(props) {
        super(props);

		this.signalDB = props.signalDB;

		var filterText = "Search for names...";
		const signals = [];
		const signalMap = new Map();
		const ecuMap = new Map();
		
		this.state = {
			filterText : filterText,
			signals : signals,
		};
		
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
		
		this.state.filterText = "?sender=" + this.ecus[0];

		for (const pdu of this.pdus) {
			if (pdu.sender === this.ecus[0]) {
				for (const signal of pdu.signals) {
					signals.push(signal);
				}
			}
		}
    }

//	componentDidMount() {
//		console.log("componentDidMount()");
//	}
//	
//	componentDidUpdate() {
//		console.log("componentDidUpdate()");
//	}
//
//	componentWillUnmount() {
//		console.log("componentWillUnmount()");
//	}
  
	filterItems = (inputValue, filterTypes) => {
		var filter = inputValue.toUpperCase();
		var filterType = SIGNAL;

		if (filter.startsWith("?")) {
			let filterValid = false;
			const equalsIndex = filter.indexOf("=");
			if (equalsIndex > -1) {
				for (let i = 0; i < filterTypes.length; i++) {
					if (filter.indexOf(filterTypes[i]) > -1) {
						filterType = filterTypes[i];
						filter = filter.substring(equalsIndex + 1);
						filterValid = true;
						break;
					}
				}
			}

			if (!filterValid) {
				filter = "";
			}
		}

		const signals = [];
		if (filterType === SENDER) {
			for (const pdu of this.pdus) {
				if (pdu.sender === filter) {
					for (const signal of pdu.signals) {
						signals.push(signal);
					}
				}
			}
		}
		else if (filterType === RECEIVER) {
			for (const signal of this.allSignals) {
				for (const receiver of this.receiverMap.get(signal)) {
					if (receiver === filter) {
						signals.push(signal);
					}
				}
			}
		}
		else if (filterType === MESSAGE || filterType === MSG || filterType === PDU) {
			for (const signal of this.allSignals) {
				const pdu = this.signalToPduMap.get(signal.name);
				if (pdu.name.toUpperCase() === filter || String(pdu.id) === filter) {
					signals.push(signal);
				}
			}
		}
		else if (filterType === SIGNAL) {
			if (filter.length > 0) {
				if (filter === ANY) {
					for (const signal of this.allSignals) {
						signals.push(signal);
					}
				}
				else {
					for (const signal of this.allSignals) {
						if (signal.name.toUpperCase().indexOf(filter) > -1) {
							signals.push(signal);
						}
					}
				}
			}
		}
		
		this.setState({
			filterText : inputValue,
			signals : signals,
		});
		
		return signals;
	}
	
	changeSender(sender) {
		if (sender === ANY) {
			if (document.getElementById("selectReceiver").value === ANY) {
				document.getElementById("searchSignal").value = sender;
				this.filterItems(sender, EXTRA_SEARCH_ITEMS);
			}
		}
		else {
			const filter = "?sender=" + sender;
			document.getElementById("searchSignal").value = filter;
			document.getElementById("selectReceiver").value = ANY;
			this.filterItems(filter, EXTRA_SEARCH_ITEMS);
		}
	}
	
	changeReceiver(receiver) {
		if (receiver === ANY) {
			if (document.getElementById("selectSender").value === ANY) {
				document.getElementById("searchSignal").value = receiver;
				this.filterItems(receiver, EXTRA_SEARCH_ITEMS);
			}
		}
		else {
			const filter = "?receiver=" + receiver;
			document.getElementById("searchSignal").value = filter;
			document.getElementById("selectSender").value = ANY;
			this.filterItems(filter, EXTRA_SEARCH_ITEMS);
		}
	}
	
	doSearch(searchTxt) {
		document.getElementById("selectSender").value = ANY;
		document.getElementById("selectReceiver").value = ANY;
		const itemsFound = this.filterItems(searchTxt, EXTRA_SEARCH_ITEMS);

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
							defaultValue={this.ecus[0]}
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
							placeholder={this.state.filterText} id="searchSignal"
							defaultValue={this.state.filterText}
							onKeyUp={(e) => {
								this.doSearch(e.target.value);
							}} />
					</div>
				</div>
				<table className="w3-table-all w3-hoverable w3-margin-top MyStckyHeader" id="myTable">
					<thead>
						<tr className="w3-light-green MyStckyHeader">
							<th onClick={() => {sortTable(COLUMNS.INDEX, true);}}      >Index</th>
							<th onClick={() => {sortTable(COLUMNS.SIGNAL);}}           >Signal</th>
							<th                                                        >Description</th>
							<th                                                        >Value Descriptions</th>
							<th onClick={() => {sortTable(COLUMNS.MESSAGE);}}          >Message</th>
							<th onClick={() => {sortTable(COLUMNS.SENDER);}}           >Sender</th>
							<th                                                        >Receivers</th>
							<th onClick={() => {sortTable(COLUMNS.STARTBIT, true);}}   >StartBit</th>
							<th onClick={() => {sortTable(COLUMNS.LENGTH, true);}}     >Length</th>
							<th onClick={() => {sortTable(COLUMNS.INIT_VALUE, true);}} >Init Value</th>
							<th onClick={() => {sortTable(COLUMNS.FACTOR, true);}}     >Factor</th>
							<th onClick={() => {sortTable(COLUMNS.OFFSET, true);}}     >Offset</th>
							<th onClick={() => {sortTable(COLUMNS.MIN, true);}}        >Min</th>
							<th onClick={() => {sortTable(COLUMNS.MAX, true);}}        >Max</th>
							<th onClick={() => {sortTable(COLUMNS.TYPE);}}             >Type</th>
							<th                                                        >Range</th>
						</tr>
					</thead>
					
					<tbody>
						{this.state.signals.map((signal) =>
							<Signal key={signal.name}
								index={index++}
								signal={signal}
								pdu={this.signalToPduMap.get(signal.name)}
								receivers={this.receiverMap.get(signal)}
								signalDB={this.signalDB}
							/>)}
					</tbody>
				</table>
			</div>
		);
	}
}

function Signal(props) {
	const valueDescriptions = [];
	const keys = [];
	const values = [];
	var index = 0;
	
	for (const key of Object.keys(props.signal.valueDescAry)) {
		keys.push(key.substring(5));
	}
	for (const value of Object.values(props.signal.valueDescAry)) {
		values.push(value);
	}
	for (let i = 0; i < keys.length; i++) {
		let desc = values[i];
		if (desc.length > 128) {
			desc = desc.substring(0, 128) + "...";
		}
		valueDescriptions.push(keys[i] + " : \"" + desc + "\"");
	}

	function getRange(signal) {
		let min = 0;
		let max;
		if (signal.length <= 32) {
			const enumSizeMax = 1 << signal.length;
			const enumSize = valueDescriptions.length;
			
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
	
	return (
		<tr>
			<td>{props.index}</td>
			<td>{props.signal.name}</td>
			<td><PopoverToEditKey signal={props.signal} /></td>
			{
			valueDescriptions.length !== 0 ?
			<td>
				<select style={{width: "100%"}} >
				{valueDescriptions.map((valueDesc) => 
				<ValueDescription key={"valueDesc_" + index++} valueDesc={valueDesc} />)}
				</select>
			</td> : 
			<td>-</td>
			}
			<td>{props.pdu.name}</td>
			<td>{props.pdu.sender}</td>
			{
			props.receivers.length !== 0 ?
			<td>
				<select style={{width: "100%"}} >
				{props.receivers.map((receiver) => 
				<Receiver key={props.signal.name + "_" + receiver} receiver={receiver} />					
				)}
				</select>
			</td> :
			<td>-</td>
			}
			<td>{props.signal.startBit}</td>
			<td>{props.signal.length}</td>
			<td>{props.signal.initValue}</td>
			<td>{props.signal.factor}</td>
			<td>{props.signal.offset}</td>
			<td>{props.signal.min}</td>
			<td>{props.signal.max}</td>
			<td>{props.signal.apType}</td>
			<td>{getRange(props.signal)}</td>
		</tr>
	);
}
	
function ValueDescription(props) {
	return (
		<option>{props.valueDesc}</option>
	);
}

function Receiver(props) {
	return (
		<option>{props.receiver}</option>
	);
}

const PopoverToEditKey = (props) => (
	<Popover.Root>
		<Popover.Trigger className="PopoverTrigger" id={"alias_" + props.signal.name}>
			{getSignalAlias(props.signal)}
		</Popover.Trigger>
		<Popover.Portal>
			<Popover.Content className="PopoverContent" sideOffset={5}>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
					<p className="Text" style={{ marginBottom: 10 }}>
						<b>{props.signal.name}</b>: Enter user key and description here.
					</p>
					<fieldset className="Fieldset">
						<label className="Label" htmlFor={"aliasInput_" + props.signal.name} >
							<b>Key:</b>
						</label>
						<input className="Input" id={"aliasInput_" + props.signal.name}
							defaultValue={getSignalAliasForInput(props.signal)}
							type="text"
							onFocus={(e)=>{
								e.target.value = getSignalAliasForInput(props.signal);
								document.getElementById("descInput_" + props.signal.name).value = props.signal.desc;
							}}
							readOnly
							onChange={(e) => {
								props.signal.alias = e.target.value;
								document.getElementById("alias_" + props.signal.name).innerText = e.target.value;
							}} />
					</fieldset>
					<fieldset className="Fieldset" style={{ alignItems: "start" }}>
						<label className="Label" htmlFor={"descInput_" + props.signal.name} >
							<b>Description:</b>
						</label>
						<textarea className="TextArea" id={"descInput_" + props.signal.name}
							defaultValue={props.signal.desc}
							type="textarea"
							onChange={(e) => {
								props.signal.desc = e.target.value;
							}} />
					</fieldset>
				</div>
				<Popover.Close className="PopoverClose" aria-label="Close">
					<Cross2Icon />
				</Popover.Close>
				<Popover.Arrow className="PopoverArrow" />
			</Popover.Content>
		</Popover.Portal>
	</Popover.Root>
);

function getSignalAlias(signal) {
	//return String(signal.alias);
	return "Edit";
}

function getSignalAliasForInput(signal) {
	//return String(signal.alias ? signal.alias : signal.name);
	return String(signal.alias ? signal.alias : "undefined");
}

export default memo(Signals);