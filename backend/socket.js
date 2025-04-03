const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket is connected'); // Log when a socket connects

    // Handle authentication or other events
    socket.on('authenticate', (token) => {
      // Authentication logic here
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected'); // Log when a socket disconnects
    });
  });

  return io;
};


// io.on('connection', (socket) => {
//   // Security/admin joins emergency room
//   socket.on('joinEmergencyRoom', () => {
//     socket.join('emergencyRoom');
//   });

//   // Resident joins their personal room
//   socket.on('joinUserRoom', (userId) => {
//     socket.join(`user_${userId}`);
//   });
// });


const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO
};
