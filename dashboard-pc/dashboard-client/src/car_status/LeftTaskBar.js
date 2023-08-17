import { useEffect } from "react";
import styled from "styled-components";
import Modal from 'react-modal';
import { useTts } from 'tts-react';

import { setSignal, setSignals } from "../vplug/WsReq";
import { muteMediaVolume } from "../media/VolumeControl";

const Speak = ({ children }) => (
	<>{useTts({ children, autoPlay: true, lang: "kr", volume: 1.0 }).ttsChildren}</>
);

const LeftTaskBar = ( 
	{ 
		appLayout, setCarStatusView, setMapView,
		gear, speed, hazardReq, setHazardReq,
	}
) => {

	useEffect(() => {
		if (gear === "d") {
			setCarStatusView(false);
			setMapView(true);
		}
		else {
			setCarStatusView(true);
		}
	}, 
	// eslint-disable-next-line
	[gear]);

    function handleGearP() {
		setSignals({
			signals: [
				{ name: "VCU_GearPosSta", value: 0 },
				{ name: "CLU_DisSpdVal", value: 0 },
			]
		});
	}

	function handleGearR() {
		setSignal("VCU_GearPosSta", 7);
	}

	function handleGearN() {
		setSignal("VCU_GearPosSta", 6);
	}

	function handleGearD() {
		setSignal("VCU_GearPosSta", 5);
	}

	function showWarnings() {
		if (gear !== "d") {
			return (
				<>
					<img src={"./tesla/icons/parking-brake-fault.png"} alt=""
						style={{ width: 32, height: 32, margin: 8 }} />
					<img src={"./tesla/icons/parking-brake-manual.png"} alt=""
						style={{ width: 36, height: 36, margin: 6 }} />
					<img src={"./tesla/icons/low-beam.png"} alt=""
						style={{ width: 36, height: 36, margin: 6 }} />
					<img src={"./tesla/icons/high-beam.png"} alt=""
						style={{ width: 36, height: 36, margin: 6 }} />
					<img src={"./tesla/icons/parking-light.png"} alt=""
						style={{ width: 40, height: 40, margin: 4 }} />
					<img src={"./tesla/icons/front-fog-light.png"} alt=""
						style={{ width: 40, height: 40, margin: 4 }} />
					<img src={"./tesla/icons/tire-pressure-warning.png"} alt=""
						style={{ width: 48, height: 48, margin: 0 }} />
					<img src={"./tesla/icons/seat-belt-reminder.png"} alt=""
						style={{ width: 48, height: 48, margin: 0 }} />
					<img src={"./tesla/icons/airbag-safety-warning.png"} alt=""
						style={{ width: 48, height: 48, margin: 0 }} />
					<img src={"./tesla/icons/blue-snowflake.png"} alt=""
						style={{ width: 32, height: 32, margin: 8 }} />
					<img src={"./tesla/icons/door-frunk-trunk-open.png"} alt=""
						style={{ width: 36, height: 36, margin: 6 }} />
					<img src={"./tesla/icons/trailer-mode.png"} alt=""
						style={{ width: 36, height: 36, margin: 6 }} />
				</>
			);
		}
		else {
			return (
				<>
					<img src={"./tesla/icons/auto-high-beam-enabled-off.png"} alt=""
						style={{ width: 40, height: 40, margin: 4 }} />
					<img src={"./tesla/icons/auto-high-beam-enabled-on.png"} alt=""
						style={{ width: 40, height: 40, margin: 4 }} />
					<img src={"./tesla/icons/car-steering-wheel.png"} alt=""
						style={{ width: 24, height: 24, margin: 12 }} />
					<img src={"./tesla/icons/autosteer-inactive.png"} alt=""
						style={{ width: 42, height: 42, margin: 2 }} />
					<img src={"./tesla/icons/brake-system-fault.png"} alt=""
						style={{ width: 34, height: 34, margin: 7 }} />
					<img src={"./tesla/icons/ABS-fault.png"} alt=""
						style={{ width: 32, height: 32, margin: 8 }} />
					<img src={"./tesla/icons/brake-booster-fault.png"} alt=""
						style={{ width: 34, height: 34, margin: 7 }} />
					<img src={"./tesla/icons/electronic-stability-control-off.png"} alt=""
						style={{ width: 42, height: 42, margin: 3 }} />
					<img src={"./tesla/icons/stability-control.png"} alt=""
						style={{ width: 48, height: 48, margin: 0 }} />
					<img src={"./tesla/icons/regen-braking-limited.png"} alt=""
						style={{ width: 38, height: 38, margin: 5 }} />
					<img src={"./tesla/icons/vehicle-hold.png"} alt=""
						style={{ width: 36, height: 36, margin: 6 }} />
					<img src={"./tesla/icons/vehicle-power-limited.png"} alt=""
						style={{ width: 32, height: 32, margin: 8 }} />
				</>
			);
		}
	}

	function forward() {
		if (gear !== "d" && speed === 0) {
			handleGearD();
			//Tts.speak("Drive");
		}
	}

	function reverse() {
		if (gear !== "r" && speed === 0) {
			handleGearR();
			//Tts.speak("Reverse");
		}
	}

	function doContextAction() {
		if (gear === "p") {
			handleGearN();
			//Tts.speak("Neutral");
		}
		else {
			handleGearP();
			//Tts.speak("Parking");
		}
	}

	useEffect(()=> {
		if (hazardReq) {
			setTimeout(()=> {
				setHazardReq(false);
				//sendSignal("C_HazardFromCCS", 0);
				setSignal("C_HazardFromCCS", 0);
			}, 10000);
		}
	},
	// eslint-disable-next-line
	[hazardReq]);

	const customStyles = {
		content: {
		  top: '50%',
		  left: '50%',
		  right: 'auto',
		  bottom: 'auto',
		  marginRight: '-50%',
		  transform: 'translate(-50%, -50%)',
		  width: appLayout.screenWidth / 2,
		  height: appLayout.screenHeight / 2,
		  backgroundColor: "transparent",
		  borderWidth: 0,
		},
	};

	return (
		<div style={styles.container}>
			<div
				style={styles.gearForward}
				onClick={forward}
			>
				<img src={"./images/up-gray.png"} style={styles.image} alt="" />
			</div>
			<div
				style={styles.gearState}
				onClick={doContextAction}
			>
				<div style={gear === "d" ? styles.labelBlue : styles.label}>
					{gear.toUpperCase()}
				</div>
			</div>
			<div
				style={styles.gearReverse}
				onClick={reverse}
			>
				<img src={"./images/down-gray.png"} style={styles.image} alt="" />
			</div>

			<div style={{ padding: 8 }}>
				{showWarnings()}
			</div>

			<Modal isOpen={hazardReq} style={customStyles} contentLabel={"Hazard"} ariaHideApp={false}>
				<StyledDiv appLayout={appLayout}>
					<div className="hazard-blinking">
						<div className="hazard-img">
							<img src="./map/Car-hazard-Symbol.webp" alt="" />
							<p className="red-txt">Hazard</p>
						</div>
						<div className="hazard-txt">
							<p>Look Out!</p>
							<p>전방 주의!</p>
						</div>
					</div>
				</StyledDiv>
			</Modal>
			{hazardReq && muteMediaVolume(15000) &&
				<div style={{ display: "none" }}>
					<Speak>
						<p>전방 주의! 전방 주의! 조심하세요!</p>
						<p></p>
						<p>전방 주의! 전방 주의! 조심하세요!</p>
						<p></p>
						<p>전방 주의! 전방 주의! 조심하세요!</p>
					</Speak>
				</div>
			}
		</div>
	);
};

