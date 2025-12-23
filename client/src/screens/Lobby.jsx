import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Lobby = () => {
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!room) {
      alert("Enter room ID");
      return;
    }
    navigate(`/room/${room}`);
  };

  return (
    <div style={{ textAlign: "center", marginTop: 100 }}>
      <h2>Join Video Call</h2>
      <input
        type="text"
        placeholder="Enter room id"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <br /><br />
      <button onClick={handleJoin}>🚪 Join</button>
    </div>
  );
};

export default Lobby;
