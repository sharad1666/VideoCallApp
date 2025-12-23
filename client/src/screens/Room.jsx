import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import peer from "../service/peer";

const RoomPage = () => {
  const socket = useSocket();

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // -------------------- SOCKET EVENTS --------------------

  const handleUserJoined = useCallback(({ id }) => {
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setMyStream(stream);
    stream.getTracks().forEach((track) => peer.peer.addTrack(track, stream));

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setMyStream(stream);
      stream.getTracks().forEach((track) => peer.peer.addTrack(track, stream));

      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, answer });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(({ answer }) => {
    peer.setRemoteAnswer(answer);
  }, []);

  // -------------------- WEBRTC HANDLERS --------------------

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

  // -------------------- VIDEO REF BINDING --------------------

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

  // -------------------- CONTROLS --------------------

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
    const sender = peer.peer
      .getSenders()
      .find((s) => s.track?.kind === "video");

    if (sender) sender.replaceTrack(screenTrack);

    screenTrack.onended = () => {
      sender.replaceTrack(myStream.getVideoTracks()[0]);
    };
  };

  const handleEndCall = () => {
    myStream?.getTracks().forEach((track) => track.stop());
    peer.peer.close();
    window.location.href = "/";
  };

  // -------------------- SOCKET LISTENERS --------------------

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

  // -------------------- CLEANUP --------------------

  useEffect(() => {
    return () => {
      peer.peer.close();
      myStream?.getTracks().forEach((track) => track.stop());
    };
  }, [myStream]);

  // -------------------- UI --------------------

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "Waiting for user..."}</h4>

      {remoteSocketId && !myStream && (
        <button onClick={handleCallUser}>📞 Call</button>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        {myStream && (
          <video
            ref={myVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: "45%", borderRadius: 10 }}
          />
        )}
        {remoteStream && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: "45%", borderRadius: 10 }}
          />
        )}
      </div>

      {myStream && (
        <div style={{ marginTop: 20 }}>
          <button onClick={toggleMic}>
            {isMicOn ? "🎤 Mute" : "🔇 Unmute"}
          </button>
          <button onClick={toggleCamera}>
            {isCameraOn ? "📷 Camera Off" : "📷 Camera On"}
          </button>
          <button onClick={startScreenShare}>🖥 Share Screen</button>
          <button
            onClick={handleEndCall}
            style={{ background: "red", color: "white" }}
          >
            ❌ End Call
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomPage;
