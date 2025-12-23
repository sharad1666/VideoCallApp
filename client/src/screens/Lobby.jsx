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
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Join Video Call</h2>

      <input
        type="text"
        placeholder="Enter room id"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />

      <br />
      <br />

      <button onClick={handleJoin}>Join</button>
    </div>
  );
};

export default Lobby;
