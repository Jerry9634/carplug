import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import VideoPlayer from "../media/VideoPlayer";

const TeslaDemo = ({teslaVideo, active, appLayout}) => {
	const videoRef = useRef();

	useEffect(() => {
		if (active) {
			videoRef.current.setAttribute("playsinline", "");
			videoRef.current.setAttribute("autoplay", "");
			videoRef.current.setAttribute("muted", "");
			if (teslaVideo === "dashcam") {
				videoRef.current.setAttribute("src",
				"./tesla/ZP8CF7_EN_-_Dashcam_FYFTOR.mp4");
			}
		}
	},
	// eslint-disable-next-line 
	[active, teslaVideo]);

	function getTitle() {
		return teslaVideo.toUpperCase();
	}

	return (
		<StyledDiv appLayout={appLayout}>
			<div className="tesla-demo-content">
				<h2>{getTitle()}</h2>
				{active &&
					<VideoPlayer videoRef={videoRef} />
				}
			</div>
		</StyledDiv>
	);
};

export default TeslaDemo;

const StyledDiv = styled.div`
	background: #eeeeee;
	color: #6f6f6f;
	height: 700px;
	position: relative;
	z-index: 2;
	margin-left: ${(props) => (
		props.appLayout.carSideWidth === props.appLayout.carSideWidthStd ?
		props.appLayout.carSideWidth : 0
	)}px;

	.tesla-demo-content {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
`;

