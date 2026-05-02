import prisma from '../lib/prisma.js';
import ApiError from '../utils/ApiError.js';

export const createDebt = async (userId, debtData) => {
  const { dueDate, totalAmount, ...rest } = debtData;
  if (totalAmount <= 0) throw new ApiError(400, 'Total amount must be greater than zero');

  return prisma.debt.create({
    data: {
      ...rest,
      totalAmount: parseFloat(totalAmount),
      dueDate: new Date(dueDate),
      userId,
      remainingAmount: parseFloat(totalAmount),
    },
  });
};


export const getDebts = async (userId, filters = {}) => {
  const { type, status, name } = filters;

  const where = {
    userId,
    ...(type && { type }),
    ...(status && { status }),
    ...(name && { name: { contains: name, mode: 'insensitive' } }),
  };

  return prisma.debt.findMany({
    where,
    orderBy: { dueDate: 'asc' },
    include: {
      payments: true,
    },
  });
};

export const getDebtById = async (userId, id) => {
  if (!id) throw new ApiError(400, 'Debt ID is required');

  const debt = await prisma.debt.findFirst({
    where: { id, userId },
    include: { payments: true },
  });

  if (!debt) {
    throw new ApiError(404, 'Debt not found');
  }

  return debt;
};

export const updateDebt = async (userId, id, updateData) => {
  const debt = await getDebtById(userId, id);

  return prisma.debt.update({
    where: { id: debt.id },
    data: updateData,
  });
};

export const deleteDebt = async (userId, id) => {
  const debt = await getDebtById(userId, id);

  return prisma.debt.delete({
    where: { id: debt.id },
  });
};

export const updateDebtStatus = async (debtId, tx = prisma) => {
  const debt = await tx.debt.findUnique({
    where: { id: debtId },
    include: { payments: true },
  });

  if (!debt) throw new ApiError(404, `Debt ${debtId} not found`);

  const totalPaid = debt.payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const remainingAmount = Math.max(0, parseFloat(debt.totalAmount) - totalPaid);
  
  let status = debt.status;
  if (remainingAmount <= 0.01) { // Floating point safety
    status = 'PAID';
  } else if (new Date(debt.dueDate) < new Date() && status !== 'PAID') {
    status = 'OVERDUE';
  } else {
    status = 'UNPAID';
  }

  return tx.debt.update({
    where: { id: debtId },
    data: { 
      remainingAmount: parseFloat(remainingAmount.toFixed(2)), 
      status 
    },
  });
};
