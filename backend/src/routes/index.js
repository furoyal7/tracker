import express from 'express';
import authRoutes from './authRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import debtRoutes from './debtRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import productRoutes from './productRoutes.js';
import reportRoutes from './reportRoutes.js';
import chatRoutes from './chatRoutes.js';
import exchangeRoutes from './exchangeRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/debts', debtRoutes);
router.use('/payments', paymentRoutes);
router.use('/products', productRoutes);
router.use('/reports', reportRoutes);
router.use('/chat', chatRoutes);
router.use('/exchange', exchangeRoutes);
router.use('/users', userRoutes);

export default router;
