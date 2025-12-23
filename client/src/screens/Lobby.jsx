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
        background: "linear-gradient(135deg, #2563eb, #1e3a8a)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "40px 30px",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          textAlign: "center",
          width: "100%",
          maxWidth: "360px",
        }}
      >
        <h2 style={{ marginBottom: "10px", color: "#111827" }}>
          Join Video Call
        </h2>

        <p style={{ marginBottom: "25px", color: "#6b7280" }}>
          Enter a room ID to start or join a call
        </p>

        <input
          type="text"
          placeholder="Room ID"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            outline: "none",
          }}
        />

        <button
          onClick={handleJoin}
          style={{
            marginTop: "22px",
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            borderRadius: "8px",
            background: "#2563eb",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Join
        </button>
      </div>
    </div>
  );
};

export default Lobby;
