import { Server } from 'socket.io';
import chatService from '../services/chatService.js';
import prisma from '../lib/prisma.js';
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
      socket.join(userId); // Join personal room for global notifications
      console.log(`User ${userId} joined their personal room`);
    }

    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.id} joined conversation: ${conversationId}`);
    });

    socket.on('send_message', async ({ conversationId, senderId, text }) => {
      try {
        const message = await chatService.saveMessage(conversationId, senderId, text);
        
        // Fetch sender info for better notification
        const sender = await prisma.user.findUnique({
          where: { id: senderId },
          select: { username: true, name: true, avatarUrl: true }
        });

        // Broadcast to the specific conversation room
        const messageWithSender = {
          ...message,
          senderName: sender?.name || sender?.username || 'Someone'
        };

        io.to(conversationId).emit('receive_message', messageWithSender);

        // Also notify the recipient globally if they aren't in the room
        const conversation = await chatService.getConversation(conversationId);
        if (conversation) {
          const recipientId = conversation.creatorId === senderId ? conversation.participantId : conversation.creatorId;
          io.to(recipientId).emit('receive_message', messageWithSender);
        }
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
