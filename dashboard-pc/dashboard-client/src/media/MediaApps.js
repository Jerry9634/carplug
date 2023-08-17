
const MediaApps = ({
	currentApp,
	setCurrentApp,
	setRegionalStations,
	setCurrentStation,
	setStationUrl,
	setCurrentPlaying,
	allAppsView,
	setAllAppsView,
}) => {

	function startApp(app) {
		if (!currentApp || (app.name !== currentApp.name)) {
			clearCurrentDisplay();
			setCurrentApp(app);
			if (app.name === "Radio" || app.name === "BBC Radio") {
				let stations = setRegionalStations(app);
				if (stations.length > 0) {
					setCurrentStation(0);
					setStationUrl(stations[0].url);
				}
			}
		}
		else if (currentApp && (app.name === currentApp.name) && allAppsView) {
			setAllAppsView(false);
		}
	}

	function clearCurrentDisplay() {
		//let div = document.getElementById("current-playing");
		//div.getElementsByTagName("span")[0].innerText = "";
		//div.getElementsByTagName("span")[1].innerText = "";
		setCurrentPlaying({name:"", image:"", desc: ""});
	}

	return (
		<>
			{mediaApps.map((app, idx) =>
				<div
					onClick={() => startApp(app)}
					key={idx}
					style={styledView}
				>
					<div style={styledView.innerBorder}>
						<div style={{ height: "75%", display: "flex", alignItems: "center", justifyContent: "center" }}>
							<img src={app.image} alt="" style={app.style} ></img>
						</div>
						<div style={{ height: "25%", display: "flex", alignItems: "center", justifyContent: "center" }}>
							<span>{app.name}</span>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

const mediaApps = [
	{
		name: "Radio", 
		image: "./media/K-Radio.webp",
		desc: "",
		url: "",
		style: { width: 80, height: 80, padding: 0 },
	},
	{
		name: "BBC Radio", 
		image: "./media/BBC_Radio.png",
		desc: "",
		url: "",
		style: { width: 80, height: 80, padding: 0 },
	},
	{
		name: "Bluetooth", 
		image: "./media/Bluetooth.png",
		desc: "",
		url: "",
		style: { width: 80, height: 80, padding: 0 },
	},
	{
		name: "Melon Music", 
		image: "./media/melon_music.png",
		desc: "",
		url: "melon.com",
		style: { width: 100, height: 100, padding: 0 },
	},
	{
		name: "Spotify", 
		image: "./media/Spotify.png",
		desc: "",
		url: "spotify.com",
		style: { width: 100, height: 100, padding: 0 },
	},
	{
		name: "Apple Music", 
		image: "./media/AppleMusic.png",
		desc: "",
		url: "music.apple.com",
		style: { width: 60, height: 60, padding: 10 },
	},
	{
		name: "YouTube Music", 
		image: "./media/youtube_music.png",
		desc: "",
		url: "music.youtube.com",
		style: { width: 60, height: 60, padding: 10 },
	},
	{
		name: "Caraoke", 
		image: "./media/Caraoke.png",
		desc: "",
		url: "",
		style: { width: 60, height: 60, padding: 10 },
	},
	{
		name: "TuneIn", 
		image: "./media/TuneIn.png",
		desc: "",
		url: "tunein.com",
		style: { width: 100, height: 100, padding: 0 },
	},	
	{
		name: "Tidal", 
		image: "./media/Tidal.png",
		desc: "",
		url: "tidal.com",
		style: { width: 100, height: 100, padding: 0 },
	},
	{
		name: "Netflix", 
		image: "./media/netflix.png",
		desc: "",
		url: "netflix.com",
		style: { width: 60, height: 60, padding: 10 },
	},
	{
		name: "YouTube", 
		image: "./media/youtube.png",
		desc: "",
		url: "youtube.com",
		style: { width: 70, height: 70, padding: 5 },
	},
];

export default MediaApps;

const styledView = {
	width: "20%", 
	height: 192,
	padding: 8,
	//display: "flex", 

	innerBorder: {
		borderRadius: 12,
		backgroundColor: "#f0f0f0",
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
		fontSize: "1.2rem",
		cursor: "pointer"
	}
};
