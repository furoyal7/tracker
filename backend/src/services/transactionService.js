import prisma from '../lib/prisma.js';
import * as productService from './productService.js';
import ApiError from '../utils/ApiError.js';

export const createTransaction = async (userId, transactionData) => {
  const { id, productId, quantity = 0, amount, type, ...rest } = transactionData;

  if (amount < 0) throw new ApiError(400, 'Amount cannot be negative');
  if (productId && quantity < 0) throw new ApiError(400, 'Quantity cannot be negative');

  try {
    return await prisma.$transaction(async (tx) => {
      if (id) {
        const existing = await tx.transaction.findUnique({ where: { id } });
        if (existing) {
          return existing;
        }
      }

      if (productId && type === 'INCOME') {
        await productService.adjustStock(productId, quantity, tx);
      }

      const transaction = await tx.transaction.create({
        data: {
          ...(id && { id }),
          ...rest,
          amount: parseFloat(amount),
          type,
          date: rest.date ? new Date(rest.date) : new Date(),
          productId,
          quantity: parseInt(quantity),
          userId,
        },
      });
      
      return transaction;
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Transaction failed: ${error.message}`);
  }
};


export const getTransactions = async (userId, filters = {}) => {
  const { type, category, startDate, endDate, skip = 0, take = 20 } = filters;

  const where = {
    userId,
    ...(type && { type }),
    ...(category && { category }),
    ...(startDate && endDate && {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    }),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: Math.max(0, parseInt(skip) || 0),
      take: Math.min(100, parseInt(take) || 20),
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total, skip, take };
};

export const getTransactionById = async (userId, id) => {
  if (!id) throw new ApiError(400, 'Transaction ID is required');

  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  return transaction;
};

export const updateTransaction = async (userId, id, updateData) => {
  const transaction = await getTransactionById(userId, id);

  if (updateData.amount !== undefined && updateData.amount < 0) {
    throw new ApiError(400, 'Amount cannot be negative');
  }

  return prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      ...updateData,
      ...(updateData.amount !== undefined && { amount: parseFloat(updateData.amount) }),
    },
  });
};

export const deleteTransaction = async (userId, id) => {
  const transaction = await getTransactionById(userId, id);

  return prisma.transaction.delete({
    where: { id: transaction.id },
  });
};
