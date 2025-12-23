import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const Room = () => {
  const { roomId } = useParams();
  const socket = useSocket();

  const [remoteId, setRemoteId] = useState(null);
  const [inCall, setInCall] = useState(false);

  const [localStream, setLocalStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [remoteMuted, setRemoteMuted] = useState(false);

  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

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

  /* ---------------- JOIN ROOM ---------------- */
  useEffect(() => {
    if (!socket) return;
    socket.emit("room:join", { room: roomId });

    socket.on("user:joined", ({ id }) => setRemoteId(id));
    socket.on("media:state", ({ type, value }) => {
      if (type === "mic") setRemoteMuted(value);
    });

    return () => socket.off();
  }, [socket, roomId]);

  /* ---------------- ICE + TRACK ---------------- */
  useEffect(() => {
    pc.current.ontrack = (e) => {
      remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.current.onicecandidate = (e) => {
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

    socket.on("call:accepted", async ({ answer }) => {
      await pc.current.setRemoteDescription(answer);
      startTimer();
      setInCall(true);
    });

    socket.on("incoming:call", async ({ from, offer }) => {
      setRemoteId(from);
      const stream = await getMedia();
      await pc.current.setRemoteDescription(offer);

      const answer = await pc.current.createAnswer();
      await pc.current.setLocalDescription(answer);
      socket.emit("call:accepted", { to: from, answer });

      startTimer();
      setInCall(true);
    });

    return () => socket.off();
  }, [socket]);

  /* ---------------- MEDIA ---------------- */
  const getMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocalStream(stream);
    localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((t) => pc.current.addTrack(t, stream));
    return stream;
  };

  const startCall = async () => {
    await getMedia();
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    socket.emit("user:call", { to: remoteId, offer });
  };

  /* ---------------- TIMER ---------------- */
  const startTimer = () => {
    timerRef.current = setInterval(
      () => setSeconds((s) => s + 1),
      1000
    );
  };

  const formatTime = () =>
    `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
      seconds % 60
    ).padStart(2, "0")}`;

  /* ---------------- CONTROLS ---------------- */
  const toggleMic = () => {
    const track = localStream.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
    socket.emit("media:state", {
      to: remoteId,
      type: "mic",
      value: !track.enabled,
    });
  };

  const toggleCam = () => {
    const track = localStream.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setCamOff(!track.enabled);
  };

  const shareScreen = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const screenTrack = screenStream.getVideoTracks()[0];

    const sender = pc.current
      .getSenders()
      .find((s) => s.track.kind === "video");

    sender.replaceTrack(screenTrack);

    screenTrack.onended = () => {
      sender.replaceTrack(localStream.getVideoTracks()[0]);
    };
  };

  const endCall = () => {
    localStream?.getTracks().forEach((t) => t.stop());
    clearInterval(timerRef.current);
    pc.current.close();
    window.location.href = "/";
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", padding: 20 }}>
      <h2 style={{ textAlign: "center", color: "#22c55e" }}>
        Room: {roomId}
      </h2>

      {inCall && (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>
          ⏱ {formatTime()}
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
        <div>
          <p>You {muted && "🔇"} {camOff && "📷❌"}</p>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: 300,
              borderRadius: 12,
              boxShadow: muted ? "none" : "0 0 20px #22c55e",
            }}
          />
        </div>

        <div>
          <p>Remote {remoteMuted && "🔇"}</p>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: 300,
              borderRadius: 12,
              boxShadow: remoteMuted ? "none" : "0 0 20px #22c55e",
            }}
          />
        </div>
      </div>

      {!inCall && remoteId && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={startCall} style={{ background: "#22c55e" }}>
            Start Call
          </button>
        </div>
      )}

      {inCall && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#111",
            padding: 14,
            borderRadius: 14,
            display: "flex",
            gap: 10,
          }}
        >
          <button onClick={toggleMic}>{muted ? "🔇" : "🎤"}</button>
          <button onClick={toggleCam}>{camOff ? "📷❌" : "📷"}</button>
          <button onClick={shareScreen}>🖥</button>
          <button onClick={endCall} style={{ background: "#ef4444" }}>
            ❌
          </button>
        </div>
      )}
    </div>
  );
};

export default Room;
