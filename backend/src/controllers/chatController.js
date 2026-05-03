import chatService from '../services/chatService.js';
import { successResponse } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const conversations = await chatService.getConversations(userId);
    return successResponse(res, conversations, 'Conversations retrieved');
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { limit, cursor } = req.query;
    const userId = req.user.id;
    
    if (!chatId) throw new ApiError(400, 'Chat ID is required');
    
    const chat = await chatService.getConversation(chatId);
    if (!chat) throw new ApiError(404, 'Chat not found');
    
    const isParticipant = chat.participants.some(p => p.id === userId);
    if (!isParticipant) throw new ApiError(403, 'Unauthorized to view this chat');
    
    const messages = await chatService.getMessages(chatId, parseInt(limit) || 50, cursor);
    return successResponse(res, messages, 'Messages retrieved');
  } catch (error) {
    next(error);
  }
};

export const createConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { participantIds, type } = req.body;
    
    if (!participantIds || !Array.isArray(participantIds)) {
      throw new ApiError(400, 'participantIds must be an array');
    }
    
    // Ensure current user is included if not already
    const uniqueIds = Array.from(new Set([...participantIds, userId]));
    
    const conversation = await chatService.createConversation(uniqueIds, type || 'PRIVATE');
    return successResponse(res, conversation, 'Conversation created', 201);
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    if (!chatId) throw new ApiError(400, 'Chat ID is required');

    const chat = await chatService.getConversation(chatId);
    if (!chat) throw new ApiError(404, 'Chat not found');

    const isParticipant = chat.participants.some(p => p.id === userId);
    if (!isParticipant) throw new ApiError(403, 'Unauthorized to view this chat');

    return successResponse(res, chat, 'Chat retrieved');
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { chatId, text, attachments } = req.body;
    
    if (!chatId) throw new ApiError(400, 'Chat ID is required');
    
    const message = await chatService.saveMessage(chatId, userId, text, attachments);
    return successResponse(res, message, 'Message sent', 201);
  } catch (error) {
    next(error);
  }
};

export const markSeen = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { messageIds } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      throw new ApiError(400, 'messageIds must be an array');
    }
    
    await chatService.markAsSeen(messageIds, userId);
    return successResponse(res, null, 'Messages marked as seen');
  } catch (error) {
    next(error);
  }
};
