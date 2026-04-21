import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/conversations', chatController.getConversations);
router.get('/messages/:conversationId', chatController.getMessages);
router.post('/conversations', chatController.createConversation);

export default router;
