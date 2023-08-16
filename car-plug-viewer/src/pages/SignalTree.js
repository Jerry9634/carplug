/**
 * 
 */
import React from "react";
import { memo } from "react";
import "./SignalTree.css";
import vehicleApi from "./VehicleAPI.json";

/* global BigInt */

class SignalTree extends React.Component {

	signalMap = new Map();
	signalDBMap = new Map();
	senderMap = new Map();
	selectedListItem = null;
	ecuMap = new Map();

	constructor(props) {
        super(props);
		this.state = {
			signalKey : "-",
			signalName: "-",
			description: "-",
			valueDescAry: "-",
		};

		if (props.signalDB != null) {
			props.signalDB.pdus.forEach((pdu) => {
				pdu.signals.forEach((signal) => {
					this.signalDBMap.set(signal.name, signal);
					this.senderMap.set(signal, pdu.sender);
				});
			});
		}

		const ecuNames = [
			{ shortName: "CGW",     fullName: "Central Gateway" },
			{ shortName: "CCU",     fullName: "Central Communication Unit" },
			{ shortName: "CGW_CCU", fullName: "Central Gateway / Central Communication Unit" },
			// Body
			{ shortName: "AFS",      fullName: "Adaptive Front lighting System" },
			{ shortName: "APSU",     fullName: "Assist Power Seat Module" },
			{ shortName: "ASAU",     fullName: "?" },
			{ shortName: "ATS",      fullName: "Armrest Touch Screen" },
			{ shortName: "BDC",      fullName: "Body Domain Controller" },
			{ shortName: "BLTN_CAM", fullName: "Built-in CAM" },
			{ shortName: "BMS_B1",   fullName: "Battery Monitoring System" },
			{ shortName: "CDM",      fullName: "Charging Door Module" },
			{ shortName: "CDM_HS",   fullName: "Charging Door Module" },
			{ shortName: "CMS_LH",   fullName: "Camera Monitoring System LH" },
			{ shortName: "CMS_RH",   fullName: "Camera Monitoring System RH" },
			{ shortName: "CTM",      fullName: "Can-type Trailer Module" },
			{ shortName: "DLBCU",    fullName: "Driver Lumber Bolster Cushion Unit" },
			{ shortName: "DPSU",     fullName: "Driver Power Seat Unit" },
			{ shortName: "DSAU",     fullName: "?" },
			{ shortName: "DSM",      fullName: "Digital Side Mirror" },
			{ shortName: "FCS",      fullName: "Front Console Switch" },
			{ shortName: "FPM",      fullName: "Finger Print Module" },
			{ shortName: "HOD",      fullName: "Hands Off Detection" },
			{ shortName: "IFS",      fullName: "Intelligent Front lighting System" },
			{ shortName: "ILCU_LH",  fullName: "Integrated LED headlamp Control Unit - LH" },
			{ shortName: "ILCU_RH",  fullName: "Integrated LED headlamp Control Unit - RH" },
			{ shortName: "MFSW",     fullName: "Multi Function Switch" },
			{ shortName: "MLM",      fullName: "Mood Lamp Module" },
			{ shortName: "OHCL",     fullName: "Overhead Console Lamp" },
			{ shortName: "OMSW",     fullName: "Outside Mirror Switch" },
			{ shortName: "PDC",      fullName: "Powernet Domain Controller" },
			{ shortName: "PFSU",     fullName: "Power Folding Seat Unit" },
			{ shortName: "PSB",      fullName: "Pre-safe Seat Belt" },
			{ shortName: "PSD",      fullName: "Power Sliding Door" },
			{ shortName: "PSM",      fullName: "Power Seat Module" },
			{ shortName: "PSU",      fullName: "?" },
			{ shortName: "PTGM",     fullName: "Power Tail Gate Module" },
			{ shortName: "PTL",      fullName: "Power Trunk Lid" },
			{ shortName: "PWSW",     fullName: "Power Window Switch" },
			{ shortName: "RCM",      fullName: "Roof Control Module" },
			{ shortName: "RCS",      fullName: "Road Control Switch" },
			{ shortName: "RDC",      fullName: "Rear Door Curtain" },
			{ shortName: "RLHV",     fullName: "?" },
			{ shortName: "RLPSU",    fullName: "Rear Left Power Seat Unit" },
			{ shortName: "RRHV",     fullName: "?" },
			{ shortName: "RRPSU",    fullName: "Rear Right Power Seat Unit" },
			{ shortName: "RWPC",     fullName: "Rear Wireless Power Charger" },
			{ shortName: "SBCM_AST", fullName: "Side Body zone Control Module - Assistant" },
			{ shortName: "SBCM_DRV", fullName: "Side Body zone Control Module - Driver" },
			{ shortName: "SBCM_RL",  fullName: "Side Body zone Control Module - Rear Left" },
			{ shortName: "SBCM_RR",  fullName: "Side Body zone Control Module - Rear Right" },
			{ shortName: "SCM",      fullName: "Steering Column Module" },
			{ shortName: "SGU",      fullName: "Smart Glass Unit" },
			{ shortName: "SHVU_FR",  fullName: "Seat Heater & Ventilation Unit - Front" },
			{ shortName: "SHVU_RR",  fullName: "Seat Heater & Ventilation Unit - Rear" },
			{ shortName: "SLB",      fullName: "?" },
			{ shortName: "SWRC",     fullName: "Steering Wheel Remote Controller" },
			{ shortName: "WPC",      fullName: "Wireless Power Charger" },
			// Chassis
			{ shortName: "ABS",   fullName: "Anti-lock Brake System" },
			{ shortName: "ACU",   fullName: "Airbag Control Unit" },
			{ shortName: "CDCU",  fullName: "Chassis Domain Control Unit" },
			{ shortName: "ECS",   fullName: "Electronic Control Suspension" },
			{ shortName: "ESC",   fullName: "Electronic Stability Control" },
			{ shortName: "MDPS",  fullName: "Motor Driven Power Steering" },
			{ shortName: "ODS",   fullName: "Occupant Detection Sensor" },
			{ shortName: "RCU",   fullName: "Redundancy Control Unit" },
			{ shortName: "RGW_C", fullName: "?" },
			{ shortName: "RWS",   fullName: "Rear Wheel Sensor" },
			{ shortName: "TPMS",  fullName: "Tire Pressure Monitoring System" },
			// Extended
			{ shortName: "ADAS_DRV", fullName: "ADAS Driving ECU" },
			{ shortName: "ADAS_PRK", fullName: "ADAS Parking ECU" },
			{ shortName: "AHLS",     fullName: "Active Hood Lift System" },
			{ shortName: "CLU",      fullName: "Cluster Unit" },
			{ shortName: "DATC",     fullName: "Dual Automatic Temperature Control" },
			{ shortName: "FR_CMR",   fullName: "Front Camera" },
			{ shortName: "HUD",      fullName: "Head-Up Display" },
			{ shortName: "RR_C_RDR", fullName: "Rear Corner Radar" },
			// Multimedia
			{ shortName: "ADP",    fullName: "Acoustic Design Processor" },
			{ shortName: "AMP",    fullName: "Amplifier" },
			{ shortName: "H_U_MM", fullName: "Head Unit - Multimedia" },
			{ shortName: "ICC",    fullName: "In Cabin Camera" },
			{ shortName: "MKBD",   fullName: "Multimedia Keyboard" },
			{ shortName: "SML",    fullName: "Sound Mood Lamp" },
			{ shortName: "VESS",   fullName: "Virtual Engine Sound System" },
			// Powertrain
			{ shortName: "AWD",      fullName: "All-Wheel Drive" },
			{ shortName: "EMS",      fullName: "Engine Management System" },
			{ shortName: "LSD",      fullName: "Electric Limited Slip Differential" },
			{ shortName: "OPU",      fullName: "Oil Pump Unit" },
			{ shortName: "SBW",      fullName: "Shift-By-Wire lever" },
			{ shortName: "SCU",      fullName: "Shift-by-wire Control Unit" },
			{ shortName: "SCU_FF",   fullName: "Shift-by-wire Control Unit Front-engine Front-drive" },
			{ shortName: "EVSCU_FF", fullName: "EV Shift-by-wire Control Unit Front-engine Front-drive" },
			{ shortName: "TCU",      fullName: "Transmission Control Unit" },
			{ shortName: "VDU",      fullName: "Virtual Driver Unit" },
			{ shortName: "WCCU",     fullName: "Wireless Charge Converter Unit" },
			// Powertrain2
			{ shortName: "BHDC",  fullName: "Bi-directional High voltage DC-DC Converter" },
			{ shortName: "BMS",   fullName: "Battery Monitoring System" },
			{ shortName: "CCM",   fullName: "Charging Control Module" },
			{ shortName: "FACU",  fullName: "Fuel cell Air Control Unit" },
			{ shortName: "FCU",   fullName: "Fuel cell Control Unit" },
			{ shortName: "FSVM",  fullName: "Fuel cell Stack Voltage Monitor" },
			{ shortName: "F_MCU", fullName: "Front Motor Control Unit" },
			{ shortName: "HCU",   fullName: "Hybrid Control Unit" },
			{ shortName: "HMU",   fullName: "Hydrogen storage system Management Unit" },
			{ shortName: "ICCU",  fullName: "Integrated Charging Control Unit" },
			{ shortName: "LDC",   fullName: "Low voltage DC-DC Converter" },
			{ shortName: "MCU",   fullName: "Motor Control Unit" },
			{ shortName: "OBC",   fullName: "On-Board Charger" },
			{ shortName: "R_MCU", fullName: "Rear Motor Control Unit" },
			{ shortName: "SDC",   fullName: "Solar DC-DC Converter" },
			{ shortName: "V2LC",  fullName: "V2L Converter" },
			{ shortName: "VCMS",  fullName: "Vehicle Charging Management System" },
			{ shortName: "VCU",   fullName: "Vehicle Control Unit" },
		];

		for (const ecuName of ecuNames) {
			this.ecuMap.set(ecuName.shortName, ecuName.fullName);
		}
    }

