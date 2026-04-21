import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import upload from '../middlewares/upload.middleware.js';
import * as exchangeController from '../controllers/ExchangeController.js';

const router = express.Router();

// Apply auth to all routes
router.use(authMiddleware);

// User endpoints
router.post('/create', exchangeController.createOrder);
router.post('/upload-proof/:id', upload.single('proof'), exchangeController.uploadProof);
router.get('/mine', exchangeController.getUserOrders);
router.get('/:id', exchangeController.getOrder);

// Admin endpoints
router.get('/admin/all', exchangeController.getAdminOrders);
router.patch('/:id/confirm', exchangeController.confirmOrder);
router.patch('/:id/reject', exchangeController.rejectOrder);
router.patch('/:id/complete', exchangeController.completeOrder);

export default router;
