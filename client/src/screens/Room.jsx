import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import peerService from "../service/peer";

const Room = () => {
  const socket = useSocket();

  const [remoteId, setRemoteId] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [inCall, setInCall] = useState(false);

  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  // ---------- JOIN ROOM ----------
  useEffect(() => {
    socket.emit("room:join", { room: "test" });

    socket.on("user:joined", ({ id }) => {
      setRemoteId(id);
    });

    return () => {
      socket.off("user:joined");
    };
  }, [socket]);

  // ---------- ICE ----------
  useEffect(() => {
    const peer = peerService.getPeer();

    peer.onicecandidate = (e) => {
      if (e.candidate && remoteId) {
        socket.emit("ice:candidate", {
          to: remoteId,
          candidate: e.candidate,
        });
      }
    };

    peer.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
    };
  }, [remoteId, socket]);

  useEffect(() => {
    socket.on("ice:candidate", ({ candidate }) => {
      peerService.getPeer().addIceCandidate(candidate);
    });

    return () => socket.off("ice:candidate");
  }, [socket]);

  // ---------- CALL ----------
  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocalStream(stream);
    stream.getTracks().forEach((t) =>
      peerService.getPeer().addTrack(t, stream)
    );

    const offer = await peerService.createOffer();
    socket.emit("user:call", { to: remoteId, offer });

    setInCall(true);
  };

  socket.on("incoming:call", async ({ from, offer }) => {
    setRemoteId(from);

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocalStream(stream);
    stream.getTracks().forEach((t) =>
      peerService.getPeer().addTrack(t, stream)
    );

    const answer = await peerService.createAnswer(offer);
    socket.emit("call:accepted", { to: from, answer });

    setInCall(true);
  });

  socket.on("call:accepted", async ({ answer }) => {
    await peerService.setAnswer(answer);
    setInCall(true);
  });

  // ---------- VIDEO BIND ----------
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // ---------- CONTROLS ----------
  const toggleMic = () => {
    localStream.getAudioTracks()[0].enabled =
      !localStream.getAudioTracks()[0].enabled;
  };

  const toggleCamera = () => {
    localStream.getVideoTracks()[0].enabled =
      !localStream.getVideoTracks()[0].enabled;
  };

  const endCall = () => {
    localStream.getTracks().forEach((t) => t.stop());
    peerService.close();
    setInCall(false);
    setRemoteStream(null);
    setLocalStream(null);
  };

  // ---------- UI ----------
  return (
    <div style={{ textAlign: "center" }}>
      <h2>{inCall ? "In Call" : "Waiting..."}</h2>

      {!inCall && remoteId && (
        <button onClick={startCall}>📞 Start Call</button>
      )}

      <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
        {localStream && (
          <video ref={localVideoRef} autoPlay muted width="300" />
        )}
        {remoteStream && (
          <video ref={remoteVideoRef} autoPlay width="300" />
        )}
      </div>

      {inCall && (
        <div>
          <button onClick={toggleMic}>🎤</button>
          <button onClick={toggleCamera}>📷</button>
          <button onClick={endCall}>❌</button>
        </div>
      )}
    </div>
  );
};

export default Room;
