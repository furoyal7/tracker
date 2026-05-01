import express from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = express.Router();

const transactionSchema = z.object({
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    amount: z.number().positive(),
    category: z.string(),
    note: z.string().optional(),
    date: z.string().optional(),
    paymentMethod: z.string().optional(),
    partyName: z.string().optional(),
    reference: z.string().optional(),
    productId: z.string().optional(),
    quantity: z.number().int().positive().optional(),
  }),
});

router.use(authMiddleware);

router.post('/', (req, res, next) => {
  console.log('[TRACE] Backend Route Hit: POST /api/transactions', { body: req.body });
  next();
}, validate(transactionSchema), transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/:id', transactionController.getTransactionById);
router.put('/:id', validate(transactionSchema), transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction);

export default router;
