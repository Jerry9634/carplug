import React, { useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import styled from "styled-components";
import AutoPilotControl from "./AutoPilotControl";
import DisplayControl from "./DisplayControl";
import DrivingControl from "./DrivingControl";
import LightControl from "./LightControl";
import LocksControl from "./LocksControl";
import NavigationControl from "./NavigationControl";
import QuickControl from "./QuickControl";
import SafetyControls from "./SafetyControls";
import ServiceControl from "./ServiceControl";
import DummyControl from "./DummyControl";

const CarControlTabs = ({ appLayout, carStatusView, mapView }) => {

	const [selection, setSelection] = useState(0);

	return (
		<StyledDiv appLayout={appLayout} carStatusView={carStatusView} mapView={mapView}>
			<Tabs className="car-control"
				onSelect={(index) => setSelection(index)}
			>
				<TabList className="car-control-tab-list">
					<Tab>
						<span className="img-cont">
							<img
								src={selection === 0 ? "./car_control/switch-active.png" : "./car_control/switch.png"}
								alt=""
								className="toggle"
							/>
						</span>
						Controls
					</Tab>
					<Tab>
						<span className="img-cont">
							<img
								src={selection === 1 ? "./car_control/car-control-active.png" : "./car_control/car-control.png"}
								className="driving"
								alt=""
							/>
						</span>
						Pedals & Steering
					</Tab>
					<Tab>
						<span className="img-cont">
							<img
								src={selection === 2 ? "./car_control/thunder-active.png" : "./car_control/thunder.png"}
								alt=""
							/>
						</span>
						Charging
					</Tab>
					<Tab>
						<span className="img-cont">
							<img 
								src={selection === 3 ? "./car_control/steering-wheel-active.png" : "./car_control/steering-wheel.png"}
								alt="" 
							/>
						</span>
						Autopilot
					</Tab>
					<Tab>
						<span className="img-cont">
							<img 
								src={selection === 4 ? "./car_control/padlock-active.png" : "./car_control/padlock.png"} 
								alt="" 
							/>
						</span>
						Locks
					</Tab>
					<Tab>
						<span className="img-cont">
							<img
								src={selection === 5 ? "./car_control/bulb-active.png" : "./car_control/bulb.png"}
								alt=""
								className="bulb"
							/>
						</span>
						Lights
					</Tab>
					<Tab>
						<span className="img-cont">
							<img
								src={selection === 6 ? "./car_control/monitor-active.png" : "./car_control/monitor.png"}
								alt=""
								className="display-settings"
							/>
						</span>
						Display
					</Tab>
					
					<Tab>
						<span className="img-cont">
							<img
								src={selection === 7 ? "./car_control/trip-active.png" : "./car_control/trip.png"}
								alt=""
								className="trip"
							/>
						</span>
						Trips
					</Tab>
					<Tab>
						<span className="img-cont">
							<img 
								src={selection === 8 ? "./car_control/gps-navigation-active.png" : "./car_control/gps-navigation.png"}
								alt="" 
							/>
						</span>
						Navigation
					</Tab>
					
					<Tab>
						<span className="img-cont">
							<img 
								src={selection === 9 ? "./car_control/exclamation-active.png" : "./car_control/exclamation.png"}
								alt="" 
							/>
						</span>
						Safety
					</Tab>
					<Tab>
						<span className="img-cont">
							<img 
								src={selection === 10 ? "./car_control/wrench-active.png" : "./car_control/wrench.png"}
								alt="" 
							/>
						</span>
						Service
					</Tab>

					<Tab>
						<span className="img-cont">
							<img
								src={selection === 11 ? "./car_control/download-active.png" : "./car_control/download.png"}
								alt=""
							/>
						</span>
						Software
					</Tab>
					<Tab>
						<span className="img-cont">
							<img
								src={selection === 12 ? "./car_control/package-active.png" : "./car_control/package.png"}
								alt=""
							/>
						</span>
						Upgrades
					</Tab>
				</TabList>
				
				<div>
					<TabPanel>
						<QuickControl/>
					</TabPanel>
					<TabPanel>
						<DrivingControl/>
					</TabPanel>
					<TabPanel>
						<DummyControl/>
					</TabPanel>
					<TabPanel>
						<AutoPilotControl/>
					</TabPanel>
					<TabPanel>
						<LocksControl />
					</TabPanel>
					<TabPanel>
						<LightControl/>
					</TabPanel>					
					<TabPanel>
						<DisplayControl/>
					</TabPanel>
					
					<TabPanel>
						<DummyControl/>
					</TabPanel>
					<TabPanel>
						<NavigationControl/>
					</TabPanel>
					
					<TabPanel>
						<SafetyControls/>
					</TabPanel>
					<TabPanel>
						<ServiceControl/>
					</TabPanel>

					<TabPanel>
						<DummyControl/>
					</TabPanel>
					<TabPanel>
						<DummyControl/>
					</TabPanel>
				</div>
			</Tabs>
		</StyledDiv>
	);
};

export default CarControlTabs;

const StyledDiv = styled.div`
	z-index: 2;
	position: relative;
	transition: all 0.6s ease;

	height: ${(props) => (props.appLayout.appExpandHeight)}px;
	max-height: ${(props) => (props.appLayout.appExpandHeight)}px;
	width: ${(props) => props.carStatusView && props.mapView ? "60%" : "100%"};

	.car-control {
		display: grid;
		grid-template-columns: 1.0fr 2fr;
		height: 100%;
		background: #f0f0f0;
		font-size: 0.9rem;
		//border: 1px solid #cccccc;
		//border-top-left-radius: 12px;
		//border-top-right-radius: 12px;
		
		.car-control-tab-list {
			display: flex;
			flex-direction: column;
			border-top-left-radius: 12px;
			height: 95%;//100%;

			margin: 16px;
			list-style-type: none;
			padding: 0;
			background: #f0f0f0;
			
			li {
				cursor: pointer;
				//margin-bottom: 16px;
				height: 45px;
				//padding-left: 18px;

				display: flex;
				align-items: center;
				//color: rgb(0, 0, 0);
				color: darkgray;
				//opacity: 0.5;

				border-radius: 8px;
			}
			li.react-tabs__tab--selected {
				opacity: 1;
				border: 0;
				outline: 0;
				background: #ffffff;
				color: black;
			}
			li:hover {
				opacity: 1;
				border: 0;
				outline: 0;
				transition: color 0.5s ease-in-out, opacity 0.5s ease-in-out;
				color: black;
			}

			.img-cont {
				width: 50px;
				display: inline-block;
				display: flex;
				align-items: center;
				justify-content: center;
			}
			img {
				width: 18px;
				display: inline-block;
			}

			.toggle {
				width: 25px;
			}

			.display-settings {
				width: 35px;
			}
			.driving {
				width: 25px;
			}
			.bulb {
				width: 35px;
			}
			.trip {
				width: 35px;
			}
		}

		.react-tabs__tab-panel {
			transition: none;
		}
		.react-tabs__tab-panel.react-tabs__tab-panel--selected {
			transition: none;
		}
	}

	.tab-panels {
		border: solid blue;
	}
`;
