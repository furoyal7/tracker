import * as paymentService from '../services/paymentService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createPayment = async (req, res) => {
  try {
    const payment = await paymentService.createPayment(req.user.id, req.body);
    return successResponse(res, payment, 'Payment recorded', 201);
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getPayments = async (req, res) => {
  try {
    const payments = await paymentService.getPayments(req.user.id, req.query);
    return successResponse(res, payments, 'Payments retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
