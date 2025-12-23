import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import peer from "../service/peer";

const RoomPage = () => {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStarted, setCallStarted] = useState(false);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // ---------------- USER JOIN ----------------
  const handleUserJoined = useCallback(({ id }) => {
    setRemoteSocketId(id);
  }, []);

  // ---------------- CALL USER (CALLER) ----------------
  const handleCallUser = useCallback(async () => {
    if (!remoteSocketId) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setMyStream(stream);
    setCallStarted(true);

    stream.getTracks().forEach((track) =>
      peer.peer.addTrack(track, stream)
    );

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  // ---------------- INCOMING CALL (CALLEE) ----------------
  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setMyStream(stream);
      setCallStarted(true);

      stream.getTracks().forEach((track) =>
        peer.peer.addTrack(track, stream)
      );

      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, answer });
    },
    [socket]
  );

  // ---------------- CALL ACCEPTED ----------------
  const handleCallAccepted = useCallback(({ answer }) => {
    peer.setRemoteAnswer(answer);
    setCallStarted(true);
  }, []);

  // ---------------- WEBRTC EVENTS ----------------
  useEffect(() => {
    peer.peer.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
  }, []);

  useEffect(() => {
    peer.peer.onicecandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        socket.emit("ice:candidate", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };
  }, [remoteSocketId, socket]);

  useEffect(() => {
    socket.on("ice:candidate", ({ candidate }) => {
      if (peer.peer.remoteDescription) {
        peer.peer.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => socket.off("ice:candidate");
  }, [socket]);

  // ---------------- SOCKET LISTENERS ----------------
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

  // ---------------- VIDEO REF BINDING ----------------
  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ---------------- CONTROLS ----------------
  const toggleMic = () => {
    myStream?.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMicOn(track.enabled);
    });
  };

  const toggleCamera = () => {
    myStream?.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsCameraOn(track.enabled);
    });
  };

  const startScreenShare = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    const screenTrack = screenStream.getVideoTracks()[0];
    peer.replaceVideoTrack(screenTrack);

    screenTrack.onended = () => {
      peer.replaceVideoTrack(myStream.getVideoTracks()[0]);
    };
  };

  const endCall = () => {
    myStream?.getTracks().forEach((track) => track.stop());
    peer.closePeer();

    setMyStream(null);
    setRemoteStream(null);
    setCallStarted(false);
    setRemoteSocketId(null);

    window.location.href = "/";
  };

  // ---------------- CLEANUP ----------------
  useEffect(() => {
    return () => {
      peer.closePeer();
      myStream?.getTracks().forEach((track) => track.stop());
    };
  }, [myStream]);

  // ---------------- UI ----------------
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Room</h1>
      <h3>{callStarted ? "In Call" : "Waiting for user..."}</h3>

      {remoteSocketId && !callStarted && (
        <button onClick={handleCallUser}>📞 Call</button>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          flexWrap: "wrap",
          marginTop: 20,
        }}
      >
        {myStream && (
          <video
            ref={myVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "45%",
              maxWidth: 400,
              borderRadius: 10,
              background: "black",
            }}
          />
        )}

        {remoteStream && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: "45%",
              maxWidth: 400,
              borderRadius: 10,
              background: "black",
            }}
          />
        )}
      </div>

      {callStarted && (
        <div style={{ marginTop: 20 }}>
          <button onClick={toggleMic}>
            {isMicOn ? "🎤 Mute" : "🔇 Unmute"}
          </button>
          <button onClick={toggleCamera}>
            {isCameraOn ? "📷 Camera Off" : "📷 Camera On"}
          </button>
          <button onClick={startScreenShare}>🖥 Share</button>
          <button
            onClick={endCall}
            style={{ background: "red", color: "white" }}
          >
            ❌ End
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomPage;
