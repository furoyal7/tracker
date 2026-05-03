import express from 'express';
import * as analyticsController from './analytics.controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/summary', analyticsController.getSummary);
router.get('/monthly-growth', analyticsController.getMonthlyGrowth);
router.get('/category-breakdown', analyticsController.getCategoryBreakdown);
router.get('/profit-margin', analyticsController.getProfitMargin);

export default router;
