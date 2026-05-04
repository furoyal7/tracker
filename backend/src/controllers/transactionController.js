import * as transactionService from '../services/transactionService.js';
import * as userService from '../services/userService.js';
import { successResponse } from '../utils/response.js';

export const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(req.user.id, req.body);
    await userService.createActivityLog(req.user.id, 'TRANSACTION_CREATED', { 
      type: transaction.type, 
      amount: transaction.amount, 
      category: transaction.category 
    });
    return successResponse(res, transaction, 'Transaction created', 201);
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getTransactions(req.user.id, req.query);
    return successResponse(res, transactions, 'Transactions retrieved');
  } catch (error) {
    next(error);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(req.user.id, req.params.id);
    return successResponse(res, transaction, 'Transaction retrieved');
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.updateTransaction(req.user.id, req.params.id, req.body);
    return successResponse(res, transaction, 'Transaction updated');
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    await transactionService.deleteTransaction(req.user.id, req.params.id);
    return successResponse(res, null, 'Transaction deleted');
  } catch (error) {
    next(error);
  }
};
