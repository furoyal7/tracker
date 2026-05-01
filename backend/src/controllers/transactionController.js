import * as transactionService from '../services/transactionService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createTransaction = async (req, res) => {
  try {
    console.log('[DEBUG] Controller - Create Transaction triggered');
    const transaction = await transactionService.createTransaction(req.user.id, req.body);
    console.log('[DEBUG] Controller - Success, returning transaction');
    return successResponse(res, transaction, 'Transaction created', 201);
  } catch (error) {
    console.error('[ERROR] Controller - Create Transaction failed:', error.message);
    return errorResponse(res, error.message, 400);
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await transactionService.getTransactions(req.user.id, req.query);
    return successResponse(res, transactions, 'Transactions retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionById(req.user.id, req.params.id);
    return successResponse(res, transaction, 'Transaction retrieved');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const transaction = await transactionService.updateTransaction(req.user.id, req.params.id, req.body);
    return successResponse(res, transaction, 'Transaction updated');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    await transactionService.deleteTransaction(req.user.id, req.params.id);
    return successResponse(res, null, 'Transaction deleted');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
