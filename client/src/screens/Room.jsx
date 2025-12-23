import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const Room = () => {
  const { roomId } = useParams();
  const socket = useSocket();

  const [remoteId, setRemoteId] = useState(null);
  const [inCall, setInCall] = useState(false);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const pc = useRef(
    new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
      ],
    })
  );

  // -------- JOIN ROOM --------
  useEffect(() => {
    if (!socket) return;
    socket.emit("room:join", { room: roomId });

    socket.on("user:joined", ({ id }) => {
      setRemoteId(id);
    });

    return () => socket.off("user:joined");
  }, [socket, roomId]);

  // -------- ICE + TRACK --------
  useEffect(() => {
    const peer = pc.current;

    peer.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    peer.onicecandidate = (e) => {
      if (e.candidate && remoteId) {
        socket.emit("ice:candidate", {
          to: remoteId,
          candidate: e.candidate,
        });
      }
    };
  }, [remoteId, socket]);

  useEffect(() => {
    socket.on("ice:candidate", ({ candidate }) => {
      pc.current.addIceCandidate(candidate);
    });

    return () => socket.off("ice:candidate");
  }, [socket]);

  // -------- START CALL --------
  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocalStream(stream);
    localVideoRef.current.srcObject = stream;

    stream.getTracks().forEach((t) => pc.current.addTrack(t, stream));

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socket.emit("user:call", { to: remoteId, offer });
    setInCall(true);
  };

  // -------- INCOMING CALL --------
  useEffect(() => {
    socket.on("incoming:call", async ({ from, offer }) => {
      setRemoteId(from);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      localVideoRef.current.srcObject = stream;

      stream.getTracks().forEach((t) => pc.current.addTrack(t, stream));

      await pc.current.setRemoteDescription(offer);
      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);

      socket.emit("call:accepted", { to: from, answer });
      setInCall(true);
    });

    return () => socket.off("incoming:call");
  }, [socket]);

  // -------- CALL ACCEPTED --------
  useEffect(() => {
    socket.on("call:accepted", async ({ answer }) => {
      await pc.current.setRemoteDescription(answer);
    });

    return () => socket.off("call:accepted");
  }, [socket]);

  // -------- CONTROLS --------
  const toggleMic = () => {
    localStream.getAudioTracks()[0].enabled =
      !localStream.getAudioTracks()[0].enabled;
  };

  const toggleCam = () => {
    localStream.getVideoTracks()[0].enabled =
      !localStream.getVideoTracks()[0].enabled;
  };

  const endCall = () => {
    localStream.getTracks().forEach((t) => t.stop());
    pc.current.close();
    window.location.href = "/";
  };

  // -------- UI --------
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Room: {roomId}</h2>

      {remoteId && !inCall && (
        <button onClick={startCall}>📞 Start Call</button>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        <video ref={localVideoRef} autoPlay muted width="300" />
        <video ref={remoteVideoRef} autoPlay width="300" />
      </div>

      {inCall && (
        <div>
          <button onClick={toggleMic}>🎤</button>
          <button onClick={toggleCam}>📷</button>
          <button onClick={endCall}>❌</button>
        </div>
      )}
    </div>
  );
};

export default Room;
