import React, { useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import peerService from "../service/peer";

const ROOM_ID = "test-room"; // same for both users

const Room = () => {
  const socket = useSocket();

  const [joined, setJoined] = useState(false);
  const [remoteId, setRemoteId] = useState(null);
  const [inCall, setInCall] = useState(false);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // ---------------- JOIN ROOM ----------------
  const handleJoin = () => {
    socket.emit("room:join", { room: ROOM_ID });
    setJoined(true);
  };

  useEffect(() => {
    socket.on("user:joined", ({ id }) => {
      setRemoteId(id);
    });

    return () => socket.off("user:joined");
  }, [socket]);

  // ---------------- WEBRTC SETUP ----------------
  useEffect(() => {
    const peer = peerService.getPeer();

    peer.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
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
      peerService.getPeer().addIceCandidate(candidate);
    });

    return () => socket.off("ice:candidate");
  }, [socket]);

  // ---------------- START CALL (CALLER) ----------------
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

  // ---------------- INCOMING CALL (CALLEE) ----------------
  useEffect(() => {
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

    return () => socket.off("incoming:call");
  }, [socket]);

  // ---------------- CALL ACCEPTED ----------------
  useEffect(() => {
    socket.on("call:accepted", async ({ answer }) => {
      await peerService.setAnswer(answer);
      setInCall(true);
    });

    return () => socket.off("call:accepted");
  }, [socket]);

  // ---------------- VIDEO BIND ----------------
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

  // ---------------- END CALL ----------------
  const endCall = () => {
    localStream?.getTracks().forEach((t) => t.stop());
    peerService.close();

    setLocalStream(null);
    setRemoteStream(null);
    setInCall(false);
    setRemoteId(null);
  };

  // ---------------- UI ----------------
  return (
    <div style={{ textAlign: "center" }}>
      <h2>
        {!joined
          ? "Join the room"
          : inCall
          ? "In Call"
          : "Waiting for other user"}
      </h2>

      {!joined && <button onClick={handleJoin}>🚪 Join</button>}

      {joined && remoteId && !inCall && (
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

      {inCall && <button onClick={endCall}>❌ End Call</button>}
    </div>
  );
};

export default Room;
