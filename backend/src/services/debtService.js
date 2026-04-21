import prisma from '../lib/prisma.js';

export const createDebt = async (userId, debtData) => {
  const { dueDate, ...rest } = debtData;
  return prisma.debt.create({
    data: {
      ...rest,
      dueDate: new Date(dueDate),
      userId,
      remainingAmount: debtData.totalAmount,
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
  const debt = await prisma.debt.findFirst({
    where: { id, userId },
    include: { payments: true },
  });

  if (!debt) {
    throw new Error('Debt not found');
  }

  return debt;
};

export const updateDebt = async (userId, id, updateData) => {
  const debt = await getDebtById(userId, id);

  // If totalAmount is updated, we might need to recalculate remainingAmount
  // but usually it's better to keep it simple unless payments exist.
  
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

export const updateDebtStatus = async (debtId) => {
  const debt = await prisma.debt.findUnique({
    where: { id: debtId },
    include: { payments: true },
  });

  const totalPaid = debt.payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = Math.max(0, debt.totalAmount - totalPaid);
  
  let status = debt.status;
  if (remainingAmount === 0) {
    status = 'PAID';
  } else if (new Date(debt.dueDate) < new Date()) {
    status = 'OVERDUE';
  } else {
    status = 'UNPAID';
  }

  return prisma.debt.update({
    where: { id: debtId },
    data: { remainingAmount, status },
  });
};
