import express from 'express';
import * as syncController from './sync.controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/batch', syncController.batchSync);

export default router;
