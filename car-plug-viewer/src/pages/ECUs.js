/**
 * 
 */
import React from "react";
import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { searchItems, sortTable } from "./Common.js";
import { setTarget } from "./TargetECU.js"

const BUS = "BUS";
const ANY = "ANY";

const ECU_COLUMN = 1;
const BUS_COLUMN = 2;

const DEFAULT_SEARCH_ITEMS = [ ECU_COLUMN, BUS_COLUMN ];
const EXTRA_SEARCH_ITEMS = [ BUS ];
const EXTRA_SEARCH_INDICES = [ BUS_COLUMN ];


class ECUs extends React.Component {

	ecuMap = new Map();
	busMap = new Map();
	txPduMap = new Map();
	rxPduMap = new Map();
	txSignalMap = new Map();
	rxSignalMap = new Map();
	ecus = [];
	buses = [];
	
	busSet = new Set();
	
	constructor(props) {
		super(props);
		
		if (props.signalDB != null) {
			props.signalDB.pdus.forEach((pdu) => {
				if (!this.ecuMap.has(pdu.sender)) {
					this.ecuMap.set(pdu.sender, pdu.sender);
					this.ecus.push(pdu.sender);
					// The same ECU can belong to several buses.
					this.busMap.set(pdu.sender, new Map());
					this.txPduMap.set(pdu.sender, new Map());
					this.rxPduMap.set(pdu.sender, new Map());
					this.txSignalMap.set(pdu.sender, new Map());
					this.rxSignalMap.set(pdu.sender, new Map());
					
					this.busSet.add(pdu.bus);
				}

				this.busMap.get(pdu.sender).set(pdu.bus, pdu.bus);
				this.txPduMap.get(pdu.sender).set(pdu.name, pdu);
			});

			props.signalDB.pdus.forEach((pdu) => {
				pdu.signals.forEach((signal) => {
					this.txSignalMap.get(pdu.sender).set(signal.name, signal);

					if (signal.receiverAry != null && signal.receiverAry.length !== 0) {
						for (const receiver of signal.receiverAry) {
							if (this.ecuMap.has(receiver)) {
								if (receiver === "CGW_CCU") {
									this.busMap.get(receiver).set(pdu.bus, pdu.bus);
								}
								this.rxPduMap.get(receiver).set(pdu.name, pdu);
								this.rxSignalMap.get(receiver).set(signal.name, signal);
							}
						}
					}
				});
			});
		}

		this.ecus.sort();
		
		this.busSet.forEach((bus) => {
			this.buses.push(bus);
		});
		this.buses.sort();
    }

	changeBus(bus) {
		if (bus === ANY) {
			document.getElementById("searchECU").value = "";
		}
		else {
			document.getElementById("searchECU").value = "?bus=" + bus;
		}
		
		const itemsFound = searchItems("searchECU", DEFAULT_SEARCH_ITEMS, EXTRA_SEARCH_ITEMS, EXTRA_SEARCH_INDICES);
		this.regenIndex(itemsFound);
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
		document.getElementById("selectBus").value = ANY;
		const itemsFound = searchItems("searchECU", DEFAULT_SEARCH_ITEMS, EXTRA_SEARCH_ITEMS, EXTRA_SEARCH_INDICES);
		this.regenIndex(itemsFound);

		if (searchTxt.toLowerCase().indexOf("?bus=") > -1) {
			if (itemsFound.length > 0 && searchTxt.length > "?bus=".length) {
				const filter = searchTxt.substring("?bus=".length).toUpperCase();
				const options = document.getElementById("selectBus").getElementsByTagName("option");
				for (const option of options) {
					if (option.innerText.toUpperCase() === filter) {
						document.getElementById("selectBus").value = option.innerText;
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
						<label className="w3-text-blue">Select Bus:</label>
						<select className="w3-select w3-border" name="option" id="selectBus"
							defaultValue={ANY}
							onChange={(e) => {
								this.changeBus(e.target.value);
							}} >
							{this.buses.map((bus) => 
							<option key={bus}>{bus}</option>
							)}
							<option>{ANY}</option>
						</select>
					</div>
					<div className="w3-third">
						<label className="w3-text-blue">Search:</label>
						<input className="w3-input w3-border w3-padding" type="text"
							placeholder="Search for names..."
							id="searchECU"
							onKeyUp={(e) => {
								this.doSearch(e.target.value);
							}} />
					</div>
				</div>
				<table className="w3-table-all w3-hoverable w3-margin-top MyStckyHeader" id="myTable">
					<thead>
						<tr className="w3-light-green MyStckyHeader">
							<th onClick={() => {sortTable(0, true);}}>Index</th>
							<th onClick={() => {sortTable(1);}}>ECU</th>
							<th onClick={() => {sortTable(2);}}>Bus</th>
							<th onClick={() => {sortTable(3, true);}}>Tx Messages</th>
							<th onClick={() => {sortTable(4, true);}}>Rx Messages</th>
							<th onClick={() => {sortTable(5, true);}}>Tx Signals</th>
							<th onClick={() => {sortTable(6, true);}}>Rx Signals</th>
							<th>Interactive Test</th>
						</tr>
					</thead>
					<tbody>
						{this.ecus.map((ecu) => 
						<ECU key={ecu}
							index={index++}
							ecu={ecu}
							busList={Array.from(this.busMap.get(ecu).keys())}
							txPdu={this.txPduMap.get(ecu).size}
							rxPdu={this.rxPduMap.get(ecu).size}
							txSig={this.txSignalMap.get(ecu).size}
							rxSig={this.rxSignalMap.get(ecu).size} />)}
					</tbody>
				</table>
			</div>
		);
	}
}

function ECU(props) {
	const navigate = useNavigate();

	const shoot = (ecu) => {
		setTarget(ecu);
		navigate("/targetECU");
	};
	
	var busString = null;
	if (props.busList.length > 1) {
		props.busList.sort();
	}
	props.busList.forEach((bus) => {
		if (busString == null) {
			busString = bus;
		}
		else {
			busString += ", " + bus;
		}
	});

	return (
		<tr>
			<td>{props.index}</td>
			<td>{props.ecu}</td>
			{
				props.busList.length > 1 ?
				<td>
				<select>
				{props.busList.map((bus) =>
				<Bus key={props.ecu + "_" + bus} bus={bus} />)} 
				</select>
				</td>
				:
				<td>{props.busList[0]}</td>
			}
			<td>{props.txPdu}</td>
			<td>{props.rxPdu}</td>
			<td>{props.txSig}</td>
			<td>{props.rxSig}</td>
			<td><button onClick={() => shoot(props.ecu)}>Test</button></td>
		</tr>
	);
}

function Bus(props) {
	return (
		<option>{props.bus}</option>
	);
}

export default memo(ECUs);