import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import peer from "../service/peer";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // When someone joins
  const handleUserJoined = useCallback(({ id }) => setRemoteSocketId(id), []);

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

  useEffect(() => {
    peer.peer.ontrack = (event) => setRemoteStream(event.streams[0]);
  }, []);

  useEffect(() => {
    peer.peer.onicecandidate = (event) => {
      if (event.candidate && remoteSocketId) {
        socket.emit("ice:candidate", { to: remoteSocketId, candidate: event.candidate });
      }
    };
  }, [remoteSocketId, socket]);

  useEffect(() => {
    if (!socket) return;
    socket.on("ice:candidate", ({ candidate }) => {
      if (peer.peer.remoteDescription) peer.peer.addIceCandidate(new RTCIceCandidate(candidate));
    });
    return () => socket.off("ice:candidate");
  }, [socket]);

  useEffect(() => {
    if (myVideoRef.current && myStream) myVideoRef.current.srcObject = myStream;
  }, [myStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);
      stream.getTracks().forEach((track) => peer.peer.addTrack(track, stream));

      const answer = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, answer });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(({ answer }) => peer.setRemoteAnswer(answer), []);

  useEffect(() => {
    if (!socket) return;
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

  return (
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "Waiting for user..."}</h4>
      {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
      {myStream && <video ref={myVideoRef} autoPlay muted playsInline style={{ width: 300, height: 200 }} />}
      {remoteStream && <video ref={remoteVideoRef} autoPlay playsInline style={{ width: 300, height: 200 }} />}
    </div>
  );
};

export default RoomPage;
