const express = require('express');
const { Server } = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // temporary, for testing
    methods: ["GET", "POST"]
  }
});

// WebRTC / Socket.io logic
io.on("connection", (socket) => {
  socket.on("room:join", ({ email, room }) => {
    socket.join(room);
    socket.to(room).emit("user:joined", { email, id: socket.id });
    socket.emit("room:join", { email, room });
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, answer }) => {
    io.to(to).emit("call:accepted", { answer });
  });

  socket.on("ice:candidate", ({ to, candidate }) => {
    io.to(to).emit("ice:candidate", { candidate });
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
