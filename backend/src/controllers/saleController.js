import * as saleService from '../services/saleService.js';
import * as userService from '../services/userService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createSale = async (req, res) => {
  try {
    const sale = await saleService.createSale(req.user.id, req.body);
    await userService.createActivityLog(req.user.id, 'SALE_CREATED', { 
      total: sale.totalAmount, 
      customer: sale.customerName 
    });
    return successResponse(res, sale, 'Sale registered successfully', 201);
  } catch (error) {
    console.error('[SALE_CONTROLLER_ERROR]', error);
    return errorResponse(res, error.message, 400);
  }
};

export const getSales = async (req, res) => {
  try {
    const sales = await saleService.getSales(req.user.id, req.query);
    return successResponse(res, sales, 'Sales retrieved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getSaleById = async (req, res) => {
  try {
    const sale = await saleService.getSaleById(req.user.id, req.params.id);
    return successResponse(res, sale, 'Sale details retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};
