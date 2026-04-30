import chatService from '../services/chatService.js';

export const getConversations = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const conversations = await chatService.getConversations(merchantId);
    res.json(conversations);
  } catch (error) {
    console.error('Error in getConversations:', error);
    res.status(500).json({ 
      message: error.message, 
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await chatService.getMessages(conversationId);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createConversation = async (req, res) => {
  try {
    const creatorId = req.user.id;
    const { participantId } = req.body;
    if (!participantId) {
      return res.status(400).json({ message: 'participantId is required' });
    }
    if (creatorId === participantId) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }
    const conversation = await chatService.createConversation(creatorId, participantId);
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await chatService.getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
