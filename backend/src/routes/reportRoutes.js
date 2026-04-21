import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/summary', reportController.getSummary);

export default router;
