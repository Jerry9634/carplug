import { useEffect, useState } from "react";
import styled from "styled-components";

import CarStatus from "./car_status/CarStatus";
import CarStatusOverlay from "./car_status/CarStatusOverlay";
import MainLayout from "./MainLayout";
import MapSection from "./map/Map";
import NavigationBar from "./nav/NavigationBar";

import LeftTaskBar from "./car_status/LeftTaskBar";

import { findServer, subscribeSignals, unsubscribeSignals } from "./vplug/WsReq";
import vehicleApi from "./vplug/VehicleAPI.json";


function App() {
	const [tabIndex, setTabIndex] = useState(-1);
	
	const [appLayout, setAppLayout] = useState({
		screenWidth: 1480,
		screenHeight: 924,
		leftTaskBarWidth: 64,
		carSideWidth: 850,
		carSideWidthStd: 850, // 1416 * 0.6
		carSideHeight: 832,
		mapWidthStd: 566,
		appExpandHeight: 804,
	});

	const gridLayout = {
		left: 64,
		right: 1416,
		up: 832,
		bottom: 92,
	};

	const [carStatusView, setCarStatusView] = useState(true);
	const [mapView, setMapView] = useState(true);

	const [gear, setGear] = useState("p");
	const [speed, setSpeed] = useState(0);
	const [distanceToEmpty, setDistanceToEmpty] = useState(500);
	const [hazardReq, setHazardReq] = useState(false);

	const [driverTemperature, setDriverTemperature] = useState(25);
	const [passengerTemperature, setPassengerTemperature] = useState(25);

	const SOCKET_IO_CHANNEL = "dashboard2/topview";

	document.addEventListener("contextmenu", function(e) {
		e.preventDefault();
	}, false);

	useEffect(() => {
		findServer();

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
						name: vehicleApi.Vehicle.Powertrain2.VCU.VCU_GearPosSta.name,		// "VCU_GearPosSta",
					},
					{ 
						name: vehicleApi.Vehicle.Extended.CLU.CLU_DisSpdVal.name,			// "CLU_DisSpdVal",
					},
					{ 
						name: vehicleApi.Vehicle.Extended.CLU.CLU_EVDTEDisp.name,			// "CLU_EVDTEDisp",
					},
					{ 
						name: vehicleApi.Vehicle.Multimedia.H_U_MM.C_HazardFromCCS.name,    // "C_HazardFromCCS",
					},
					{ 
						name: vehicleApi.Vehicle.Multimedia.H_U_MM.HU_DATC_DrTempSetC.name, // "HU_DATC_DrTempSetC",
					},
					{ 
						name: vehicleApi.Vehicle.Multimedia.H_U_MM.HU_DATC_PsTempSetC.name, // "HU_DATC_PsTempSetC",
					},
				],
				channel: SOCKET_IO_CHANNEL
			}, 
			(msg) => {
				//console.log(msg);
				for (const signal of msg.signals) {
					if (signal.name === "VCU_GearPosSta") {
						if (signal.value === 5) {
							setGear("d");
						}
						else if (signal.value === 6) {
							setGear("n");
						}
						else if (signal.value === 7) {
							setGear("r");
						}
						else {
							setGear("p");
						}
					}
					else if (signal.name === "CLU_DisSpdVal") {
						if (signal.value < 511.5) {
							setSpeed(signal.value);
						}
						else {
							setSpeed(0);
						}
					}
					else if (signal.name === "CLU_EVDTEDisp") {
						if (signal.value < 1023) {
							setDistanceToEmpty(signal.value);
						}
						else {
							setDistanceToEmpty(500);
						}
					}
					else if (signal.name === "C_HazardFromCCS") {
						if (signal.value === 1) {
							setHazardReq(true);
						}
					}
					else if (signal.name === "HU_DATC_DrTempSetC") {
						setDriverTemperature(signal.value);
					}
					
					else if (signal.name === "HU_DATC_PsTempSetC") {
						setPassengerTemperature(signal.value);
					}
				}
			}
		);
	}

	useEffect(() => {
		if (carStatusView) {
			if (mapView) {
				appLayout.carSideWidth = appLayout.carSideWidthStd;
			}
			else {
				appLayout.carSideWidth = appLayout.screenWidth - appLayout.leftTaskBarWidth;
			}
		}
		else {
			appLayout.carSideWidth = 0;
		}

		setAppLayout({
			screenWidth: appLayout.screenWidth,
			screenHeight: appLayout.screenHeight,
			leftTaskBarWidth: appLayout.leftTaskBarWidth,
			carSideWidth: appLayout.carSideWidth,
			carSideWidthStd: appLayout.carSideWidthStd,
			carSideHeight: appLayout.carSideHeight,
			mapWidthStd: appLayout.mapWidthStd,
			appExpandHeight: appLayout.appExpandHeight,
		});
	}, 
	// eslint-disable-next-line
	[carStatusView, mapView]);

	return (
		<StyledDiv className="App">
			<MainLayout gridLayout={gridLayout}>
				<LeftTaskBar
					appLayout={appLayout}
					setCarStatusView={setCarStatusView} 
					setMapView={setMapView}
					gear={gear}
					speed={speed}
					hazardReq={hazardReq}
					setHazardReq={setHazardReq}
				/>
				<div style={{ width: gridLayout.right, height: gridLayout.up, display: "flex", flexDirection: "row" }}>
					<CarStatus 
						appLayout={appLayout}
						carStatusView={carStatusView} 
						mapView={mapView}
					/>
					<MapSection 
						appLayout={appLayout} 
						carStatusView={carStatusView} 
						mapView={mapView}
					/>
					<div style={{ position: "absolute", zIndex: 2 }}>
						<CarStatusOverlay 
							carStatusView={carStatusView} 
							mapView={mapView}
							appLayout={appLayout}
							gear={gear}
							speed={speed}
							distanceToEmpty={distanceToEmpty}
						/>
					</div>
				</div>
				<NavigationBar 
					tabIndex={tabIndex} setTabIndex={setTabIndex} 
					appLayout={appLayout} 
					carStatusView={carStatusView} setCarStatusView={setCarStatusView}
					mapView={mapView} setMapView={setMapView}
					driverTemperature={driverTemperature}
					passengerTemperature={passengerTemperature}
				/>
			</MainLayout>
		</StyledDiv>
	);
}

export default App;

const StyledDiv = styled.div`
	min-height: 100vh;
	min-width: 100%;
	position: relative;
	display: grid;
	place-content: center;

	user-drag: none; 
	user-select: none;
	-moz-user-select: none;
	-webkit-user-drag: none;
	-webkit-user-select: none;
	-ms-user-select: none;

	img {
		pointer-events: none;
	}

	oncontextmenu: return false;
`;
