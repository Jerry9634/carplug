import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Iframe from 'react-iframe';

const CarStatus = (
	{ 
		appLayout, carStatusView, mapView,
	}
) => {
	
	const [carLocked, setCarLocked] = useState(true);
	const [frunkOpen, setFrunkOpen] = useState(false);
	const [trunkOpen, setTrunkOpen] = useState(false);
	const [chargingDoorOpen, setChargingDoorOpen] = useState(false);

	const [optionsId, setOptionsId] = useState(0);
	const OPTIONS = {
		NONE   : 0,
		CHARGE : 1,
		MIC    : 2,
	};

	function getImage() {
		if (frunkOpen) {
			if (trunkOpen) {
				return ("./tesla/model-y-frunk-trunk-open.jpg");
			}
			return ("./tesla/model-y-frunk-open.webp");
		}
		else if (trunkOpen) {
			if (frunkOpen) {
				return ("./tesla/model-y-frunk-trunk-open.jpg");
			}
			return ("./tesla/model-y-trunk-open.jpg");
		}
		else if (chargingDoorOpen) {
			return ("./tesla/model-y-charge-open.jpg");
		}
		else {
			return ("./tesla/model-y.jpg");
		}
	}

	function isAllDoorClosed() {
		return (!frunkOpen && !trunkOpen && !chargingDoorOpen);
	}

	const doorLockPosInit = {
		lblTop: 152,
		lblLeft: 442,
		vlTop: 205,
		vlLeft: 474,
		vlWidth: 1,	
	};
	const frunkPosInit = {
		width: 200,
		height: 120,
		top: 340,
		left: 170,
		lblTop: 295,
		lblLeft: 176,
		vlTop: 295,
		vlLeft: 240,
		vlWidth: 1,
	};
	const trunkPosInit = {
		width: 120,
		height: 60,
		top: 250,
		left: 570,
		lblTop: 192,
		lblLeft: 640,
		vlTop: 192,
		vlLeft: 640,
		vlWidth: 1,
	};
	const chargingDoorPosInit = {
		width: 50,
		height: 40,
		top: 315,
		left: 660,
		vlTop: 335,
		vlLeft: 690,
		vlHeight: 1,
		vlWidth: 32,
		lblTop: 300,
		lblLeft: 712,
	};
	const [doorLockPos, setDoorLockPos] = useState(doorLockPosInit);
	const [frunkPos, setFrunkPos] = useState(frunkPosInit);
	const [trunkPos, setTrunkPos] = useState(trunkPosInit);
	const [chargingDoorPos, setChargingDoorPos] = useState(chargingDoorPosInit);

	useEffect(() => {
		let scale;
		if (!mapView) {
			scale = 5/3;
		}
		else {
			scale = 1;
		}

		let pos1;
		let pos2;
		let pos3;
		let pos4;
		if (scale === 1) {
			pos1 = doorLockPosInit;
			pos2 = frunkPosInit;
			pos3 = trunkPosInit;
			pos4 = chargingDoorPosInit;
		}
		else {
			pos1 = {
				lblTop: 62,
				lblLeft: 760,
				vlTop: 115,
				vlLeft: 792,
				vlWidth: 2,
			};
			
			pos2 = {
				width: 200 * scale,
				height: 120 *scale,
				top: 300,
				left: 270,
				lblTop: 300,
				lblLeft: 252,
				vlTop: 300,
				vlLeft: 318,
				vlWidth: 2,
			}
			
			pos3 = {
				width: 120 * scale,
				height: 60 * scale,
				top: 140,
				left: 755,
				lblTop: 108,
				lblLeft: 1050,
				vlTop: 108,
				vlLeft: 1048,
				vlWidth: 2,
			};
			
			pos4 = {
				width: 50 * scale,
				height: 40 * scale,
				top: 255,
				left: 1085,
				lblTop: 245,
				lblLeft: 1192,
				vlHeight: 2,
				vlWidth: 32 * scale,
				vlTop: 280,
				vlLeft: 1148,
			};
		}

		if (frunkOpen) {
			pos2.width = 350 * scale;
			pos2.height = 300 * scale;
			if (scale === 1) {
				pos2.top = 245;
				pos2.left = 170;
			}
			else {
				pos2.top = 145;
				pos2.left = 275;
			}			
		}

		if (trunkOpen) {
			pos3.width = 225 * scale;
			pos3.height = 150 * scale;
			if (scale === 1) {
				pos3.top = 240;
				pos3.left = 450;
			}
			else {
				pos3.top = 140;
				pos3.left = 755;
			}			
		}

		if (chargingDoorOpen) {
			pos4.width = 220 * scale;
			pos4.height = 150 * scale;
			pos4.vlWidth = 380 * scale;
			if (scale === 1) {
				pos4.top = 270;
				pos4.left = 150;
				pos4.vlLeft = 345;
			}
			else {
				pos4.top = 185;
				pos4.left = 245;
				pos4.vlLeft = 570;
			}
		}

		const vDeviation = 16;
		if (vDeviation > 0) {
			pos1.lblTop += vDeviation;
			pos1.vlTop += vDeviation;
			pos2.top += vDeviation;
			pos2.lblTop += vDeviation;
			pos2.vlTop += vDeviation;
			pos3.top += vDeviation;
			pos3.lblTop += vDeviation;
			pos3.vlTop += vDeviation;
			pos4.top += vDeviation;
			pos4.vlTop += vDeviation;
			pos4.lblTop += vDeviation;
		}
		
		setDoorLockPos(pos1);
		setFrunkPos(pos2);
		setTrunkPos(pos3);
		setChargingDoorPos(pos4);	
	},
	// eslint-disable-next-line 
	[mapView, frunkOpen, trunkOpen, chargingDoorOpen]);
	
	function handleFrunkOpen() {
		setFrunkOpen(!frunkOpen);
	}

	function handleTrunkOpen() {
		setTrunkOpen(!trunkOpen);
	}

	function handleChargeDoorOpen() {
		setChargingDoorOpen(!chargingDoorOpen);
	}

	function handleMicrophone() {
		if (optionsId !== OPTIONS.MIC) {
			setOptionsId(OPTIONS.MIC);
		}
		else {
			setOptionsId(OPTIONS.NONE);
		}
	}

	const threeJsModels = [
		"http://vr.ff.com/us/",
		"https://carvisualizer.plus360degrees.com/threejs/",
		"https://www.plus360degrees.com/uxcars/",
		"http://renaultespace.littleworkshop.fr/",
		//"https://threejs.org/examples/#webgl_materials_car",
	];

	const [activeThreeJs, setActiveThreeJs] = useState(-1);

	function get3DView() {
		return threeJsModels[activeThreeJs];
	}
	
	return (
		<StyledDiv 
			frunkOpen={frunkOpen} chargingDoorOpen={chargingDoorOpen}
			doorLockPos={doorLockPos} frunkPos={frunkPos} trunkPos={trunkPos} chargingDoorPos={chargingDoorPos}
			appLayout={appLayout} carStatusView={carStatusView} mapView={mapView}
		>
			{carStatusView &&
			<>
				{activeThreeJs >= 0 ?
				<div style={{ width: appLayout.carSideWidth, height: appLayout.carSideHeight, 
							  borderTopRightRadius: (!mapView ? 8 : 0) }}>
					<Iframe url={get3DView()}
						width="100%"
						height="100%"
						id="my-iframe"
						className=""
						display="block"
						position="relative" />
				</div>
				:
				<div className="tesla-standstill-container">
					<img id="tesla-standstill-img" className="tesla-standstill-img" src={getImage()} alt="" />

					{isAllDoorClosed() &&
						<>
							<div className="doorlock"
								onClick={() => {
									// TODO
									setCarLocked(!carLocked);
								}}
							>
								<img src={carLocked ? "./images/padlock-locked.png" : "./images/padlock-unlocked.png"} alt="" />
							</div>
							<div className="doorlock-vl"></div>
						</>
					}

					{(!trunkOpen && !chargingDoorOpen) &&
						<>
							<button className="frunk"
								onClick={handleFrunkOpen}
							>
								<span>Frunk</span>
								<br />
								<span className="open-close">{frunkOpen ? "Close" : "Open"}</span>
							</button>
							<div className="frunk-vl"></div>
							<button className="frunk-btn"
								onClick={handleFrunkOpen}
							/>
						</>
					}

					{(!frunkOpen && !chargingDoorOpen) &&
						<>
							<button className="trunk"
								onClick={handleTrunkOpen}
							>
								<span>Trunk</span>
								<br />
								<span className="open-close">{trunkOpen ? "Close" : "Open"}</span>
							</button>
							<div className="trunk-vl"></div>
							<button className="trunk-btn"
								onClick={handleTrunkOpen}
							/>
						</>
					}

					{(!frunkOpen && !trunkOpen) &&
						<>
							<div className="charging-door"
								onClick={handleChargeDoorOpen}
							>
								<img src="./images/thunder.png" alt="thunder" />
							</div>
							<div className="charging-door-vl"></div>
							<button className="charging-door-btn"
								onClick={handleChargeDoorOpen}
							/>
						</>
					}
				</div>
				}

				<div style={{
						position: "absolute", zIndex: 2,
						right: 8, top: "40%", width: 40, height: 40,
						display: "flex", justifyContent: "center", alignItems: "center",
						backgroundColor: "gray", opacity: 0.5, borderRadius: 40,
						fontSize: 20, color: "white", 
						cursor: "pointer"
					}}
					onClick={() => { 
						let newModel = activeThreeJs + 1; 
						if (newModel === threeJsModels.length) {
							newModel = -1;
						}
						setActiveThreeJs(newModel);
					}}
				>
					3D
				</div>

				<div className="microphone">
					<button onClick={handleMicrophone}>
						<img src="./images/microphone.png" alt="microphone"/>
					</button>
				</div>
			
				<div className="options">
				{optionsId === OPTIONS.CHARGE && (
				<div className="options-charge">
					<div className="time">
						<span></span>
						<p>
							since{" "}
							{new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit",hour12:true})}
						</p>

						<img src="./images/option.png" alt="" />
					</div>
					<div className="miles">
						<div>
							<span>1.2</span>
							<br />
							<span>mi</span>
						</div>

						<div>
							<span>4</span>
							<br />
							<span>min</span>
						</div>

						<div>
							<span>270</span>
							<br />
							<span>min</span>
						</div>
					</div>
					<span className="options-charge-line"></span>

					<p className="last-charge"> since last charge</p>
				</div>
				)}
				{optionsId === OPTIONS.MIC && (
					<div className="options-mic">
						<span>
							<img src="./images/microphone.png" alt="" />
						</span>
						<div>
							<p><b>Voice Command:</b></p>
							<p>Navigate to office</p>
						</div>
					</div>
				)}
				</div>
			</>
			}
		</StyledDiv>
	);
};

export default CarStatus;

const StyledDiv = styled.div`
	position: relative;
	height: ${(props) => props.appLayout.carSideHeight}px;
	width: ${(props) => props.appLayout.carSideWidth}px;
	color: #6f6f6f;
	background: #f8f8f8;
	//border-top-left-radius: 8px;
	border-top-right-radius: ${(props) => (props.carStatusView && !props.mapView) ? "border-top-right-radius: 8px;" : ""};
	display: flex;
	flex-direction: column;
	font-size: 0.8rem;
	line-height: 1;
	color: #707070;

	.tesla-standstill-container {
		height: ${(props) => (props.appLayout.carSideHeight)}px;
		width: ${(props) => (props.appLayout.carSideWidth)}px;
		z-index: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		.tesla-standstill-img {
			width: ${(props) => (props.mapView ? (1480 * 0.4) : (1480 * 2 / 3))}px;
			height: ${(props) => (props.mapView ? (800 * 0.4) : (800 * 2 / 3))}px;
			transition: all 0.6s ease-in;
		}
	}

	.doorlock {
		cursor: pointer;
		position: absolute;
		background: transparent;
		//background: yellow;
		//opacity: 0.5;
		top: ${(props) => (props.doorLockPos.lblTop)}px;
		left: ${(props) => (props.doorLockPos.lblLeft)}px;
		width: 64px;
		height: 64px;
		padding: 8px;
		img {
			width: 48px;
		}
	}
	.doorlock-vl {
		position: absolute;
		background: darkgray;
		width: ${(props) => (props.doorLockPos.vlWidth)}px;
		height: 50px;
		top: ${(props) => (props.doorLockPos.vlTop)}px;
		left: ${(props) => (props.doorLockPos.vlLeft)}px;
	}

	.frunk {
		cursor: pointer;
		position: absolute;
		top: ${(props) => (props.frunkPos.lblTop)}px;
		left: ${(props) => (props.frunkPos.lblLeft)}px;
		text-align: right;
		border: 0;
		color: inherit;
		background: transparent;
		//background: yellow;
		//opacity: 0.5;
		font-size: 16px;
		font-weight: 500;
		.open-close {
			font-size: 20px;
			font-weight: 700;
		}
	}
	.frunk-vl {
		position: absolute;
		background: darkgray;
		height: 90px;
		width: ${(props) => (props.frunkPos.vlWidth)}px;
		top: ${(props) => (props.frunkPos.vlTop)}px;
		left: ${(props) => (props.frunkPos.vlLeft)}px;
	}
	.frunk-btn {
		position: absolute;
		width: ${(props) => (props.frunkPos.width)}px;
		height: ${(props) => (props.frunkPos.height)}px;
		top: ${(props) => (props.frunkPos.top)}px;
		left: ${(props) => (props.frunkPos.left)}px;
		background: transparent;
		//background: yellow;
		//opacity: 0.5;
		border: 0;
		cursor: pointer;
	}

	.trunk {
		cursor: pointer;
		position: absolute;
		top: ${(props) => (props.trunkPos.lblTop)}px;
		left: ${(props) => (props.trunkPos.lblLeft)}px;
		text-align: left;
		border: 0;
		color: inherit;
		background: transparent;
		//background: yellow;
		//opacity: 0.5;
		font-size: 16px;
		font-weight: 500;
		.open-close {
			font-size: 20px;
			font-weight: 700;
		}
	}
	.trunk-vl {
		position: absolute;
		background: darkgray;
		height: 90px;
		width: ${(props) => (props.trunkPos.vlWidth)}px;
		top: ${(props) => (props.trunkPos.vlTop)}px;
		left: ${(props) => (props.trunkPos.vlLeft)}px;
	}
	.trunk-btn {
		position: absolute;
		width: ${(props) => (props.trunkPos.width)}px;
		height: ${(props) => (props.trunkPos.height)}px;
		top: ${(props) => (props.trunkPos.top)}px;
		left: ${(props) => (props.trunkPos.left)}px;
		background: transparent;
		//background: yellow;
		//opacity: 0.5;
		border: 0;
		cursor: pointer;
	}

	.charging-door {
		cursor: pointer;
		position: absolute;
		top: ${(props) => (props.chargingDoorPos.lblTop)}px;
		left: ${(props) => (props.chargingDoorPos.lblLeft)}px;
		width: 64px;
		height: 64px;
		padding: 12px;
		color: inherit;
		background: transparent;
		//background: yellow;
		//opacity: 0.5;
		img {
			width: 40px;
		}
	}
	.charging-door-vl {
		position: absolute;
		background: ${(props) => (props.chargingDoorOpen ? "yellow" : "darkgray")};
		height: ${(props) => (props.chargingDoorPos.vlHeight)}px;
		width: ${(props) => (props.chargingDoorPos.vlWidth)}px;
		top: ${(props) => (props.chargingDoorPos.vlTop)}px;
		left: ${(props) => (props.chargingDoorPos.vlLeft)}px;
		transition: ${(props) => (props.chargingDoorOpen ? "all 1.0s ease" : "none")};
	}
	.charging-door-btn {
		position: absolute;
		width: ${(props) => (props.chargingDoorPos.width)}px;
		height: ${(props) => (props.chargingDoorPos.height)}px;
		top: ${(props) => (props.chargingDoorPos.top)}px;
		left: ${(props) => (props.chargingDoorPos.left)}px;
		background: transparent;
		//background: yellow;
		//opacity: 0.5;
		border: 0;
		cursor: pointer;
	}

	.microphone {
		position: absolute;
		left: 0px;
		bottom: 0px;
		height: 96px;
		display: flex;
		//justify-content: space-between;
		gap: 48px;
		padding: 24px;
		z-index: 2;
		button {
			width: 48px;
			height: 48px;
			border: 0;
			padding: 8px;
			background: inherit;
		}
		img {
			width: 32px;
			cursor: pointer;
		}
	}

	.options {
		display: flex;
		flex-direction: column;
		margin-top: auto;
		align-self: stretch;
		z-index: 2;

		.options-spans {
			text-align: center;
			span {
				display: inline-block;
				width: 10px;
				height: 10px;
				border-radius: 100%;
				background: #707070;
				cursor: pointer;
				margin: 0 4px;
			}

			.active {
				background: #0080ff;
			}
		}
	}

	.options-charge {
		//width: 95%;
		width: ${(props) => props.appLayout.carSideWidthStd * 0.95}px;
		height: 145px;
		border-radius: 16px;
		bottom: 80px;
		left: 12px;
		position: absolute;
		background: #f8f8f8;
		padding: 12px;
		box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
		
		.time {
			display: flex;
			align-items: center;
			justify-content: space-between;

			img {
				width: 25px;
			}
		}

		.miles {
			display: flex;

			justify-content: space-between;
			width: 80%;
			margin: 0 auto;

			div {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				line-height: 0.7;
				span:first-of-type {
					font-size: 1.3rem;
					font-weight: 700;
				}
			}
		}

		.options-charge-line {
			height: 2px;
			background: #626161;
			width: 100%;
			display: inline-block;
			margin: 18px 0;
		}

		.last-charge {
			text-align: center;
		}
	}

	.options-mic {
		width: ${(props) => props.appLayout.carSideWidthStd * 0.95}px;
		height: 145px;
		border-radius: 16px;
		bottom: 80px;
		left: 12px;
		position: absolute;
		background: #f8f8f8;
		box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
		
		& > span {
			position: absolute;
			top: 12px;
			left: 16px;

			width: 60px;
			height: 60px;
			border-radius: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			background: #f8f8f8;
			box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
			border: 1px solid #6F6F6F;
		}

		img {
			width: 35px;
		}

		div {
			position: absolute;
			left: 92px;
			top: 16px;
			width: 384px;
			font-size: 16px;
		}
	}
`;
