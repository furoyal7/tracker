import chatService from '../services/chatService.js';

export const getConversations = async (req, res) => {
  try {
    const merchantId = req.user.id;
    const conversations = await chatService.getConversations(merchantId);
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    const merchantId = req.user.id;
    const { participantName } = req.body;
    if (!participantName) {
      return res.status(400).json({ message: 'participantName is required' });
    }
    const conversation = await chatService.createConversation(merchantId, participantName);
    res.json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
