import express from 'express';
import * as saleController from '../controllers/saleController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';

const router = express.Router();

const saleSchema = z.object({
  body: z.object({
    customerName: z.string().min(1, "Customer name is required for traceability"),
    customerPhone: z.string().optional(),
    customerType: z.enum(['RETAIL', 'WHOLESALE', 'REPEAT']).default('RETAIL'),
    branchId: z.string().optional(),
    items: z.array(z.object({
      productId: z.string().optional(),
      productName: z.string().min(1),
      quantity: z.number().int().positive(),
      unitPrice: z.number().positive(),
      discount: z.number().nonnegative().optional().default(0),
    })).min(1, "At least one item is required per sale"),
    subtotal: z.number().positive(),
    tax: z.number().nonnegative().optional().default(0),
    discount: z.number().nonnegative().optional().default(0),
    totalAmount: z.number().positive(),
    amountPaid: z.number().nonnegative(),
    paymentMethod: z.string().min(1),
    channel: z.enum(['IN_STORE', 'ONLINE', 'DELIVERY']).default('IN_STORE'),
    notes: z.string().optional(),
    reference: z.string().optional(),
    dueDate: z.string().optional(), 
  }).refine((data) => {
    // If it's a partial/unpaid payment, dueDate might be required (optional but recommended in real business)
    if (data.totalAmount > data.amountPaid && !data.dueDate) {
      return true; // We can allow it but ideally it should be there.
    }
    return true;
  }),
});

router.use(authMiddleware);

router.post('/', validate(saleSchema), saleController.createSale);
router.get('/', saleController.getSales);
router.get('/:id', saleController.getSaleById);

export default router;
