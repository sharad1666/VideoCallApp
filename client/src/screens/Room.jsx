import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";

const Room = () => {
  const { roomId } = useParams();
  const socket = useSocket();

  const [remoteId, setRemoteId] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [status, setStatus] = useState("");

  const [localStream, setLocalStream] = useState(null);

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

  // JOIN ROOM
  useEffect(() => {
    if (!socket) return;
    socket.emit("room:join", { room: roomId });

    socket.on("user:joined", ({ id }) => {
      setRemoteId(id);
      setStatus("User joined");
    });

    socket.on("disconnect", () => {
      setStatus("User disconnected");
      setInCall(false);
    });

    return () => socket.off();
  }, [socket, roomId]);

  // ICE + TRACK
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
      setInCall(true);
    });

    socket.on("incoming:call", async ({ from, offer }) => {
      setRemoteId(from);
      setStatus("Incoming call...");

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

    return () => socket.off();
  }, [socket]);

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
    setStatus("Calling...");
  };

  const toggleMic = () => {
    const track = localStream.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  };

  const toggleCam = () => {
    const track = localStream.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setCamOff(!track.enabled);
  };

  const endCall = () => {
    localStream?.getTracks().forEach((t) => t.stop());
    pc.current.close();
    setStatus("Call ended");
    setInCall(false);
    setTimeout(() => (window.location.href = "/"), 1200);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", padding: 20 }}>
      <h2 style={{ textAlign: "center", color: "#22c55e" }}>
        Room: {roomId}
      </h2>

      {status && (
        <p style={{ textAlign: "center", color: "#9ca3af" }}>{status}</p>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginTop: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p>You {muted && "🔇"} {camOff && "📷❌"}</p>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ width: 300, borderRadius: 12, background: "#000" }}
          />
        </div>

        <div>
          <p>Remote</p>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: 300, borderRadius: 12, background: "#000" }}
          />
        </div>
      </div>

      {!inCall && remoteId && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            onClick={startCall}
            style={{ background: "#22c55e", color: "#000", padding: "10px 20px" }}
          >
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
            padding: "14px 20px",
            borderRadius: "14px",
            display: "flex",
            gap: 12,
            boxShadow: "0 0 20px rgba(34,197,94,0.2)",
          }}
        >
          <button onClick={toggleMic} style={{ background: muted ? "#ef4444" : "#22c55e" }}>
            🎤
          </button>
          <button onClick={toggleCam} style={{ background: camOff ? "#ef4444" : "#22c55e" }}>
            📷
          </button>
          <button onClick={endCall} style={{ background: "#ef4444" }}>
            ❌
          </button>
        </div>
      )}
    </div>
  );
};

export default Room;
