import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!room.trim()) {
      alert("Please enter room id");
      return;
    }

    navigate(`/room/${room}`);
  };

  return (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        background: "white",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        textAlign: "center",
        width: "320px",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Join Video Call</h2>

      <input
        type="text"
        placeholder="Enter room id"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleJoin}>Join</button>
      </div>
    </div>
  </div>
);


export default Lobby;
