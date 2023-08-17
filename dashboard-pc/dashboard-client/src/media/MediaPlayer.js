import { useEffect } from "react";

const MediaPlayer = ({
	isPlaying,
	setIsPlaying,
	currentPlaying,
	nextSong,
	prevSong,
	toggleExpand,
	expand,
	currentApp,
}) => {
	
	useEffect(() => {
		if (currentPlaying != null && currentPlaying.name !== "") {
			playPause(true);
		}
		else {
			playPause(false);
		}
	}, 
	// eslint-disable-next-line
	[currentPlaying]);

	function playPause(play) {
		if (currentPlaying != null && currentPlaying.url != null && currentPlaying.url !== "") {
			let div = document.getElementById('myRadio');
			if (div != null) {
				let myRadio = div.getElementsByTagName("video")[0];
				if (myRadio != null) {
					if (play) {
						myRadio.play().catch((err) => {
							//console.log(err);
						});
					}
					else {
						myRadio.pause();
					}
				}
			}
		}
		setIsPlaying(play);
	}

	function getAppImage() {
		if (currentApp) {
			return currentApp.image;
		}
		else {
			return "./media/music-gray.png";
		}
	}

	function getImageStyle() {
		if (currentApp) {
			return {
				width: currentApp.style.width * 0.8,
				height: currentApp.style.height * 0.8,
				padding: currentApp.style.padding * 0.8
			}
		}
		else {
			return {
				width: 64,
				height: 64,
			}
		}
	}

	return (
		<div style={styledView} >
			<div style={styledView.currentMediaApps} >
				<div style={styledView.currentMediaApp} >
					<img src={getAppImage()} style={getImageStyle()} alt=""/>
				</div>
				<div style={styledView.currentPlaying} id="current-playing">
					{currentPlaying && currentPlaying.name && currentPlaying.name !== "" &&
						<span style={styledView.currentPlaying.title}>{currentPlaying.name}</span>
					}
					{currentPlaying && currentPlaying.desc && currentPlaying.desc !== "" &&
						<span style={styledView.currentPlaying.desc}>{currentPlaying.desc}</span>
					}
				</div>
			</div>
			<div style={styledView.controls} >
				<div onClick={prevSong} style={styledView.controls.div} >
					<img src="./images/prev-button.png" alt="prev" />
				</div>
				<div onClick={() => playPause(!isPlaying)} style={styledView.controls.div} >
					{isPlaying ? (
						<img src="./images/pause-button.png" alt="pause" />
					) : (
						<img src="./images/play-button.png" alt="play" />
					)}
				</div>
				<div onClick={nextSong} style={styledView.controls.div} >
					<img src="./images/next-button.png" alt="next" />
				</div>
				<div onClick={toggleExpand} style={styledView.controls.div} >
					{expand ? (
						<img src="./images/expand-down.png" alt="" />
					) : (
						<img src="./images/expand-up.png" alt="" />
					)}
				</div>
			</div>
		</div>
	);
};

export default MediaPlayer;

const styledView = {
	width: "100%",
	height: 80,

	display: "flex",
	flexDirection: "row",
	backgroundColor: "#eeeeee",
	alignItems: "center",
	justifyContent: "space-between",
	
	currentMediaApps: {
		width: "70%",
		height: 80,
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		//gap: 16,
	},
	currentMediaApp: {
		width: "20%",
		height: 80,

		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		//backgroundColor: "lightyellow",,

		//img: {
		//	width: 64,
		//	height: 64,
		//	resizeMode: "contain"
		//}
	},
	currentPlaying: {
		width: "80%",
		height: 80,
		//paddingHorizontal: 16,
		padding: "0 16px",

		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "flex-start",
		//gap: 16,
		//backgroundColor: "lightblue",
		
		//img: {
		//	width: 240,
		//	height: 48,
		//	resizeMode: "contain"
		//},
		title: {
			fontSize: 24,
			fontWeight: "700",
		},
		desc: {
			fontSize: 16,
		},
	},

	controls: {
		width: "30%",
		height: 80,
		//paddingHorizontal: 24,
		padding: "0 24px",
		
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		gap: 32,
		justifyContent: "space-between",
		//backgroundColor: "lightpink",

		div: {
			width: 32,
			height: 32,
			cursor: "pointer"
		}
	}
};
