const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Adjust this for production
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only');
      socket.user = decoded; // Contains { user_id, email, role }
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (${socket.user.role}) - Socket ID: ${socket.id}`);

    // Join a general room based on role
    socket.join(socket.user.role);
    // Hospital operators also get their hospital's notifications (Module 18).
    if (socket.user.hospital_id) socket.join(`hospital_${socket.user.hospital_id}`);
    
    // Allow users to join request-specific rooms
    // E.g., for model training lifecycle
    socket.on('join_request_room', (requestId) => {
      // In a real implementation, we might verify if the user is authorized to join this request
      const roomName = `request_${requestId}`;
      socket.join(roomName);
      console.log(`User ${socket.user.email} joined room ${roomName}`);
    });

    socket.on('leave_request_room', (requestId) => {
      const roomName = `request_${requestId}`;
      socket.leave(roomName);
      console.log(`User ${socket.user.email} left room ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.email}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initSocket,
  getIo
};
