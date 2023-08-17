import { useEffect, useState } from "react";
import MediaPlayer from "./MediaPlayer";
import { RadioStreamingList, getInternetStations, internetRadioUrls } from "./RadioStreamingList";
import { v4 as uuidv4 } from "uuid";
import styled from "styled-components";

import ReactPlayer from 'react-player/lazy';
import MediaApps from "./MediaApps";


const MediaMain = ({ appLayout, carStatusView, mapView }) => {

	const [allAppsView, setAllAppsView] = useState(playerMemory.available? false : true);
	const [currentApp, setCurrentApp] = useState(
		playerMemory.available? playerMemory.currentApp : null);
	const [stations, setStations] = useState(
		playerMemory.available? playerMemory.stations : internetRadioUrls.list.filter(isKoreanStation));
	const [currentStation, setCurrentStation] = useState(
		playerMemory.available? playerMemory.currentStation : 0);
	const [stationUrl, setStationUrl] = useState(
		playerMemory.available? playerMemory.stationUrl : "");
	const [initComplete, setInitComplete] = useState(false);

	const [currentPlaying, setCurrentPlaying] = useState(null);
	const [isPlaying, setIsPlaying] = useState(
		playerMemory.available? playerMemory.isPlaying : false);
	const [expand, setExpand] = useState(true);

	useEffect(() => {
		if (!internetRadioUrls.allOK) {
			getInternetStations(setRegionalStations, setStationUrl);
		}
	}, 
	// eslint-disable-next-line
	[]);

	const nextSong = () => {
		let newIndex;
		if (currentApp) {
			if (currentApp.name === "Radio" || currentApp.name === "BBC Radio") {
				if (stations.length > 0) {
					if (currentStation + 1 < stations.length) {
						newIndex = currentStation + 1;
					} else {
						newIndex = 0;
					}
					setCurrentStation(newIndex);
					setStationUrl(stations[newIndex].url);
				}
			}
		}
	};

	const prevSong = () => {
		let newIndex;
		if (currentApp) {
			if (currentApp.name === "Radio" || currentApp.name === "BBC Radio") {
				if (stations.length > 0) {
					if (currentStation > 0) {
						newIndex = currentStation - 1;
					} else {
						newIndex = stations.length - 1;
					}
					setCurrentStation(newIndex);
					setStationUrl(stations[newIndex].url);
				}
			}
		}
	};

	useEffect(() => {
		if (!initComplete) {
			setInitComplete(true);
			if (playerMemory.available && playerMemory.isPlaying) {
				if (playerMemory.currentApp.name === "Radio" || playerMemory.currentApp.name === "BBC Radio") {
					setCurrentPlaying(playerMemory.stations[playerMemory.currentStation]);
					return;
				}
			}
		}

		if (currentApp) {
			if (currentApp.name === "Radio" || currentApp.name === "BBC Radio") {
				if (currentStation < stations.length && stationUrl != null && stationUrl !== "") {
					setCurrentPlaying(stations[currentStation]);
					try {
						// play from url
						//SoundPlayer.playUrl(stationUrl);
						playerMemory.currentApp = currentApp;
						playerMemory.currentStation = currentStation;
						playerMemory.stationUrl = stationUrl;
						playerMemory.stations = stations;
						playerMemory.isPlaying = true;
						playerMemory.available = true;
					} catch (e) {
						playerMemory.isPlaying = false;
						console.log(`cannot play the sound file`, e);
					}
				}
			}
			else {
				//SoundPlayer.playUrl(stationUrl);
				playerMemory.currentApp = currentApp;
				//playerMemory.currentStation = currentStation;
				//playerMemory.stationUrl = stationUrl;
				//playerMemory.stations = stations;
				playerMemory.isPlaying = true;
				playerMemory.available = true;

				setCurrentPlaying({
					name: currentApp.name,
					desc: currentApp.desc,
					image: currentApp.image
				});
			}
			setAllAppsView(false);
		}
		else {
			setCurrentPlaying({name:"", image:"", desc: ""});
		}
	}, 
	// eslint-disable-next-line
	[currentApp, currentStation, stationUrl]);

	async function toggleExpand() {
		setExpand(!expand);
	}

	function listRadioStations() {
		return (
			<>
			{stations.map((station, idx) =>
			<RadioStreamingList
				channel={station}
				currentIndex={idx}
				setCurrentStation={setCurrentStation}
				setStationUrl={setStationUrl}
				carStatusView={carStatusView}
				mapView={mapView}
				key={uuidv4()}
			/>)}
			</>
		);
	}

	function isBBCStation(station) {
		return (station.name.indexOf("BBC") > -1);
	}

	function isKoreanStation(station) {
		return (station.name.indexOf("BBC") === -1);
	}

	function setRegionalStations(app = currentApp) {
		let stations;
		if (!app || app.name === "Radio") {
				stations = internetRadioUrls.list.filter(isKoreanStation);
		}
		else {
			stations = internetRadioUrls.list.filter(isBBCStation);
		}
		setStations(stations);
		return stations;
	}

	function _onReady(event) {
		// access to player in all event handlers via event.target
		//if (currentApp.name === "Radio" || currentApp.name === "BBC Radio") {
		//	setCurrentPlaying(stations[currentStation]);
		//}
	}

	return (
		<StyledDiv expand={expand} appLayout={appLayout} carStatusView={carStatusView} mapView={mapView}>
			<MediaPlayer
				isPlaying={isPlaying}
				currentPlaying={currentPlaying}
				setIsPlaying={setIsPlaying}
				nextSong={nextSong}
				prevSong={prevSong}
				setExpand={setExpand}
				toggleExpand={toggleExpand}
				expand={expand}
				currentApp={currentApp}
			/>

			{allAppsView ?
				<div style={mediaMainStyle.mediaApps}>
					<MediaApps
						currentApp={currentApp}
						setCurrentApp={setCurrentApp}
						setRegionalStations={setRegionalStations}
						setCurrentStation={setCurrentStation}
						setStationUrl={setStationUrl}
						setCurrentPlaying={setCurrentPlaying}
						allAppsView={allAppsView}
						setAllAppsView={setAllAppsView}
					>
					</MediaApps>
				</div>
				:
				<>
					{currentApp && (currentApp.name === "Radio" || currentApp.name === "BBC Radio") &&
						<div style={mediaMainStyle.radioPlaylist}>
							{listRadioStations()}
						</div>
					}
				</>
			}
			{currentApp && (currentApp.name === "Radio" || currentApp.name === "BBC Radio") &&
				<ReactPlayer
					id="myRadio"
					controls={false}
					playing={true}
					muted={false}
					width="0px"
					height="0px"
					url={stationUrl}
					onReady={_onReady}
				/>
			}
			{expand && !allAppsView &&
				<div 
					onClick={() => setAllAppsView(true)}
					style={{
						position: "absolute", right: 10, bottom: 10, width: 96, height: 48, 
						display: "flex", justifyContent: "center", alignItems: "center", 
						backgroundColor: "gray", opacity: 0.5, borderRadius: 40,
						fontSize: 24, color: "white", cursor: "pointer"
					}}
				>
					<div>Exit</div>
				</div>
			}
		</StyledDiv>
	);
};

export default MediaMain;

const playerMemory = {
	available: false,
	currentApp: null,
	currentStation: 0,
	stationUrl: "",
	isPlaying: false,
	stations: []
};

const mediaMainStyle = {
	position: "absolute", 
    left: 0, 
    top: 0,  
    width: "100%", 
    height: "100%", 
    backgroundColor:"white",

	mediaApps: {
		padding: 8,
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center", 
	},

	radioPlaylist: {
		padding: 8,
		display: "flex",
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		width: "100%",
		maxHeight: "calc(100% - 84px)",
		overflow: "scroll"		
	},
};

// const mediaCollapsedStyle = {
// 	position: "absolute", 
//     left: 0, 
//     bottom: 0,  
//     width: "100%", 
//     height: 80, 
//     backgroundColor:"white",
// };

const StyledDiv = styled.div`
	background: #ffffff;
	height: ${(props) => (props.expand? props.appLayout.appExpandHeight : 80)}px;
	position: relative;
	z-index: 2;
	width: ${(props) => props.carStatusView && props.mapView ? "60%" : "100%"};
	color: #707070;
`;

