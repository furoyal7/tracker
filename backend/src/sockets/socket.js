import { Server } from 'socket.io';
import chatService from '../services/chatService.js';
import { config } from '../config/env.js';

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: config.frontendUrl === '*' 
        ? true 
        : config.frontendUrl.split(',').map(url => url.trim()),
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Attach userId to socket if provided via auth handshake
    const userId = socket.handshake.auth.userId;
    if (userId) {
      socket.userId = userId;
    }

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined conversation: ${conversationId}`);
    });

    socket.on('send_message', async ({ conversationId, senderId, text }) => {
      try {
        const message = await chatService.saveMessage(conversationId, senderId, text);
        // Broadcast to everyone in the room
        io.to(conversationId).emit('receive_message', message);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export default initSocket;
