import prisma from '../lib/prisma.js';

class ChatService {
  async getConversations(merchantId) {
    return await prisma.conversation.findMany({
      where: { merchantId },
      include: {
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

  async createConversation(merchantId, participantName) {
    let conversation = await prisma.conversation.findFirst({
      where: { merchantId, participantName }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { merchantId, participantName }
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
}

export default new ChatService();
