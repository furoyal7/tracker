import * as exchangeService from '../services/exchangeService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { z } from 'zod';

const orderSchema = z.object({
  fromCurrency: z.string().min(1),
  toCurrency: z.string().min(1),
  amount: z.number().positive(),
  exchangeRate: z.number().positive(),
});

const proofSchema = z.object({
  senderName: z.string().min(1),
  amountSent: z.string().min(1),
  referenceUsed: z.string().min(1),
});

export const createOrder = async (req, res) => {
  try {
    const validatedData = orderSchema.parse(req.body);
    const order = await exchangeService.createOrder(req.user.id, validatedData);
    return successResponse(res, order, 'Exchange order created', 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, error.errors[0].message, 400);
    }
    return errorResponse(res, error.message, 400);
  }
};

export const uploadProof = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Payment proof image is required', 400);
    }

    const { id } = req.params;
    const validatedData = proofSchema.parse(req.body);
    
    // We store the local path or URL
    const imageUrl = `/uploads/${req.file.filename}`;

    const order = await exchangeService.uploadPaymentProof(id, {
      ...validatedData,
      imageUrl
    });

    return successResponse(res, order, 'Payment proof uploaded successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, error.errors[0].message, 400);
    }
    return errorResponse(res, error.message, 400);
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await exchangeService.getOrderById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found', 404);
    
    // Security: Only owner or admin can see
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Unauthorized access', 403);
    }

    return successResponse(res, order, 'Order details retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await exchangeService.getOrders({ userId: req.user.id });
    return successResponse(res, orders, 'User orders retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getAdminOrders = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Admin access required', 403);
    }
    const orders = await exchangeService.getOrders();
    return successResponse(res, orders, 'All orders retrieved for admin');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const confirmOrder = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Admin access required', 403);
    }
    const order = await exchangeService.confirmPayment(req.params.id);
    return successResponse(res, order, 'Order confirmed by admin');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const rejectOrder = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Admin access required', 403);
    }
    const order = await exchangeService.rejectPayment(req.params.id);
    return successResponse(res, order, 'Order rejected by admin');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const completeOrder = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return errorResponse(res, 'Admin access required', 403);
    }
    const order = await exchangeService.completeOrder(req.params.id);
    return successResponse(res, order, 'Order marked as completed');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
