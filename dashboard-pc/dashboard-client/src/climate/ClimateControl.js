import { useState, useEffect } from "react";
//import { Image, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

import { setSignals, subscribeSignals, unsubscribeSignals  } from "../vplug/WsReq";
import vehicleApi from "../vplug/VehicleAPI.json";

const MaterialColors = {
	Primary: "#2979FF",
	FontGray: "#6F6F6F",
};

// 1480 * 862 (SM-X900 - 13)
// 1024 * 768 (SM-T825N0 - 9)
//const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen');

const ClimateControl = () => {

	const SOCKET_IO_CHANNEL = "dashboard2/climate";
	
	useEffect(() => {
		setTimeout(subscribe, 500);

		return () => {
			unsubscribeSignals({ channel: SOCKET_IO_CHANNEL });
		};
	}, 
	// eslint-disable-next-line
	[]);

	function subscribe() {
		subscribeSignals(
			{
				signals: [
					{ 
						name: vehicleApi.Vehicle.Extended.DATC.DATC_AUTOActv.name,	// "DATC_AUTOActv", 
					},
					{ 
						name: vehicleApi.Vehicle.Extended.DATC.DATC_AcDis.name,		// "DATC_AcDis",
					},
				],
				channel: SOCKET_IO_CHANNEL
			}, 
			(msg) => {
				//console.log(msg);
				for (const signal of msg.signals) {
					if (signal.name === "DATC_AUTOActv") {
						if (signal.value === 1) {
							setClimateAutoOn(true);
						}
						else {
							setClimateAutoOn(false);
						}
					}
					else if (signal.name === "DATC_AcDis") {
						if (signal.value === 1) {
							setClimatePowerOn(true);
						}
						else {
							setClimatePowerOn(false);
						}
					}
				}
			}
		);
	}

	const [frontClimate, setFrontClimate] = useState(true);
	const [rearClimate, setRearClimate] = useState(false);

	const [climatePowerOn, setClimatePowerOn] = useState(false);
	const [climateAutoOn, setClimateAutoOn] = useState(false);
	const [defogDefrosterOn, setDefogDefrosterOn] = useState(false);
	const [warmRearWindshieldOn, setWarmRearWindshieldOn] = useState(false);
	const [airConOn, setAirConOn] = useState(false);

	const [ventFace, setVentFace] = useState(false);
	const [ventBoth, setVentBoth] = useState(false);
	const [ventLeg, setVentLeg] = useState(false);

	const [leftSeatHeaterOn, setLeftSeatHeaterOn] = useState(false);
	const [leftSeatHeaterAutoOn, setLeftSeatHeaterAutoOn] = useState(false);
	const [rightSeatHeaterOn, setRightSeatHeaterOn] = useState(false);
	const [rightSeatHeaterAutoOn, setRightSeatHeaterAutoOn] = useState(false);

	const [steeringWheelHeaterOn, setSteeringWheelHeaterOn] = useState(false);
	const [windshieldHeaterOn, setWindshieldHeaterOn] = useState(false);

	return (
		<div style={styles.container}>
			<div style={styles.leftPane}>
				<div 
					onClick={() => { 
						if (!frontClimate) { 
							setFrontClimate(!frontClimate); setRearClimate(frontClimate); 
						} 
					}}
					style={{
						display: "flex", 
						height: "50%", justifyContent: "center", alignItems: "center", borderRadius: 8,
						backgroundColor: (frontClimate ? "#bbbbbb" : "#eeeeee")
					}}
				>
					<span style={{ fontSize: 20, fontWeight: "900" }}>Front</span>
				</div>
				<div 
					onClick={() => { 
						if (!rearClimate) { 
							setRearClimate(!rearClimate); setFrontClimate(rearClimate); 
						} 
					}}
					style={{
						display: "flex", 
						height: "50%", justifyContent: "center", alignItems: "center", borderRadius: 8, 
						backgroundColor: (rearClimate ? "#bbbbbb" : "#eeeeee")
					}}
				>
					<span style={{ fontSize: 20, fontWeight: "900" }}>Rear</span>
				</div>
			</div>
			<div style={styles.rightPane}>	
				<div style={styles.firstRow}>
					<div style={{ width: "20%", display: "flex", flexDirection: "row", padding: 16, justifyContent: "flex-start" }}>
						<div 
							onClick={() => {
								let powerOn = !climatePowerOn;
								setClimatePowerOn(powerOn);
								
								let acOnVal;
								if (powerOn) {
									acOnVal = 1;
								}
								else {
									acOnVal = 0;
								}
								
								setSignals({
									signals: [
										{ name: "DATC_AcDis", value: acOnVal },
									]
								});
							}}
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderStyle: "solid", borderColor: "darkgray",
								borderTopLeftRadius: 8, borderBottomLeftRadius: 8, 
								backgroundColor: (climatePowerOn ? MaterialColors.Primary : "#eeeeee") 
							}}
						>
							<img 
								src={climatePowerOn ? "./climate/power-active.png" : "./climate/power.png"} 
								alt=""
								style={{width: 40, height: 40}}
							/>
						</div>
						<div 
							onClick={() => {
								let autoOn = !climateAutoOn;
								setClimateAutoOn(autoOn);
								if (autoOn) {
									setSignals({
										signals: [
											{ name: "DATC_AUTOActv", value: 1 },
											{ name: "DATC_DrvAutoDis", value: 1 },
											{ name: "DATC_PsAutoDis", value: 1 },
										]
									});
								}
								else {
									setSignals({
										signals: [
											{ name: "DATC_AUTOActv", value: 0 },
											{ name: "DATC_DrvAutoDis", value: 0 },
											{ name: "DATC_PsAutoDis", value: 0 },
										]
									});
								}
							}}
							style={{ 
								display: "flex",
								width: 100, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderLeftWidth: 0, borderStyle: "solid", borderColor: "darkgray",
								borderTopRightRadius: 8, borderBottomRightRadius: 8, 
								backgroundColor: (climateAutoOn ? MaterialColors.Primary : "#eeeeee") 
							}}
						>
							<span style={{ color: (climateAutoOn ? "white" : MaterialColors.FontGray), fontSize: 20, fontWeight: "900" }}>
								Auto
							</span>
						</div>
					</div>
					<div style={{ width: "60%", display: "flex", flexDirection: "row", padding: 16, justifyContent: "center" }}>
						<div 
							onClick={() => { setDefogDefrosterOn(!defogDefrosterOn); }}
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderStyle: "solid", borderColor: "darkgray",
								borderTopLeftRadius: 8, borderBottomLeftRadius: 8
							}}
						>
							<img 
								src={defogDefrosterOn ? "./climate/car-aircon-icon-active.png" : "./climate/car-aircon-icon.png"} 
								alt=""
								style={{width: 40, height: 40}}
							/>
						</div>
						<div 
							onClick={() => { setWarmRearWindshieldOn(!warmRearWindshieldOn); }}
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderLeftWidth: 0, borderStyle: "solid", borderColor: "darkgray",
								borderTopRightRadius: 8, borderBottomRightRadius: 8
							}}
						>
							<img 
								src={warmRearWindshieldOn ? "./climate/car-heater-icon-active.png" : "./climate/car-heater-icon.png"} 
								alt=""
								style={{width: 48, height: 48}}
							/>
						</div>
						
						<div style={{ width: 16 }} />
						
						<div 
							onClick={() => { setAirConOn(!airConOn); }}
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderRadius: 8, borderStyle: "solid", borderColor: "darkgray",
								backgroundColor: (airConOn ? MaterialColors.Primary : "#eeeeee") 
							}}
						>
							<span style={{ color: (airConOn ? "white" : MaterialColors.FontGray), fontSize: 20, fontWeight: "900" }}>
								A/C
							</span>
						</div>
						
						<div style={{ width: 16 }} />
						
						<div 
							style={{ 
								width: 256, height: 80, borderWidth: 2, borderStyle: "solid", borderColor: "darkgray", borderRadius: 8,
								display: "flex", flexDirection: "row", gap: 16, justifyContent: "center", alignItems: "center" 
							}}
						>
							<img 
								src={"./climate/fan.png"} 
								alt=""
								style={{width: 36, height: 36}}
							/>
							<span style={{ fontSize: 32, fontWeight: "900" }}>5</span>
							<span style={{ fontSize: 20, fontWeight: "900" }}>----O--------</span>
						</div>
						
						<div style={{ width: 16 }} />
						<div 
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center", 
								borderWidth: 2, borderRadius: 8, borderStyle: "solid", borderColor: "darkgray" 
							}
						}>
							<img 
								src={"./climate/arrow-loop.png"} 
								alt=""
								style={{width: 40, height: 40}}
							/>
						</div>

						<div style={{ width: 16 }} />
						<div 
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderRadius: 8, borderStyle: "solid", borderColor: "darkgray" 
							}
						}>
							<span style={{ fontSize: 20, fontWeight: "900" }}>HEPA</span>
						</div>
					</div>
					<div style={{ width: "20%", display: "flex", flexDirection: "row", padding: 16, justifyContent: "flex-end" }}>
						<div
							style={{ 
								backgroundColor: '#eeeeee',
								display: "flex", width: 200, height: 80,  
								justifyContent: "center", alignItems: "center", 
								borderWidth: 2, borderRadius: 8, borderStyle: "solid", borderColor: "darkgray"
							}}
						 	onClick={() => {  } }
						>
							<span style={{ fontSize: 20, fontWeight: "900" }}>Schedule</span>
						</div>
					</div>
				</div>
				
				<div style={styles.secondRow}>
					<div style={{ width: "10%", display: "flex", flexDirection: "column", padding: 16, justifyContent: "center", alignItems: "flex-start" }}>
						<div 
							onClick={() => { 
								setVentFace(!ventFace);
								if (!ventFace) {
									//setVentFace(false);
									setVentBoth(false);
									setVentLeg(false);
								}
							}}
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderStyle: "solid", borderColor: "darkgray",
								borderTopLeftRadius: 8, borderTopRightRadius: 8,
								backgroundColor: (ventFace ? MaterialColors.Primary : "#eeeeee") 
							}}
						>
							<img 
								src={ventFace ? "./climate/ventilation-face-active.png" : "./climate/ventilation-face.png"} 
								alt=""
								style={{width: 40, height: 40}}
							/>
						</div>
						<div 
							onClick={() => { 
								setVentBoth(!ventBoth);
								if (!ventBoth) {
									setVentFace(false);
									//setVentBoth(false);
									setVentLeg(false);
								}
							}}
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderTopWidth: 0, borderBottomWidth: 0, borderStyle: "solid", borderColor: "darkgray",
								backgroundColor: (ventBoth ? MaterialColors.Primary : "#eeeeee") 
							}}
						>
							<img 
								src={ventBoth ? "./climate/ventilation-both-active.png" : "./climate/ventilation-both.png"} 
								alt=""
								style={{width: 40, height: 40}}
							/>
						</div>
						<div 
							onClick={() => { 
								setVentLeg(!ventLeg);
								if (!ventLeg) {
									setVentFace(false);
									setVentBoth(false);
									//setVentLeg(false);
								}
							}}
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderStyle: "solid", borderColor: "darkgray",
								borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
								backgroundColor: (ventLeg ? MaterialColors.Primary : "#eeeeee") 
							}}
						>
							<img 
								src={ventLeg ? "./climate/ventilation-leg-active.png" : "./climate/ventilation-leg.png"} 
								alt=""
								style={{width: 40, height: 40}}
							/>
						</div>
					</div>
					<div style={{ display: "flex", width: "80%", justifyContent: "center", alignItems: "center" }}>
						<img 
							src={"./climate/ClimateControl.png"} 
							alt=""
							style={{ width: 760, height: 337 }} 
						/>
					</div>
					<div style={{ width: "10%", display: "flex", flexDirection: "column", padding: 16, justifyContent: "center", alignItems: "flex-end" }}>
						<div 
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderStyle: "solid", borderColor: "darkgray",
								borderTopLeftRadius: 8, borderTopRightRadius: 8
							}}
						>
							<span style={{ fontSize: 16, fontWeight: "700" }}>Keep</span>
						</div>
						<div 
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderTopWidth: 0, borderBottomWidth: 0, borderStyle: "solid", borderColor: "darkgray" 
							}}
						>
							<span style={{ fontSize: 16, fontWeight: "700" }}>Dog</span>
						</div>
						<div 
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center", 
								borderWidth: 2, borderStyle: "solid", borderColor: "darkgray",
								borderBottomLeftRadius: 8, borderBottomRightRadius: 8
							}}
						>
							<span style={{ fontSize: 16, fontWeight: "700" }}>Camp</span>
						</div>
					</div>
				</div>
				
				<div style={styles.thirdRow}>
					<div style={{ width: "33%", display: "flex", flexDirection: "row", padding: 16, justifyContent: "flex-start", alignItems: "center" }}>
						<div 
							onClick={() => { setLeftSeatHeaterOn(!leftSeatHeaterOn); }}
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderStyle: "solid", borderColor: "darkgray" 
							}}
						>
							<img 
								src={leftSeatHeaterOn ? "./climate/car-seat-left-active.png" : "./climate/car-seat-left.png"} 
								alt=""
								style={{width: 40, height: 40}}
							/>
						</div>
						<div 
							onClick={() => { setLeftSeatHeaterAutoOn(!leftSeatHeaterAutoOn); }}
							style={{ 
								display: "flex",
								width: 100, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderLeftWidth: 0, borderTopRightRadius: 8, borderBottomRightRadius: 8, borderStyle: "solid", borderColor: "darkgray",
								backgroundColor: (leftSeatHeaterAutoOn ? MaterialColors.Primary : "#eeeeee") 
							}}
						>
							<span style={{ color: (leftSeatHeaterAutoOn ? "white" : MaterialColors.FontGray), fontSize: 20, fontWeight: "900" }}>
								Auto
							</span>
						</div>
					</div>
					<div style={{ width: "34%", display: "flex", flexDirection: "row", padding: 16, justifyContent: "center", alignItems: "center" }}>
						<div 
							onClick={() => { setSteeringWheelHeaterOn(!steeringWheelHeaterOn); }}
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center", 
								borderWidth: 2, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderStyle: "solid", borderColor: "darkgray" 
							}}
						>
							<img 
								src={steeringWheelHeaterOn ? "./climate/steering_wheel_heated_active.png" : "./climate/steering_wheel_heated.png"} 
								alt=""
								style={{width: 40, height: 40}}
							/>
						</div>
						<div 
							onClick={() => { setWindshieldHeaterOn(!windshieldHeaterOn); }}
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderLeftWidth: 0, borderTopRightRadius: 8, borderBottomRightRadius: 8, borderStyle: "solid", borderColor: "darkgray" 
							}}
						>
							<img 
								src={windshieldHeaterOn? "./climate/windshield_heated_active.png" : "./climate/windshield_heated.png"} 
								alt=""
								style={{width: 40, height: 40}}
							/>
						</div>
					</div>
					<div style={{ width: "33%", display: "flex", flexDirection: "row", padding: 16, justifyContent: "flex-end", alignItems: "center" }}>
						<div 
							onClick={() => { setRightSeatHeaterAutoOn(!rightSeatHeaterAutoOn); }}
							style={{ 
								display: "flex",
								width: 100, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderRightWidth: 0, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderStyle: "solid", borderColor: "darkgray",
								backgroundColor: (rightSeatHeaterAutoOn ? MaterialColors.Primary : "#eeeeee") 
							}}
						>
							<span style={{ color: (rightSeatHeaterAutoOn ? "white" : MaterialColors.FontGray), fontSize: 20, fontWeight: "900" }}>
									Auto
							</span>
						</div>
						<div 
							onClick={() => { setRightSeatHeaterOn(!rightSeatHeaterOn); }}
							style={{ 
								display: "flex",
								width: 80, height: 80, justifyContent: "center", alignItems: "center",
								borderWidth: 2, borderTopRightRadius: 8, borderBottomRightRadius: 8, borderStyle: "solid", borderColor: "darkgray" 
							}}
						>
							<img 
								src={rightSeatHeaterOn ? "./climate/car-seat-right-active.png" : "./climate/car-seat-right.png"} 
								alt=""
								style={{width: 40, height: 40}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default ClimateControl;

const styles = {
    container: {
		//position: "absolute", 
		//left: 0, 
		//top: 0, 
		position: "relative",
   		zIndex: 2, 
		width: "100%", 
		//height: "100%", 
		height: 804,
		display: "flex",
		flexDirection: "row",
		backgroundColor:"#eeeeee",
		color: MaterialColors.FontGray,
    },
	leftPane: {
		width: "10%",
		//height: "100%",
		//backgroundColor: "lightyellow",
	},
	rightPane: {
		width: "90%",
		//height: "100%",
		display: "flex",
		flexDirection: "column",
	},
	firstRow: {
		height: "15%",
		//backgroundColor: "lightblue",
		display: "flex",
		flexDirection: "row",
	},
	secondRow: {
		height: "70%",
		//backgroundColor: "lightgreen",
		display: "flex",
		flexDirection: "row",
	},
	thirdRow: {
		height: "15%",
		//backgroundColor: "lightblue",
		display: "flex",
		flexDirection: "row",
	},
};
