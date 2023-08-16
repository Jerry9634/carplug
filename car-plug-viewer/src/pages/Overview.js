/**
 * 
 */
import React from "react";
import FileSaver from "file-saver";

const Overview = (props) => {
	var index = 1;
	var sumEcu = 0;
	var sumPdu = 0;
	var sumSignal = 0;

	const busList = [];
	const ecuMap = new Map();
	const pduMap = new Map();
	const signalMap = new Map();
	
	if (props.signalDB != null) {
		props.signalDB.pdus.forEach((pdu) => {
			const bus = pdu.bus;
			if (!ecuMap.has(bus)) {
				busList.push(bus);
				ecuMap.set(bus, new Map());
				pduMap.set(bus, new Map());
				signalMap.set(bus, new Map());
			}

			ecuMap.get(bus).set(pdu.sender, pdu.sender);
			pduMap.get(bus).set(pdu.name, pdu.name);
			for (const signal of pdu.signals) {
				signalMap.get(bus).set(signal.name, signal.name);
			}

			busList.sort();
		});
	}
	
	ecuMap.forEach((innerMap) => {
  		sumEcu += innerMap.size;
	});
	
	pduMap.forEach((innerMap) => {
  		sumPdu += innerMap.size;
	});
	
	signalMap.forEach((innerMap) => {
  		sumSignal += innerMap.size;
	});

	return (
		<div className="w3-margin-top w3-margin-left w3-margin-right">
			<h2>Overview</h2>
			<div className="w3-bar">
				<div className="w3-bar-item">
					<label><b>URL or Local Folder:</b></label>
				</div>
				<div className="w3-bar-item">
					<input style={{width:"500px"}} />
				</div>
				<div className="w3-bar-item">
					<button style={{width:"150px", marginBottom:"5px"}}>Fetch DB</button>
				</div>
				<div className="w3-bar-item">
					<button style={{ width: "150px", marginBottom: "5px" }} onClick={() => {
						const jsonTxt = JSON.stringify(props.signalDB);
						var blob = new Blob([jsonTxt], {
							type: "text/plain;charset=utf-8"
						});
						FileSaver.saveAs(blob, "SignalDB.json");
					}}>
					Download DB
					</button>
				</div>
			</div>
			<table className="w3-table-all w3-hoverable">
				<thead>
					<tr className="w3-light-green">
						<th>Index</th>
						<th>Bus</th>
						<th>ECU</th>
						<th>Messages</th>
						<th>Signals</th>
					</tr>
				</thead>
				<tbody>
					{busList.map((bus) => 
					<Bus key={bus}
						index={index++}
						bus={bus}
						ecuNo={ecuMap.get(bus).size}
						msgNo={pduMap.get(bus).size}
						sigNo={signalMap.get(bus).size} />)}
					<tr>
						<td>-</td>
						<td>-</td>
						<td><b>{sumEcu}</b></td>
						<td><b>{sumPdu}</b></td>
						<td><b>{sumSignal}</b></td>
					</tr>
				</tbody>
			</table>
		</div>
	);	
}

function Bus(props) {
	return (
		<tr>
			<td>{props.index}</td>
			<td>{props.bus}</td>
			<td>{props.ecuNo}</td>
			<td>{props.msgNo}</td>
			<td>{props.sigNo}</td>
		</tr>
	);
}

export default Overview;