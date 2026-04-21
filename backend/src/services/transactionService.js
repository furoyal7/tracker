import prisma from '../lib/prisma.js';

import * as productService from './productService.js';

export const createTransaction = async (userId, transactionData) => {
  const { productId, quantity = 1, ...rest } = transactionData;

  return prisma.$transaction(async (tx) => {
    // If a product is linked, adjust stock
    if (productId && transactionData.type === 'INCOME') {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');
      if (product.quantity < quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      await tx.product.update({
        where: { id: productId },
        data: { quantity: { decrement: quantity } },
      });
    }

    return tx.transaction.create({
      data: {
        ...rest,
        productId,
        quantity,
        userId,
      },
    });
  });
};


export const getTransactions = async (userId, filters = {}) => {
  const { type, category, startDate, endDate, skip = 0, take = 10 } = filters;

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
      skip: parseInt(skip),
      take: parseInt(take),
    }),
    prisma.transaction.count({ where }),
  ]);

  return { transactions, total, skip, take };
};

export const getTransactionById = async (userId, id) => {
  const transaction = await prisma.transaction.findFirst({
    where: { id, userId },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  return transaction;
};

export const updateTransaction = async (userId, id, updateData) => {
  const transaction = await getTransactionById(userId, id);

  return prisma.transaction.update({
    where: { id: transaction.id },
    data: updateData,
  });
};

export const deleteTransaction = async (userId, id) => {
  const transaction = await getTransactionById(userId, id);

  return prisma.transaction.delete({
    where: { id: transaction.id },
  });
};
