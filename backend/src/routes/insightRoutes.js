import express from 'express';
import * as insightController from '../controllers/insightController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', insightController.getInsights);

export default router;
