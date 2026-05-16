import { Server } from 'socket.io';
import chatService from '../services/chatService.js';
import prisma from '../lib/prisma.js';
import { verifyToken } from '../utils/jwt.js';

const onlineUsers = new Map(); // userId -> Set(socketIds)

const initSocket = (server) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://tracker-kohl-seven.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ].map(url => url?.endsWith('/') ? url.slice(0, -1) : url).filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
  });

  io.use(async (socket, next) => {
    console.log(`[Socket] Connection attempt: ${socket.id}`);
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        console.warn(`[Socket] Auth failed: No token for ${socket.id}`);
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        console.warn(`[Socket] Auth failed: Invalid token for ${socket.id}`);
        return next(new Error('Authentication error: Invalid token'));
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, name: true }
      });

      if (!user) {
        console.warn(`[Socket] Auth failed: User not found for ${socket.id}`);
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      socket.userId = user.id;
      console.log(`[Socket] Auth success: ${user.username} (${socket.id})`);
      next();
    } catch (error) {
      console.error(`[Socket] Middleware error for ${socket.id}:`, error.message);
      next(new Error('Authentication error: ' + error.message));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`[Socket] Client fully connected: ${socket.id} (User: ${socket.userId})`);
    const userId = socket.userId;
    
    // Add to online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
      await chatService.updateUserStatus(userId, true);
    }
    onlineUsers.get(userId).add(socket.id);
    
    // Broadcast online users list
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));

    socket.join(userId);

    socket.on('joinChat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${userId} joined chat: ${chatId}`);
    });

    socket.on('leaveChat', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${userId} left chat: ${chatId}`);
    });

    socket.on('sendMessage', async ({ chatId, text, attachments = [] }) => {
      try {
        if (!text?.trim() && attachments.length === 0) return;

        // Save to DB FIRST
        const message = await chatService.saveMessage(chatId, userId, text, attachments);
        
        // Emit to the chat room (includes sender if they joined)
        io.to(chatId).emit('receiveMessage', message);

        // Notify participants who might not be in the room (for notifications)
        // We use individual rooms (userId) for this
        const chat = await chatService.getConversation(chatId);
        if (chat) {
          chat.participants.forEach(participant => {
            if (participant.id !== userId) {
              // Check if participant is in the room. If not, emit to their private room
              const socketsInRoom = io.sockets.adapter.rooms.get(chatId);
              const isParticipantInRoom = Array.from(onlineUsers.get(participant.id) || []).some(sid => socketsInRoom?.has(sid));
              
              if (!isParticipantInRoom) {
                io.to(participant.id).emit('receiveMessage', message);
              }
            }
          });
        }
      } catch (error) {
        console.error('[Socket] Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('deleteMessage', async ({ chatId, messageId }) => {
      try {
        // Implement deletion logic in service if needed, or just broadcast
        // For now, let's just broadcast the deletion event
        socket.to(chatId).emit('messageDeleted', { chatId, messageId });
      } catch (error) {
        console.error('[Socket] Error deleting message:', error);
      }
    });

    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('typing', { userId, chatId, isTyping });
    });

    socket.on('markSeen', async ({ chatId, messageIds }) => {
      try {
        await chatService.markAsSeen(messageIds, userId);
        socket.to(chatId).emit('messageSeen', { chatId, messageIds, userId });
      } catch (error) {
        console.error('[Socket] Error marking messages as seen:', error);
      }
    });

    socket.on('disconnect', async () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          await chatService.updateUserStatus(userId, false);
          io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        }
      }
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};

export default initSocket;
