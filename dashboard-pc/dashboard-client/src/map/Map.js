import styled from "styled-components";
import React, { useState, useEffect } from "react";
import { useJsApiLoader } from '@react-google-maps/api';
import Iframe from 'react-iframe';

import MyGoogleMap from "./MyGoogleMap";
import SearchBox from "./SearchBox";
import DrivingView from './DrivingView';
import { setSignal, subscribeExtData, unsubscribeExtData } from "../vplug/WsReq";
import Draggable from 'react-draggable';
import { checkWeather } from "./Weather";
import { getValue } from "../car_control/CarControlSettings";

const MAP_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const libraries = ["geometry", "drawing", "places"];

var timeTicksRaw = 0;
var panoUpdateTimer = null;
const imageShots = [];

export const currentPosition = {
	latitude: 0, 
	longitude: 0,
	distanceToDirection: 0,
	maneuver: "",
	direction: "",
}

const MapSection = ({ appLayout, carStatusView, mapView }) => {
	const [refreshTimer, setRefreshTimer] = useState(null);
	const [timeTicks, setTimeTicks] = useState(0);
	const [currentTime, setCurrentTime] = useState(getCurrentTime());
	const [currentTemp, setCurrentTemp] = useState(0);
	const [currentWeather] = useState({
		time: "",
		value: {},
	});
	const [speed, setSpeed] = useState(0);

	// eslint-disable-next-line
	const [mapMode, setMapMode] = useState("simulation-mode"); // simulation or monitoring
	const [map, setMap] = useState(null);
	const [mapType, setMapType] = useState("terrain");
	const [center, setCenter] = useState(null);
	const [zoom, setZoom] = useState(15);
	
	const [directionsResponse, setDirectionsResponse] = useState(null);
	const [autopilotOn, setAutopilotOn] = useState(false);
	
	const [heading, setHeading] = useState(0);
	// eslint-disable-next-line
	const [tilt, setTilt] = useState(45);
	const [streetViewService, setStreetViewService] = useState(null);
	const [streetViewPosition, setStreetViewPosition] = useState(null);
	const [reqFromSV, setReqFromSV] = useState(false);
	const [viewPoint, setViewPoint] = useState(0);
	const [pitch, setPitch] = useState(0);

	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: MAP_API_KEY,
		libraries,
	});

	const mapContainerStyle = { 
		height: '100%', width: '100%' 
	};

	const mainScreenWidth = appLayout.screenWidth - appLayout.leftTaskBarWidth;
	const streetViewWidthStd = mainScreenWidth * 0.4;
	const mapWidthStd = mainScreenWidth * 0.6;

	const SOCKET_IO_CHANNEL = "dashboard2/track-my-car";

	useEffect(() => {
		navigator.geolocation.getCurrentPosition(async (position) => {
			setTimeout(() => {
				setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
			}, 500);
		});
		setTimeout(() => checkWeatherHereNow(), 1000);

		const myInterval = setInterval(() => {
			timeTicksRaw++;
			if (timeTicksRaw === 60) {
				timeTicksRaw = 0;
			}
			setTimeTicks(timeTicksRaw);
		}, 1000);
		setRefreshTimer(myInterval);

		setTimeout(subscribe, 500);

		return () => {
			// Release timers
			if (refreshTimer != null) {
				clearInterval(refreshTimer);
			}

			unsubscribeExtData({ channel: SOCKET_IO_CHANNEL });
		};
	}, 
	// eslint-disable-next-line
	[]);

	function subscribe() {
		subscribeExtData(
			{
				channel: SOCKET_IO_CHANNEL
			}, 
			(msg) => {
				//console.log(msg);
				if (msg.latitude !== 0 || msg.longitude !== 0) {
					const newCenter = { lat: msg.latitude, lng: msg.longitude };
					setCenter(newCenter);
					setHeading(msg.heading);
					setSpeed(msg.speed);
				}
			}
		);
	}

	useEffect(() => {
		//if (mapMode === "monitoring-mode" && (timeTicks % 5) === 4) {
		//	trackMyCar();
		//}

		const time = getCurrentTime();
		setCurrentTime(time);

		// every 20 min
		if (timeTicks === 30) {
			if (time.endsWith("00") || time.endsWith("20") || time.endsWith("40")) {
				checkWeatherHereNow();
			}
		}
	}, 
	// eslint-disable-next-line
	[timeTicks]);

	function getCurrentTime() {
		const time = new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit", hour12:true});
		return time;
	}

	function checkWeatherHereNow() {
		navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
			checkWeather(latitude, longitude, "getUltraSrtNcst", (items) => {
				for (const item of items) {
					currentWeather.time = item.baseTime;
					(currentWeather.value)[item.category] = item.obsrValue;
					if (item.category === "T1H") {
						const temperature = Number(item.obsrValue);
						setCurrentTemp(temperature);
					}
				}
			});
        });
    }

	useEffect(() => {
		if (isLoaded) {
			setStreetViewService(new window.google.maps.StreetViewService());
			//setElevator(new window.google.maps.ElevationService());
		}
	}, [isLoaded]);

	useEffect(() => {
		if (streetViewService != null && !autopilotOn) {
			if (!panoUpdateTimer) {
				setPano(center, 50, false, true, true);
				panoUpdateTimer = setTimeout(() => {
					panoUpdateTimer = null;
				}, 5000);
			}
		}
		if (center != null) {
			if (typeof center.lat === "function") {
				currentPosition.latitude = center.lat();
				currentPosition.longitude = center.lng();
			}
			else {
				currentPosition.latitude = center.lat;
				currentPosition.longitude = center.lng;
			}
		}
	}, 
	// eslint-disable-next-line
	[center, autopilotOn]);

	useEffect(() => {
		if (speed === 0) {
			setZoom(15);
		}
		else {
			const zoomIn = Math.floor(speed / 30);
			setZoom(19 - zoomIn);
		}
	}, [speed]);

	// eslint-disable-next-line
	function setStreetViewMarker(location) {
		const icon = {
			url: "./map/camera.svg", // url
			scaledSize: new window.google.maps.Size(12, 12), // scaled size
			origin: new window.google.maps.Point(0, 0), // origin
			anchor: new window.google.maps.Point(0, 0) // anchor
		};

		const marker = new window.google.maps.Marker({
		  position: location.latLng,
		  map: map,
		  title: location.description,
		  icon: icon
		});

		marker.addListener("click", ({ domEvent, latLng }) => {
			//const { target } = domEvent;
			setStreetViewPosition(latLng);
		});
	}

	function setPano(latLng, radius, outdoor, applyRightAway, addMarker) {
		if (streetViewService == null)
			return;
		streetViewService.getPanorama({ 
			location: latLng, radius: radius, 
			source: outdoor ? window.google.maps.StreetViewSource.OUTDOOR : window.google.maps.StreetViewSource.DEFAULT })
		.then(({ data }) => {
			const location = data.location;
			imageShots.push(location.latLng);
			if (applyRightAway) {
				if (!reqFromSV) {
					setStreetViewPosition(location.latLng);
				}
			}
			if (addMarker) {
				setStreetViewMarker(location);
			}
		})
		.catch((e) => {
			//console.error("Street View data not found for this location.");
		});
	}

	const [sashPosition, setSashPosition] = useState({ x: streetViewWidthStd, y: 0 });
	const [dragging, setDragging] = useState(false);
	
	const trackPos = (data) => {
		if (data.x >= 0 && data.x <= mainScreenWidth) {
			if (data.x < 50) {
				setSashPosition({ x: 0, y: 0 });
				setDragging(false);
			}
			else if (data.x > (mainScreenWidth - 50)) {
				setSashPosition({ x: (mainScreenWidth - 24), y: 0 });
				setDragging(false);
			}
			else {
				setSashPosition({ x: data.x, y: 0 });
			}
		}
		else {
			setDragging(false);
		}
	};

	function handleStart() {
		setDragging(true);
	}

	function handleStop() {
		setDragging(false);
		if (sashPosition.x < (mainScreenWidth / 4) && sashPosition.x > 0) {
			setSashPosition({ x: (mainScreenWidth / 4), y: 0 });
		}
		else if (sashPosition.x > (mainScreenWidth * 3 / 4) && sashPosition.x < mainScreenWidth) {
			setSashPosition({ x: (mainScreenWidth * 3 / 4), y: 0 });
		}
	}

	function handleMouseDown(e){
		if (sashPosition.x < (mainScreenWidth / 4)) {
			setSashPosition({ x: (mainScreenWidth / 4), y: 0 });
		}
		else if (sashPosition.x > (mainScreenWidth * 3 / 4)) {
			setSashPosition({ x: (mainScreenWidth * 3 / 4), y: 0 });
		}
		else {
			setDragging(true);
			setTimeout(() => {
				const sash = document.getElementById("streetview-sash");
				const evt = new MouseEvent("mousedown", {
					bubbles: true,
					cancelable: true,
					view: window,
					screenX: e.screenX,
					screenY: e.screenY,
					clientX: e.clientX,
					clientY: e.clientY,
				});
				sash.dispatchEvent(evt);
			}, 100);
		}
	}

	return (
		<StyledDiv appLayout={appLayout} carStatusView={carStatusView} mapView={mapView} sashPosition={sashPosition}>
			{mapView &&
				<>
					{
						getValue("mapType") != null && getValue("mapType") !== "Custom" ?
							<Iframe url={"https://map.kakao.com"}
								width="100%"
								height="100%"
								id="my-iframe"
								className=""
								display="block"
								position="relative" />
							:
							<>
								{center != null && isLoaded && !carStatusView && sashPosition.x > 0 &&
									<DrivingView
										width={sashPosition.x}
										position={streetViewPosition}
										//center={center}
										setCenter={setCenter}
										heading={heading}
										setHeading={setHeading}
										viewPoint={viewPoint}
										setViewPoint={setViewPoint}
										pitch={pitch}
										setPitch={setPitch}
										autopilotOn={autopilotOn}
										reqFromSV={reqFromSV}
										setReqFromSV={setReqFromSV}
										mapMode={mapMode}
									/>
								}
								{center != null && isLoaded && 
								<div style={{
									width: !carStatusView ?
										(mainScreenWidth - sashPosition.x) + "px" :
										(mapWidthStd) + "px",
									height: "100%"
								}}>
									<MyGoogleMap
										map={map}
										setMap={setMap}
										mapMode={mapMode}
										center={center}
										setCenter={setCenter}
										zoom={zoom}
										mapContainerStyle={mapContainerStyle}
										mapType={mapType}
										heading={heading}
										tilt={tilt}
										directionsResponse={directionsResponse}
										autopilotOn={autopilotOn}
									/>
									{mapMode === "simulation-mode" &&
									<SearchBox
										timeTicks={timeTicks}
										autopilotOn={autopilotOn}
										setAutopilotOn={setAutopilotOn}
										setDirectionsResponse={setDirectionsResponse}
										speed={speed}
										setSpeed={setSpeed}
										setSignal={setSignal}
										carPosition={center}
										setCarPosition={setCenter}
										mapType={mapType}
										setMapType={setMapType}
										zoom={zoom}
										setZoom={setZoom}
										heading={heading}
										setHeading={setHeading}
										setViewPoint={setViewPoint}
										setPitch={setPitch}
										setPano={setPano}
										setStreetViewPosition={setStreetViewPosition}
										imageShots={imageShots}
										appLayout={appLayout}
										currentPosition={currentPosition}
									/>
									}
								</div>
								}
							</>
					}

					<div className="notification-bar">
						<div className="notification-bar-left">
							<img src="./images/padlock-locked.png" alt="" className="bg" />
							{/*
							<div className="gap"/>
							<img src="./images/bluetooth.png" alt="" className="bg"/>
							<div className="gap"/>
							<img src="./images/signal.png" alt="" className="bg"/>
							<div className="gap"/>
							<img src="./images/caution.png" alt="" className="bg"/>
							<div className="gap"/>
							<img src="./images/tesla.png" alt="" className="bg"/>
							*/}
							<div className="gap20" />
							<span id="CurrentTime" className="bg">
								{currentTime}
							</span>
							<div className="gap20" />
							<span id="CurrentTemp" className="bg">
								{currentTemp}&#8451; &nbsp;
							</span>
							<div className="gap20" />
							<img src="./tesla/icons/driver-profile.png" alt="" className="bg" />
							<span className="bg">
								&nbsp; Jerry &nbsp;
							</span>
						</div>
						<div className="notification-bar-center">
						</div>
						<div className="notification-bar-right">
						</div>
					</div>

					{(!getValue("mapType") || getValue("mapType") === "Custom") && !carStatusView &&
						(dragging ?
							<Draggable
								axis="x"
								defaultPosition={{ x: sashPosition.x, y: 0 }}
								onDrag={(e, data) => trackPos(data)}
								onStart={handleStart}
								onStop={handleStop} >
								<div className="streetview-sash" id="streetview-sash" key="streetview-sash"
									style={{ cursor: "move" }} >
									<div className="line"></div>
									<div className="label" style={{ cursor: "move" }}>
										<img src={sashPosition.x < (mainScreenWidth / 2) ? "./images/right-white.png" : "./images/left-white.png"}
											width="24" height="24" alt="" />
									</div>
								</div>
							</Draggable>
							:
							<div className="streetview-sash" id="streetview-sash" key="streetview-sash"
								style={{ left: sashPosition.x + "px" }} >
								<div className="label" onMouseDown={(e) => handleMouseDown(e)} >
									<img src={sashPosition.x < (mainScreenWidth / 2) ? "./images/right-white.png" : "./images/left-white.png"}
										width="24" height="24" alt="" />
								</div>
							</div>
						)}
				</>}
		</StyledDiv>
	);
};

