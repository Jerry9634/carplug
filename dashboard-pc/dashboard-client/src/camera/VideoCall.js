import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import { getServerIP } from "../vplug/WsReq";

var WEBRTC_PORT = getServerIP() + ":3500";
const callerId = "27099634"; //Math.floor(100000 + Math.random() * 900000).toString();
var socket;
var peerConnection;

const VideoCall = ({ setStream, setVideo }) => {

  const remoteVideoRef = useRef(null);

  const [type, setType] = useState('JOIN');

  const otherUserId = useRef(null);

  let remoteRTCMessage = useRef(null);

  useEffect(() => {
    peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
        {
          urls: 'stun:stun1.l.google.com:19302',
        },
        {
          urls: 'stun:stun2.l.google.com:19302',
        },
      ],
    });

    WEBRTC_PORT = getServerIP() + ":3500";
    socket = io(WEBRTC_PORT, {
      transports: ['websocket'],
      query: {
        callerId,
      },
    });

    socket.on('newCall', data => {
      remoteRTCMessage.current = data.rtcMessage;
      otherUserId.current = data.callerId;
      setType('INCOMING_CALL');
    });

    socket.on('callAnswered', data => {
      remoteRTCMessage.current = data.rtcMessage;
      peerConnection.setRemoteDescription(
        new RTCSessionDescription(remoteRTCMessage.current),
      );
      setType('WEBRTC_ROOM');
    });

    socket.on('ICEcandidate', data => {
      let message = data.rtcMessage;

      if (peerConnection) {
        peerConnection.addIceCandidate(
          new RTCIceCandidate({
            candidate: message.candidate,
            sdpMid: message.id,
            sdpMLineIndex: message.label,
          }),
        )
          .then(data => {
            console.log('SUCCESS');
          })
          .catch(err => {
            console.log('Error', err);
          });
      }
    });

    // Got stream!
    peerConnection.addEventListener('track', gotRemoteStream);

    // peerConnection.onaddstream = event => {
    //   console.log("onaddstream: ");
    //   console.log(event);
    // };

    // Setup ice handling
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        sendICEcandidate({
          calleeId: otherUserId.current,
          rtcMessage: {
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate,
          },
        });
      } else {
        console.log('End of candidates.');
      }
    };

    return () => {
      socket.off('newCall');
      socket.off('callAnswered');
      socket.off('ICEcandidate');
      setStream(null);
    };
  }, 
  // eslint-disable-next-line
  []);

  function gotRemoteStream(e) {
    console.log("gotRemoteStream: ");
    console.log(e);
    console.log('pc2 received remote stream');
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = e.streams[0];
      setStream(e.streams[0]);
      setVideo(remoteVideoRef.current);
    }
  }

//   useEffect(() => {
//     InCallManager.start();
//     InCallManager.setKeepScreenOn(true);
//     InCallManager.setForceSpeakerphoneOn(true);

//     return () => {
//       InCallManager.stop();
//     };
//   }, []);

  function sendICEcandidate(data) {
    socket.emit('ICEcandidate', data);
  }

  // eslint-disable-next-line
  async function processCall() {
    const sessionDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(sessionDescription);
    sendCall({
      calleeId: otherUserId.current,
      rtcMessage: sessionDescription,
    });
  }

  async function processAccept() {
    peerConnection.setRemoteDescription(
      new RTCSessionDescription(remoteRTCMessage.current),
    );
    const sessionDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(sessionDescription);
    answerCall({
      callerId: otherUserId.current,
      rtcMessage: sessionDescription,
    });
  }

  function answerCall(data) {
    socket.emit('answerCall', data);
  }

  function sendCall(data) {
    socket.emit('call', data);

  }

  useEffect(() => {
    if (type === "INCOMING_CALL") {
      processAccept();
      setType('WEBRTC_ROOM');
    }
  }, 
  // eslint-disable-next-line
  [type]);

  return (
    <>
      <video
        id="remotevideo"
        style={{
          width: 1280,
          height: 720,
          backgroundColor: "black",
        }}
        ref={remoteVideoRef}
        autoPlay
      />
    </>
  );
};

export default VideoCall;