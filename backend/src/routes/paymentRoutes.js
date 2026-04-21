import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = express.Router();

const paymentSchema = z.object({
  body: z.object({
    debtId: z.string().uuid(),
    amount: z.number().positive(),
    date: z.string().optional(),
  }),
});

router.use(authMiddleware);

router.post('/', validate(paymentSchema), paymentController.createPayment);
router.get('/', paymentController.getPayments);

export default router;