	handleTreeEvent(treeItem) {
		treeItem.parentElement.querySelector(".nested").classList.toggle("active");
		treeItem.classList.toggle("caret-down");
	}

	getList(subNode) {
		return (
			<ul>
				{Object.keys(subNode).map((key) => 
					<li key={key} ><span className="caret" onClick={(e) => this.handleTreeEvent(e.target)}>{key}</span>
						<ul className="nested">
							{Object.keys(subNode[key]).map((innerKey) => 
								this.getList2(subNode[key], innerKey)
							)}
						</ul>
					</li>
				)}
			</ul>
		);
	}

	getList2(subNode, key) {
		let jsObj = subNode[key];
		for (const innerKey of Object.keys(jsObj)) {
			let innerJsObj = jsObj[innerKey];
			this.signalMap.set(innerJsObj["key"], innerJsObj);
		}

		return (
			<li key={key} className="w3-tooltip" >
				<span className="caret" onClick={(e) => this.handleTreeEvent(e.target)}>{key}</span>
				<span className="w3-text">&nbsp;<em>{this.getEcuFullName(key)}</em></span>
				<ul className="nested">
				{Object.keys(jsObj).map((innerKey) => 
					<li key={innerKey} 
						sigkey={(jsObj[innerKey]["key"])} 
						onClick={(e) => this.handleSignal(e.target)}
						style={{cursor: "pointer"}}>
						{innerKey}
					</li>
				)}
				</ul>
			</li>
		);
	}