export const LEFT_TASKBAR_WIDTH = 64;

export default LeftTaskBar;

const styles = {
	container: {
		width: LEFT_TASKBAR_WIDTH,
		height: "100%",
		backgroundColor: "#eeeeee",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		paddingTop: 8,
		borderTopLeftRadius: 8
	},
	gearForward: {
		width: 56,
		height: 48,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "darkgray",
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		cursor: "pointer",
	},
	gearReverse: {
		width: 56,
		height: 48,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderStyle: "solid",
		borderColor: "darkgray",
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		cursor: "pointer",
	},
	gearState: {
		width: 56,
		height: 56,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 1,
		borderTopWidth: 0,
		borderBottomWidth: 0,
		borderStyle: "solid",
		borderColor: "darkgray",
		cursor: "pointer",
	},
	label: {
		color: "black",
		fontSize: 32,
		fontWeight: "700",
	},
	labelBlue: {
		color: "blue",
		fontSize: 32,
		fontWeight: "700",
	},
	image: {
		width: 32,
		height: 32,
	}
};

const StyledDiv = styled.div`

	width: 100%;
	height: 100%;

	.hazard-blinking {
		width: 100%;
		height: 100%;
		background: #f8f8f8;
		border: 4px solid red;
		border-radius: 16px;
		box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
		
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;

		font-size: 56px;
		font-weight: 700;

		@keyframes blink {
            0% {
                opacity: 1;
            }
			25% {
                opacity: 0.5;
            }
            50% {
                opacity: 0;
            }
			75% {
                opacity: 0.5;
            }
            100% {
                opacity: 1;
            }
        }

		.hazard-img {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			gap: 32px;
			align-items: center;
			width: 50%;
			
			img {
				width: 256px;
				animation: blink 0.5s;
            	animation-iteration-count: infinite;
			}
			.red-txt {
				color: red;
				animation: blink 0.5s;
            	animation-iteration-count: infinite;
			}
		}

		.hazard-txt {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			gap: 32px;
			align-items: center;
			width: 50%;
		}
	}

	.vplug-blinking {
		width: 100%;
		height: 100%;
		background: #f8f8f8;
		border: 4px solid lightblue;
		border-radius: 16px;
		box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
		
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;

		font-weight: 700;

		@keyframes blink {
            0% {
                opacity: 1;
            }
			25% {
                opacity: 0.5;
            }
            50% {
                opacity: 0;
            }
			75% {
                opacity: 0.5;
            }
            100% {
                opacity: 1;
            }
        }

		.vplug-img {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			gap: 32px;
			align-items: center;
			width: 40%;
			
			img {
				width: 128px;
				animation: blink 1.0s;
            	animation-iteration-count: infinite;
			}
			.blink-txt {
				font-size: 32px;
				animation: blink 1.0s;
            	animation-iteration-count: infinite;
			}
		}

		.vplug-txt {
			display: flex;
			flex-direction: column;
			//justify-content: space-between;
			//gap: 32px;
			align-items: center;
			width: 60%;
			font-size: 24px;
		}
	}
`;
