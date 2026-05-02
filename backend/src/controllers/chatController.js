import chatService from '../services/chatService.js';
import { successResponse } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';

export const getConversations = async (req, res, next) => {
  try {
    const merchantId = req.user.id;
    const conversations = await chatService.getConversations(merchantId);
    return successResponse(res, conversations, 'Conversations retrieved');
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    if (!conversationId) throw new ApiError(400, 'Conversation ID is required');
    
    // Privacy Check: Verify user belongs to this conversation
    const conversation = await chatService.getConversation(conversationId);
    if (!conversation) throw new ApiError(404, 'Conversation not found');
    
    if (conversation.creatorId !== userId && conversation.participantId !== userId) {
      throw new ApiError(403, 'Unauthorized to view this conversation');
    }
    
    const messages = await chatService.getMessages(conversationId);
    return successResponse(res, messages, 'Messages retrieved');
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const creatorId = req.user.id;
    const { participantId } = req.body;
    
    if (!participantId) {
      throw new ApiError(400, 'participantId is required');
    }
    
    if (creatorId === participantId) {
      throw new ApiError(400, 'Cannot chat with yourself');
    }
    
    const conversation = await chatService.createConversation(creatorId, participantId);
    return successResponse(res, conversation, 'Conversation created', 201);
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    if (!conversationId) throw new ApiError(400, 'Conversation ID is required');

    const conversation = await chatService.getConversation(conversationId);
    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }

    // Privacy Check
    if (conversation.creatorId !== userId && conversation.participantId !== userId) {
      throw new ApiError(403, 'Unauthorized to view this conversation');
    }

    return successResponse(res, conversation, 'Conversation retrieved');
  } catch (error) {
    next(error);
  }
};
