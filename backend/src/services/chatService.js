import prisma from '../lib/prisma.js';

class ChatService {
  async getConversations(userId) {
    return await prisma.conversation.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { participantId: userId }
        ]
      },
      include: {
        creator: {
          select: { id: true, username: true, name: true, avatarUrl: true }
        },
        participant: {
          select: { id: true, username: true, name: true, avatarUrl: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getMessages(conversationId) {
    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });
  }

  async createConversation(creatorId, participantId) {
    // Ensure small ID comes first to keep it unique regardless of who starts
    const [id1, id2] = [creatorId, participantId].sort();

    let conversation = await prisma.conversation.findUnique({
      where: {
        creatorId_participantId: {
          creatorId: id1,
          participantId: id2
        }
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          creatorId: id1,
          participantId: id2
        }
      });
    }

    return conversation;
  }

  async saveMessage(conversationId, senderId, text) {
    const message = await prisma.message.create({
      data: { conversationId, senderId, text }
    });

    // Update conversation updatedAt timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    return message;
  }

  async getConversation(id) {
    return await prisma.conversation.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, username: true, name: true, avatarUrl: true }
        },
        participant: {
          select: { id: true, username: true, name: true, avatarUrl: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  }
}

export default new ChatService();
