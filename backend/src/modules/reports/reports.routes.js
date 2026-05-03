import express from 'express';
import * as reportsController from './reports.controller.js';
import { authMiddleware } from '../../middlewares/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/daily', reportsController.getDaily);
router.get('/monthly', reportsController.getMonthly);
router.get('/export/pdf', reportsController.exportPdf);
router.get('/export/excel', reportsController.exportExcel);

export default router;
