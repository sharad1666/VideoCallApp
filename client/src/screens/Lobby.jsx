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
        justifyContent: "center",
        alignItems: "center",
        background: "#0b0b0b",
      }}
    >
      <div
        style={{
          background: "#111",
          padding: "40px",
          borderRadius: "16px",
          width: "340px",
          boxShadow: "0 0 30px rgba(34,197,94,0.15)",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#22c55e", marginBottom: "10px" }}>
          Join Video Call
        </h2>

        <p style={{ color: "#9ca3af", marginBottom: "25px" }}>
          Enter a room ID
        </p>

        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Room ID"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "15px",
          }}
        />

        <button
          onClick={handleJoin}
          style={{
            marginTop: "22px",
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            background: "#22c55e",
            color: "#000",
            fontSize: "16px",
          }}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default Lobby;
