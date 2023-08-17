import React from "react";
import Webcam from "react-webcam";
import styled from "styled-components";

const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
};
  
const AutoParkCam = () => {
    return(
        <StyledDiv>
            <Webcam
                audio={false}
                screenshotFormat="image/png"
                videoConstraints={videoConstraints}
                imageSmoothing={true}
                //mirrored={true}
                controls={true}
                width={640}
                height={480}
            />
        </StyledDiv>
    );
};

export default AutoParkCam;

const StyledDiv = styled.div`
    //
`;
