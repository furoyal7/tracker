import express from 'express';
import authRoutes from './authRoutes.js';
import transactionRoutes from './transactionRoutes.js';
import debtRoutes from './debtRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import productRoutes from './productRoutes.js';
import chatRoutes from './chatRoutes.js';
import exchangeRoutes from './exchangeRoutes.js';
import userRoutes from './userRoutes.js';
import saleRoutes from './saleRoutes.js';
import insightRoutes from './insightRoutes.js';

// Legacy routes that must be maintained
import legacyReportRoutes from './reportRoutes.js';

// Modular routes
import analyticsModuleRoutes from '../modules/analytics/analytics.routes.js';
import reportsModuleRoutes from '../modules/reports/reports.routes.js';
import syncModuleRoutes from '../modules/sync/sync.routes.js';

const router = express.Router();

// Core legacy routes
router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/sales', saleRoutes);
router.use('/debts', debtRoutes);
router.use('/payments', paymentRoutes);
router.use('/products', productRoutes);
router.use('/reports', legacyReportRoutes);
router.use('/chat', chatRoutes);
router.use('/message', chatRoutes);
router.use('/exchange', exchangeRoutes);
router.use('/users', userRoutes);
router.use('/insights', insightRoutes);

// New production-grade modules
router.use('/analytics', analyticsModuleRoutes);
router.use('/reports', reportsModuleRoutes);
router.use('/sync', syncModuleRoutes);

export default router;
