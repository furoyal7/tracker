import * as debtService from '../services/debtService.js';
import * as userService from '../services/userService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { z } from 'zod';

const debtSchema = z.object({
  type: z.enum(['RECEIVABLE', 'PAYABLE']),
  name: z.string().min(1, 'Name is required'),
  totalAmount: z.number().positive('Amount must be positive'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});


export const createDebt = async (req, res) => {
  try {
    const validatedData = debtSchema.parse(req.body);
    const debt = await debtService.createDebt(req.user.id, validatedData);
    await userService.createActivityLog(req.user.id, 'DEBT_CREATED', { 
      type: debt.type, 
      name: debt.name, 
      amount: debt.totalAmount 
    });
    return successResponse(res, debt, 'Debt created', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, error.errors[0].message, 400);
    }
    return errorResponse(res, error.message, 400);
  }
};


export const getDebts = async (req, res) => {
  try {
    const debts = await debtService.getDebts(req.user.id, req.query);
    return successResponse(res, debts, 'Debts retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getDebtById = async (req, res) => {
  try {
    const debt = await debtService.getDebtById(req.user.id, req.params.id);
    return successResponse(res, debt, 'Debt retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const updateDebt = async (req, res) => {
  try {
    const debt = await debtService.updateDebt(req.user.id, req.params.id, req.body);
    return successResponse(res, debt, 'Debt updated');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const deleteDebt = async (req, res) => {
  try {
    await debtService.deleteDebt(req.user.id, req.params.id);
    return successResponse(res, null, 'Debt deleted');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
