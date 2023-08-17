import React from "react";
import styled from "styled-components";
import TabsSelector from "../car_control/components/TabsSelector";

import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { useTts } from 'tts-react';
import VideoCall from "./VideoCall";

const Speak = ({ children }) => (
    <>{useTts({ children, autoPlay: true, lang: "kr", volume: 1.0 }).ttsChildren}</>
);
const objectsDetected = new Map();
var timeTicks = 0;
var personDetectedDuration = 0;
var aiCamRecording = false;
var aiCamRecordedChunks = null;
  
const Dashcam = ({ active, appLayout }) => {

    const [stream, setStream] = React.useState(null);
    const [video, setVideo] = React.useState(null);
    const [imgSrc, setImgSrc] = React.useState(null);
  
    const capture = React.useCallback(() => {
        const photo = capturePhoto();
        setImgSrc(photo.toDataURL());
    }, 
    // eslint-disable-next-line
    [stream, setImgSrc]);

    function capturePhoto() {
        const w = video.videoWidth;
        const h = video.videoHeight;
        const canvas = document.createElement('canvas');
        canvas.width  = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, w, h);
        return canvas;
    } 

    const mediaRecorderRef = React.useRef(null);
    const [capturing, setCapturing] = React.useState(false);
    const [recordedChunks, setRecordedChunks] = React.useState([]);

    const handleStartCaptureClick = React.useCallback(() => {
        setCapturing(true);
        mediaRecorderRef.current = new MediaRecorder(stream, {
            mimeType: "video/webm"
        });
        mediaRecorderRef.current.addEventListener(
            "dataavailable",
            handleDataAvailable
        );
        mediaRecorderRef.current.start();
    }, 
    // eslint-disable-next-line
    [stream, setCapturing, mediaRecorderRef]);

    const handleDataAvailable = React.useCallback(
        ({ data }) => {
            if (data.size > 0) {
                setRecordedChunks((prev) => { 
                    const result = prev.concat(data);
                    aiCamRecordedChunks = result;
                    return result;
                });
            }
        },
        [setRecordedChunks]
    );

    const handleStopCaptureClick = React.useCallback(() => {
        mediaRecorderRef.current.stop();
        setCapturing(false);
    }, 
    // eslint-disable-next-line
    [mediaRecorderRef, stream, setCapturing]);

    const handleDownload = React.useCallback(() => {
        if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, {
                //type: "video/webm"
                type: "video/mp4"
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            const date = new Date().toLocaleDateString();
            const time = new Date().toLocaleTimeString();
            a.download = "vid_" + date + "_" + time + ".mp4";
            a.click();
            window.URL.revokeObjectURL(url);
            setRecordedChunks([]);
        }
    }, [recordedChunks]);

    const handleImgDownload = React.useCallback(() => {
        if (imgSrc != null) {
            const url = imgSrc;
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            const date = new Date().toLocaleDateString();
            const time = new Date().toLocaleTimeString();
            a.download = "img_" + date + "_" + time + ".jpg";
            a.click();
            window.URL.revokeObjectURL(url);
            setImgSrc(null);
        }
    }, [imgSrc]);

    const [sentryMode, setSentryMode] = React.useState(false);
    const [model, setModel] = React.useState(null);
    const [detectionInterval, setDetectionInterval] = React.useState(null);
    const [objectToSpeakOut, setObjectToSpeakOut] = React.useState(null);
    const liveView = React.useRef(null);
    const children = [];

    React.useEffect(() => {
        cocoSsd.load().then((loadedModel) => {
            setModel(loadedModel);
        });
        return () => {
			// Release timers
			if (detectionInterval != null) {
				clearInterval(detectionInterval);
			}
		};
    }, 
    // eslint-disable-next-line
    []);

    React.useEffect(() => {
        if (!detectionInterval) {
            if (model && stream && sentryMode) {
                const interval = setInterval(predictWebcam, 200);
                setDetectionInterval(interval);
                personDetectedDuration = 0;
            }
        }
        else {
            if (!stream || !sentryMode) {
                // Remove any highlighting we did previous frame.
                if (liveView.current) {
                    for (let i = 0; i < children.length; i++) {
                        liveView.current.removeChild(children[i]);
                    }
                }

                children.splice(0);
                clearInterval(detectionInterval);
                setDetectionInterval(null);
            }
        }
    }, 
    // eslint-disable-next-line 
    [model, detectionInterval, sentryMode]);

    function predictWebcam() {
        timeTicks++;
        if (timeTicks >= 25) {
            timeTicks = 0;
            objectsDetected.clear();
        }

        if (!stream || !video) {
            clearInterval(detectionInterval);
            setDetectionInterval(null);
            return;
        }
        //const video = webcamRef.current.video;
        /*
        const w = video.videoWidth;
		const h = video.videoHeight;
		var canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		const ctx = canvas.getContext('2d');
		ctx.drawImage(video, 0, 0, w, h);
        */
        
        // Now let's start classifying a frame in the stream.
        model.detect(video).then(function (predictions) {
            // Remove any highlighting we did previous frame.
            if (liveView.current) {
                for (let i = 0; i < children.length; i++) {
                    liveView.current.removeChild(children[i]);
                }
            }
            children.splice(0);

            let personDetected = false;
            // Now lets loop through predictions and draw them to the live view if
            // they have a high confidence score.
            //let msg = null;
            for (let n = 0; n < predictions.length; n++) {
                // If we are over 66% sure we are sure we classified it right, draw it!
                if (predictions[n].score > 0.66) {
                    const p = document.createElement('p');
                    p.innerText = predictions[n].class + ' - with '
                        + Math.round(parseFloat(predictions[n].score) * 100)
                        + '% confidence.';
                    p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
                        + (predictions[n].bbox[1] - 10) + 'px; width: '
                        + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

                    const highlighter = document.createElement('div');
                    highlighter.setAttribute('class', 'highlighter');
                    highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
                        + predictions[n].bbox[1] + 'px; width: '
                        + predictions[n].bbox[2] + 'px; height: '
                        + predictions[n].bbox[3] + 'px;';

                    liveView.current.appendChild(highlighter);
                    liveView.current.appendChild(p);
                    children.push(highlighter);
                    children.push(p);

                    const classDetected = predictions[n].class;
                    //if (msg == null) {
                    //    msg = classDetected;
                    //}
                    //else {
                    //    msg += " " + classDetected;
                    //}

                    if (classDetected === "person") {
                        personDetected = true;
                    }
                }
            }

            if (personDetected) {
                if (personDetectedDuration > 0) {
                    if (!aiCamRecording) {
                        aiCamRecording = true;
                        handleStartCaptureClick();
                    }
                }
                else {
                    if (aiCamRecording) {
                        aiCamRecording = false;
                        handleStopCaptureClick();
                    }
                }
                personDetectedDuration += 200;
                if (personDetectedDuration === 5000) {
                    setObjectToSpeakOut("이 차는 경계 중입니다. 영상이 촬영되고 있습니다.");
                    setTimeout(() => {
                        setObjectToSpeakOut(null);
                        personDetectedDuration = 0;
                        handleStopCaptureClick();
                        aiCamRecording = false;
                    }, 10000);
                    setTimeout(() => {
                        saveAiCam();
                    }, 10100);
                }
            }
            else {
                if (personDetectedDuration > 0) {
                    personDetectedDuration -= 200;   
                }
            }

            //if (msg != null && objectsDetected.size === 0) {
            //    objectsDetected.set(msg, msg);
            //    setObjectToSpeakOut(msg);
            //    setTimeout(() => { 
            //        setObjectToSpeakOut(null);
            //    }, 4500);
            //}

            // Call this function again to keep predicting when the browser is ready.
            //window.requestAnimationFrame(predictWebcam);
        });
    }

    function saveAiCam() {
        if (aiCamRecordedChunks.length) {
            const blob = new Blob(aiCamRecordedChunks, {
                //type: "video/webm"
                type: "video/mp4"
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            const date = new Date().toLocaleDateString();
            const time = new Date().toLocaleTimeString();
            a.download = "vid_ai_" + date + "_" + time + ".mp4";
            a.click();
            window.URL.revokeObjectURL(url);
            setRecordedChunks([]);
        }
    }

    return(
        <StyledDiv appLayout={appLayout} >
            {active &&
            <div className="camView" ref={liveView}>
                <VideoCall 
                    setStream={setStream}
                    setVideo={setVideo}
                />
                {/*<Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpg"
                    videoConstraints={videoConstraints}
                    imageSmoothing={true}
                    //mirrored={true}
                    controls={true}
                    width={appLayout.carSideWidth === 0 ? 720 : 640}
                    height={appLayout.carSideWidth === 0 ? 540 : 480}
                />*/}
                {objectToSpeakOut &&
			    <div style={{display: "none"}}>
				    <Speak>
					    <p>{objectToSpeakOut}</p>
				    </Speak>
			    </div>
			    }
                {stream && video &&
                    <div className="control-buttons">
                        <TabsSelector tabClass={"tabs2"}>
                            <li onClick={() => setSentryMode(false)} className="active">Camera</li>
                            <li onClick={() => setSentryMode(true)}>Sentry</li>
                        </TabsSelector>

                        {!sentryMode &&
                            <>
                                <button onClick={capture} className="btn-deco">Capture photo</button>
                                {capturing ?
                                    (
                                        <button onClick={handleStopCaptureClick} className="btn-deco">Stop recording</button>
                                    ) :
                                    (
                                        <button onClick={handleStartCaptureClick} className="btn-deco">Start recording</button>
                                    )
                                }
                                {imgSrc && (
                                    <button onClick={handleImgDownload} className="btn-deco">Download</button>
                                )}
                                {!imgSrc && recordedChunks.length > 0 && (
                                    <button onClick={handleDownload} className="btn-deco">Download</button>
                                )}
                            </>
                        }
                    </div>
                }
            </div>
            }
        </StyledDiv>
    );
};

export default Dashcam;

const StyledDiv = styled.div`
    background: #eeeeee;
    color: #6f6f6f;
    height: ${(props) => props.appLayout.appExpandHeight}px;
    width: "100%";
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .control-buttons {
        position: absolute;
        z-index: 10;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 52px;
        display: flex;
        flex-direction: row;
        gap: 32px;
        padding: 0px 32px;
        
        .btn-deco {
            border: 1px solid #6F6F6F;
            //padding: 6px 6px;
            background-color: gray;
            border-radius: 8px;
            color: white;
            text-transform: uppercase;
            font-size: 1.0rem;
            width: 200px;
            height: 36px;
        }
    }

    .removed {
        display: none;
    }
      
    .invisible {
        opacity: 0.2;
    }
      
    .camView {
        width: 1280px;
        height: 720px;
        position: relative;
    }
      
    .camView p {
        position: absolute;
        padding: 5px;
        background-color: rgba(255, 111, 0, 0.85);
        color: #FFF;
        border: 1px dashed rgba(255, 255, 255, 0.7);
        z-index: 2;
        font-size: 12px;
    }
      
    .highlighter {
        background: rgba(0, 255, 0, 0.25);
        border: 1px dashed #fff;
        z-index: 1;
        position: absolute;
    }
`;
