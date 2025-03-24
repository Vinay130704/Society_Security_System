const { Server } = require("socket.io");

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialized!");
  }
  return io;
}

module.exports = { initializeSocket, getIO };
