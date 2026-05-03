import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Chat specific paths (mounted under /chat)
router.get('/list', chatController.getConversations);
router.post('/create', chatController.createConversation);
router.get('/:chatId', chatController.getConversation);
router.post('/seen', chatController.markSeen);

// Message specific paths (mounted under /message)
router.get('/:chatId', chatController.getMessages);
router.post('/send', chatController.sendMessage);

export default router;