export default MapSection;

const StyledDiv = styled.div`
	width: ${(props) => (props.carStatusView) ? "40%" : "100%"};
	height: 100%;
	position: relative;
	overflow: hidden;
	background: white;
	border-top-right-radius: 8px;
	display: flex;
	flex-direction: row;

	.notification-bar {
		position: absolute;
		z-index: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;

		top: 0;
		left: 0;
		right: 0;
		padding: 2px 12px;

		background: transparent;
		color: black;
		font-weight: 500;

		img {
			width: 18px;
		}

		.notification-bar-left, .notification-bar-right {
			display: flex;
			align-items: center;
			background-color: rgba(255,255,255,0.8);
			.gap10 {
				width: 10px;
				height: 18px;
			}
			.gap20 {
				width: 20px;
				height: 18px;
			}
			.bg {
				font-size: 0.9rem;
			}
		}
	}

	.streetview-sash {
		position: absolute;
		color: inherit;
		width: 24px;
		height: ${(props) => props.appLayout.carSideHeight}px;
		top: 0px;
		margin: auto;
		user-select: none;
		z-index: 1;
		background: transparent;

		.line {
			position: absolute;
			left: 0px; 
			top: 0px; 
			width: 4px; 
			height: ${(props) => props.appLayout.carSideHeight}px; 
			background: red; 
		}
		.label {
			position: absolute; 
			left: 0px; 
			top: ${(props) => (props.appLayout.carSideHeight / 2)}px;
			font-size: 1.1rem;
			background: darkgrey;
			opacity: 0.7;
			width: 24px;
			height: 48px;
			padding: 12px 0;
			cursor: pointer;
		}
	}
`;
