import prisma from '../lib/prisma.js';
import { updateDebtStatus } from './debtService.js';

export const createPayment = async (userId, paymentData) => {
  const { debtId, amount, date } = paymentData;

  // Verify debt belongs to user
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
  });

  if (!debt) {
    throw new Error('Debt not found or unauthorized');
  }

  const payment = await prisma.payment.create({
    data: {
      debtId,
      amount,
      date: date ? new Date(date) : new Date(),
    },
  });

  // Automatically update debt remaining amount and status
  await updateDebtStatus(debtId);

  return payment;
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
