import prisma from '../lib/prisma.js';
import { updateDebtStatus } from './debtService.js';
import ApiError from '../utils/ApiError.js';

export const createPayment = async (userId, paymentData) => {
  const { debtId, amount, date } = paymentData;

  if (!debtId) throw new ApiError(400, 'Debt ID is required');
  if (amount <= 0) throw new ApiError(400, 'Payment amount must be greater than zero');

  // Use a transaction to ensure atomicity
  return prisma.$transaction(async (tx) => {
    // Verify debt belongs to user
    const debt = await tx.debt.findFirst({
      where: { id: debtId, userId },
    });

    if (!debt) {
      throw new ApiError(404, 'Debt not found or unauthorized');
    }

    if (debt.remainingAmount < amount) {
      throw new ApiError(400, `Payment amount (${amount}) exceeds remaining debt balance (${debt.remainingAmount})`);
    }

    const payment = await tx.payment.create({
      data: {
        debtId,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
      },
    });

    // Automatically update debt remaining amount and status
    // Note: debtService.js needs to be updated to accept a transaction client
    await updateDebtStatus(debtId, tx);

    return payment;
  });
};

export const getPayments = async (userId, filters = {}) => {
  const { debtId } = filters;

  const where = {
    debt: {
      userId,
    },
    ...(debtId && { debtId }),
  };

  return prisma.payment.findMany({
    where,
    orderBy: { date: 'desc' },
    include: {
      debt: {
        select: { name: true, type: true },
      },
    },
  });
};
