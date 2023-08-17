import React from "react";
import styled from "styled-components";
const VideoPlayer = ({ videoRef }) => {
	return (
		<div>
			<StyledVideo id="demo-video" ref={videoRef} controls></StyledVideo>
		</div>
	);
};

export default VideoPlayer;

const StyledVideo = styled.video`
	height: 480px;
	width: 640px;
`;
