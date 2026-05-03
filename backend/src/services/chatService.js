import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';

class ChatService {
  async getConversations(userId) {
    return await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId }
        }
      },
      include: {
        participants: {
          select: { 
            id: true, 
            username: true, 
            name: true, 
            avatarUrl: true, 
            isOnline: true, 
            lastSeen: true 
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            seenBy: {
              select: { id: true }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getMessages(conversationId, limit = 50, cursor = null) {
    const query = {
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: {
        sender: {
          select: { id: true, username: true, name: true, avatarUrl: true }
        },
        seenBy: {
          select: { id: true }
        }
      }
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1;
    }

    return await prisma.message.findMany(query);
  }

  async createConversation(participantIds, type = 'PRIVATE') {
    if (!participantIds || participantIds.length < 2) {
      throw new ApiError(400, 'A conversation must have at least 2 participants');
    }

    // For PRIVATE chats, check if one already exists with exactly these participants
    if (type === 'PRIVATE' && participantIds.length === 2) {
      const existing = await prisma.conversation.findFirst({
        where: {
          type: 'PRIVATE',
          AND: [
            { participants: { some: { id: participantIds[0] } } },
            { participants: { some: { id: participantIds[1] } } }
          ],
          // Ensure it ONLY has these two (optional but good for strict private chats)
        },
        include: {
          participants: true
        }
      });
      
      // Secondary check to ensure ONLY these two are participants
      if (existing && existing.participants.length === 2) {
        return existing;
      }
    }

    return await prisma.conversation.create({
      data: {
        type,
        participants: {
          connect: participantIds.map(id => ({ id }))
        }
      },
      include: {
        participants: {
          select: { id: true, username: true, name: true, avatarUrl: true }
        }
      }
    });
  }

  async saveMessage(conversationId, senderId, text, attachments = []) {
    if (!conversationId || !senderId || (!text && attachments.length === 0)) {
      throw new ApiError(400, 'Missing message data');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        text: text || '',
        attachments,
        seenBy: {
          connect: { id: senderId } // Sender has seen their own message
        }
      },
      include: {
        sender: {
          select: { id: true, username: true, name: true, avatarUrl: true }
        },
        seenBy: {
          select: { id: true }
        }
      }
    });

    // Update conversation updatedAt timestamp and lastMessageId
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { 
        updatedAt: new Date(),
        lastMessageId: message.id
      }
    });

    return message;
  }

  async getConversation(id) {
    return await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: {
          select: { 
            id: true, 
            username: true, 
            name: true, 
            avatarUrl: true,
            isOnline: true,
            lastSeen: true
          }
        }
      }
    });
  }

  async markAsSeen(messageIds, userId) {
    // Optimization: Bulk update seen status
    return await Promise.all(messageIds.map(id => 
      prisma.message.update({
        where: { id },
        data: {
          seenBy: {
            connect: { id: userId }
          }
        }
      })
    ));
  }

  async updateUserStatus(userId, isOnline) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline,
        lastSeen: new Date()
      }
    });
  }
}

export default new ChatService();
