import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";


import CarControlTabs from "../car_control/CarControlTabs";
import NavigationBarItem from "./NavigationBarItem";
import MediaMain from "../media/MediaMain";
//import WiperControls from "../car_control/WiperControls";
//import TeslaDemo from "../car/TeslaDemo";
import Dashcam from "../camera/Dashcam";

import TempratureControl from "../climate/TempratureControl";
//import AcControls from "../climate/AcControls";
import ClimateControl from "../climate/ClimateControl";
import VolumeControl from "../media/VolumeControl";
//import HeatChair from "../utilscomponents/HeatChair";

const NavigationBar = (
	{ 
		tabIndex, setTabIndex, 
		appLayout, extraInfoOpen,
		carStatusView, setCarStatusView, mapView, setMapView,
		driverTemperature, passengerTemperature
	}
) => {
	
	//const [activeCarSeatLeft, setActiveCarSeatLeft] = useState(false);
	//const [activeCarSeatRight, setActiveCarSeatRight] = useState(false);
	const [carControlToggles, setCarControlToggles] = useState([false, false, false, false]);

	const CONTROL_TYPES = {
		CAR_OPTION : 0,
		MEDIA      : 1,
		CLIMATE    : 2,
		WIPER      : 3,
		DASHCAM    : 4,
	};

	useEffect(() => {
		if (extraInfoOpen) {
			setCarControlToggles([false, false, false, false, false]);
		}
	}, [extraInfoOpen]);

	function updateToggleStatus(controlType) {
		if (!extraInfoOpen) {
			const newControl = [false, false, false, false, false];
			let anyControlActive = false;
			for (let i = 0; i < carControlToggles.length; i++) {
				if (carControlToggles[i]) {
					anyControlActive = true;
				}
			}
			if (!carControlToggles[controlType]) {
				newControl[controlType] = true;
				if (anyControlActive) {
					setTimeout(() => {
						setCarControlToggles(newControl);
					}, 600);
				}
				else {
					setCarControlToggles(newControl);
				}
			}
			else {
				setCarControlToggles(newControl);
			}
		}
	}

	return (
		<StyledDiv className="navigation-bar" appLayout={appLayout} >
			<Tabs
				selectedIndex={tabIndex}
				onSelect={(index) => setTabIndex(index !== tabIndex ? index : -1)}
				forceRenderTabPanel={true}
				// forceRender={true}
			>
				<TabList className="nav-bar-tab-list">
					<Tab>
						<div
							onClick={() => { updateToggleStatus(CONTROL_TYPES.CAR_OPTION) }}
						>
						<NavigationBarItem
							background={tabIndex === 0 ? "./nav/car-control-active.png" : "./nav/car-control.png"}
							activeBackground={null}
							activeBackgroundBlur={null}
							size="48px"
						/>
						</div>
					</Tab>
					<Tab>
						<div
							onClick={() => { updateToggleStatus(CONTROL_TYPES.MEDIA) }}
						>
						<NavigationBarItem
							background={tabIndex === 1 ? "./nav/media-active.png" : "./nav/media.png"}
							activeBackground={null}
							activeBackgroundBlur={null}
							size="36px"
						/>
						</div>
					</Tab>
					<Tab>
						<div
							onClick={() => { updateToggleStatus(CONTROL_TYPES.DASHCAM) }}
						>
						<NavigationBarItem
							background={tabIndex === 2 ? "./nav/dashcam-active.png" : "./nav/dashcam.png"}
							activeBackground={null}
							activeBackgroundBlur={null}
							size="48px"
						/>
						</div>
					</Tab>
					{/*<Tab>
						<div
							onClick={() => { updateToggleStatus(CONTROL_TYPES.WIPER) }}
						>
						<NavigationBarItem
							background={"./images/windshield.png"}
							activeBackground={null}
							activeBackgroundBlur={null}
							size="48px"
						/>
						</div>
					</Tab>*/}

					{/*<HeatChair
						background={"./images/car-seat-left.png"}
						activeBackground={"./images/car-seat-left-active.png"}
						activeBackgroundBlur={"#C5200B"}
						active={activeCarSeatLeft}
						setActive={setActiveCarSeatLeft}
					/>*/}
					<TempratureControl signalName={"HU_DATC_DrTempSetC"} temperature={driverTemperature} />
					<Tab>
						<div
							onClick={() => { updateToggleStatus(CONTROL_TYPES.CLIMATE) }}
						>
						<NavigationBarItem
							background={tabIndex === 3 ? "./nav/climate-active.png" : "./nav/climate.png"}
							activeBackground={null}
							activeBackgroundBlur={null}
							size="36px"
						/>
						</div>
					</Tab>
					<TempratureControl signalName={"HU_DATC_PsTempSetC"} temperature={passengerTemperature} />
					{/*<HeatChair
						background={"./images/car-seat-right.png"}
						activeBackground={"./images/car-seat-right-active.png"}
						activeBackgroundBlur={"#C5200B"}
						active={activeCarSeatRight}
						setActive={setActiveCarSeatRight}
					/>
					<NavigationBarItem
						background={"./images/car-aircon-icon.png"}
						activeBackground={"./images/car-aircon-icon-active.png"}
						activeBackgroundBlur={"#4B9EC0"}
						size="32px"
					/>
					<NavigationBarItem
						background={"./images/car-heater-icon.png"}
						activeBackground={"./images/car-heater-icon-active.png"}
						activeBackgroundBlur={"#C5200B"}
						size="40px"
					/>*/}

					<VolumeControl />
				</TabList>

				<div className="nav-bar-tab-panels">
					<TabPanel>
						<div
							style={{
								maxHeight: carControlToggles[CONTROL_TYPES.CAR_OPTION] ? appLayout.appExpandHeight + "px" : "0vh",
								transition: "all 0.6s ease",
							}}
						>
							<CarControlTabs	appLayout={appLayout}  carStatusView={carStatusView} mapView={mapView}/>
						</div>
					</TabPanel>
					<TabPanel>
						<div
							style={{
								maxHeight: carControlToggles[CONTROL_TYPES.MEDIA] ? appLayout.appExpandHeight + "px" : "0vh",
								transition: "all 0.6s ease",
							}}
						>
							<MediaMain appLayout={appLayout} carStatusView={carStatusView} mapView={mapView}/>
						</div>
					</TabPanel>
					<TabPanel>
						<div
							style={{
								maxHeight: carControlToggles[CONTROL_TYPES.DASHCAM] ? appLayout.appExpandHeight + "px" : "0vh",
								transition: "all 0.6s ease",
							}}
						>
							<Dashcam active={carControlToggles[CONTROL_TYPES.DASHCAM]} appLayout={appLayout}/>
						</div>
					</TabPanel>
					{/*<TabPanel>
						<div
							style={{
								maxHeight: carControlToggles[CONTROL_TYPES.WIPER] ? appLayout.appExpandHeight + "px" : "0vh",
								transition: "all 0.6s ease",
							}}
						>
							<WiperControls signalMap={signalMap} />
						</div>
					</TabPanel>*/}
					<TabPanel>
						<div
							style={{
								maxHeight: carControlToggles[CONTROL_TYPES.CLIMATE] ? appLayout.appExpandHeight + "px" : "0vh",
								transition: "all 0.6s ease",
							}}
						>
							{/*<AcControls show={carControlToggles[CONTROL_TYPES.CLIMATE]} appLayout={appLayout} signalMap={signalMap} />*/}
							<ClimateControl/>
						</div>
					</TabPanel>
				</div>

				<div style={{
					position: "absolute", left: "4px", top: "4px",
					width: "32px", height: "32px", padding: "4px", 
					backgroundColor: "gray", opacity: 0.5, borderRadius: "40px",
					cursor: "pointer"
				}}
					onClick={() => {
						if (mapView) {
							if (carStatusView) {
								setCarStatusView(false);
							}
							else {
								setCarStatusView(true);
							}
						}
						else {
							setMapView(true);
						}
					}}
				>
					<img src={carStatusView ? "./images/left-white.png" : "./images/right-white.png"}
						style={{ width: "24px", height: "24px" }}
						alt="" />
				</div>
				<div style={{
					position: "absolute", right: "4px", top: "4px",
					width: "32px", height: "32px", padding: "4px", 
					backgroundColor: "gray", opacity: 0.5, borderRadius: "40px",
					cursor: "pointer"
				}}
					onClick={() => {
						if (carStatusView) {
							if (mapView) {
								setMapView(false);
							}
							else {
								setMapView(true);
							}
						}
						else {
							setCarStatusView(true);
						}
					}}
				>
					<img src={mapView ? "./images/right-white.png" : "./images/left-white.png"}
						style={{ width: "24px", height: "24px" }}
						alt="" />
				</div>
			</Tabs>
		</StyledDiv>
	);
};

export default NavigationBar;

const StyledDiv = styled.div`
	background-color: #000000;
	border-bottom-left-radius: 8px;
	border-bottom-right-radius: 8px;
	padding-top: 16px;
	padding-bottom: 16px;
	z-index: 10;
	height: 92px;

	.navigation {
		display: flex;
	}
	.react-tabs {
		position: relative;
	}

	.nav-bar-tab-list {
		margin: 0;
		list-style-type: none;
		padding: 0;
		padding-left: 96px;
		padding-right: 96px;
		display: flex;
		justify-content: space-between;
		//gap: 48px;
		align-items: center;
	}
	.nav-bar-tab-panels {
		position: absolute;
		bottom: 76px;
		right: 0px;
		left: 64px;
		overflow: hidden;
		transition: all 0.6s ease;
	}

	.react-tabs__tab-panel {
		max-height: 0;
		overflow: hidden;
		transition: all 0.6s ease;
	}
	.react-tabs__tab-panel.react-tabs__tab-panel--selected {
		max-height: ${(props) => (props.appLayout.appExpandHeight)}px;
		transition: all 0.6s ease;
	}
`;