	getEcuFullName(shortName) {
		if (this.ecuMap.has(shortName)) {
			return "(" + this.ecuMap.get(shortName) + ")";
		}
		else {
			return "";
		}
	}

	handleSignal(listItem) {
		let signalKey = listItem.getAttribute("sigkey");
		let jsObj = this.signalMap.get(signalKey);
		this.setState({
			signalKey : signalKey,
			signalName: jsObj["name"],
			description: jsObj["desc"],
			valueDescAry: jsObj["valueDescAry"],
		});

		if (this.selectedListItem != null) {
			this.selectedListItem.setAttribute("style", "color: black; cursor: pointer;");
		}
		listItem.setAttribute("style", "color: blue; cursor: pointer;");
		this.selectedListItem = listItem;
	}

	getValueDescription(valueDescAry) {
		if (valueDescAry === "-" 
			|| valueDescAry === ""
			|| Object.keys(valueDescAry).length === 0) {
			return "-";
		}
		return (
			<select style={{width: "100%"}} >
				{
					Object.keys(valueDescAry).map((key) => 
						<option key={key}>
						{key.substring(5) + " : " + valueDescAry[key]}
						</option>
					)
				}
			</select>
		);
	}

	getReceivers() {
		if (this.state.signalName === "-") {
			return "-";
		}
		else {
			const signal = this.signalDBMap.get(this.state.signalName);
			if (signal.receiverAry != null && signal.receiverAry.length !== 0) {
				let receivers = [];
				for (const receiver of signal.receiverAry) {
					receivers.push(receiver);
				}
				receivers.sort();
				return (
					<select style={{width: "100%"}} >
						{receivers.map((receiver) => 
						<option key={receiver}>{receiver}</option>
						)}
					</select>
				);
			}
			else {
				return "-";
			}
		}
	}

