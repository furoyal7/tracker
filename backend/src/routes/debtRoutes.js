import express from 'express';
import * as debtController from '../controllers/debtController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = express.Router();

const debtSchema = z.object({
  body: z.object({
    type: z.enum(['RECEIVABLE', 'PAYABLE']),
    name: z.string(),
    totalAmount: z.number().positive(),
    dueDate: z.string(),
  }),
});

router.use(authMiddleware);

router.post('/', validate(debtSchema), debtController.createDebt);
router.get('/', debtController.getDebts);
router.get('/:id', debtController.getDebtById);
router.put('/:id', validate(debtSchema), debtController.updateDebt);
router.delete('/:id', debtController.deleteDebt);

export default router;
