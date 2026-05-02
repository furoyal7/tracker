import { Server } from 'socket.io';
import chatService from '../services/chatService.js';
import prisma from '../lib/prisma.js';
import { config } from '../config/env.js';
import { verifyToken } from '../utils/jwt.js';

const initSocket = (server) => {
  const rawFrontendUrl = process.env.FRONTEND_URL || '';
  const frontendUrl = rawFrontendUrl.endsWith('/') ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl;
  
  const allowedOrigins = [
    frontendUrl,
    'https://tracker-kohl-seven.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ].filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(null, false); // Decline but don't crash
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
  });

  // Authentication Middleware for Sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        return next(new Error('Authentication error: Invalid token'));
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, name: true }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      socket.userId = user.id;
      next();
    } catch (error) {
      next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`User connected: ${userId} (${socket.id})`);

    // Join personal room for global events (new chat requests, etc.)
    socket.join(userId);

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined room: ${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${userId} left room: ${conversationId}`);
    });

    socket.on('send_message', async ({ conversationId, text }) => {
      try {
        if (!text?.trim()) return;

        const message = await chatService.saveMessage(conversationId, userId, text);
        
        const messageWithSender = {
          ...message,
          senderName: socket.user.name || socket.user.username || 'Someone'
        };

        // 1. Send to all users currently in the conversation room
        io.to(conversationId).emit('receive_message', messageWithSender);

        // 2. Notify the other participant globally (for notifications/list updates)
        const conversation = await chatService.getConversation(conversationId);
        if (conversation) {
          const recipientId = conversation.creatorId === userId ? conversation.participantId : conversation.creatorId;
          // Only send if recipient isn't already in the specific room (optional optimization)
          socket.to(recipientId).emit('receive_message', messageWithSender);
        }
      } catch (error) {
        console.error('[Socket] Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ conversationId }) => {
      socket.to(conversationId).emit('user_typing', { userId, conversationId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};

export default initSocket;