	getRange() {
		if (this.state.signalName === "-") {
			return "-";
		}
		else {
			const signal = this.signalDBMap.get(this.state.signalName);
			let min = 0;
			let max;
			if (signal.length <= 32) {
				const enumSizeMax = 1 << signal.length;
				const enumSize = this.state.valueDescAry.length;

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
	}

	getProperty(property) {
		if (this.state.signalName === "-") {
			return "-";
		}
		else {
			let propertyVal = "-";
			const signal = this.signalDBMap.get(this.state.signalName);
			switch (property) {
			case "Sender":
				propertyVal = this.senderMap.get(signal);
				break;
			case "Type":
				propertyVal = signal.apType;
				break;
			case "Length":
				propertyVal = signal.length;
				break;
			case "Init Value":
				propertyVal = signal.initValue;
				break;
			case "Factor":
				propertyVal = signal.factor;
				break;
			case "Offset":
				propertyVal = signal.offset;
				break;
			case "Min":
				propertyVal = signal.min;
				break;
			case "Max":
				propertyVal = signal.max;
				break;
			default:
				break;
			}
			return propertyVal;
		}
	}
   
	render() {
		return (
			<div className="w3-row-padding w3-margin-top">
				<div className="w3-col w3-container" style={{ width: "40%" }}>
					<ul id="myUL">
						{
							Object.keys(vehicleApi).map((key) =>
								<li key={key}><span><h3>{"\u25B6"}{key}</h3></span>
									{this.getList(vehicleApi[key])}
								</li>
							)
						}
					</ul>
				</div>
				<div className="w3-col w3-container MyStckyHeader" style={{width:"60%"}}>
					<div className="w3-card-4">
						<header className="w3-container w3-blue">
							<h2>{this.state.signalKey}</h2>
						</header>

						<div className="w3-container">
							<table className="w3-table">
								<tbody>
								<tr>
									<td><b>Key</b></td>
									<td>{this.state.signalKey}</td>
								</tr>
								<tr>
									<td><b>CAN Signal</b></td>
									<td>{this.state.signalName}</td>
								</tr>
								<tr>
									<td><b>Description</b></td>
									<td>{this.state.description}</td>
								</tr>
								<tr>
									<td><b>Value Descriptions</b></td>
									<td>{this.getValueDescription(this.state.valueDescAry)}</td>
								</tr>
								<tr>
									<td><b>Sender</b></td>
									<td>{this.getProperty("Sender")}</td>
								</tr>
								<tr>
									<td><b>Receivers</b></td>
									<td>{this.getReceivers()}</td>
								</tr>
								<tr>
									<td><b>Length</b></td>
									<td>{this.getProperty("Length")}</td>
								</tr>
								<tr>
									<td><b>Init Value</b></td>
									<td>{this.getProperty("Init Value")}</td>
								</tr>
								<tr>
									<td><b>Factor</b></td>
									<td>{this.getProperty("Factor")}</td>
								</tr>
								<tr>
									<td><b>Offset</b></td>
									<td>{this.getProperty("Offset")}</td>
								</tr>
								<tr>
									<td><b>Min</b></td>
									<td>{this.getProperty("Min")}</td>
								</tr>
								<tr>
									<td><b>Max</b></td>
									<td>{this.getProperty("Max")}</td>
								</tr>
								<tr>
									<td><b>Data Type</b></td>
									<td>{this.getProperty("Type")}</td>
								</tr>
								<tr>
									<td><b>Range</b></td>
									<td>{this.getRange()}</td>
								</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		);
		/*
		return (
			<div>
				<h3>Vehicle Signal API</h3>
				<ul id="myUL">
					<li><span><h3>{"\u25B6"}vehicle</h3></span>
						<ul>
							<li>openClose</li>
							<li>seatingSafetyRestraints</li>
							<li><span className="caret" onClick={(e) => this.handleTreeEvent(e.target)}>driving</span>
								<ul className="nested">
									<li>driverProfiles</li>
									<li>steeringWheel</li>
									<li>mirrors</li>
									<li>startingPoweringOff</li>
									<li>shifting</li>
									<li>lights</li>
									<li>carStatus</li>
									<li>wipersWashers</li>
									<li>brakingStopping</li>
									<li>tractionControl</li>
									<li>parkAssist</li>
									<li>vehicleHold</li>
									<li>accelerationModes</li>
									<li>trackMode</li>
									<li>tripInformation</li>
								</ul>
							</li>
							<li>autopilot</li>
							<li>activeSafety</li>
							<li><span className="caret" onClick={(e) => this.handleTreeEvent(e.target)}>touchscreen</span>
								<ul className="nested">
									<li><span className="caret" onClick={(e) => this.handleTreeEvent(e.target)}>climate</span>
										<ul className="nested">
											<li>adjustSettings</li>
											<li>keepClimateOnDogCamp</li>
											<li>adjustFrontVents</li>
											<li>adjustRearVents</li>
											<li>cabinAirFilter</li>
											<li>cabinOverheatProtection</li>
										</ul>
									</li>
									<li>mapsNavigation</li>
									<li>media</li>
									<li>entertainment</li>
									<li>phone</li>
									<li>voiceCommands</li>
									<li>safetySecuritySettings</li>
									<li>dashcam</li>
									<li>sentryMode</li>
									<li>usbDrive</li>
									<li>smartGarageConnectivity</li>
									<li>connectingToWiFi</li>
									<li>softwareUpdates</li>
								</ul>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		);
		*/
	}
}

export default memo(SignalTree);