import prisma from '../../lib/prisma.js';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

export const getSummary = async (userId) => {
  const totals = await prisma.transaction.groupBy({
    by: ['type'],
    where: { userId },
    _sum: { amount: true },
  });
  
  const income = totals.find(t => t.type === 'INCOME')?._sum.amount || 0;
  const expense = totals.find(t => t.type === 'EXPENSE')?._sum.amount || 0;
  
  const categories = await prisma.transaction.groupBy({
    by: ['category'],
    where: { userId, type: 'EXPENSE' },
    _sum: { amount: true },
    orderBy: {
      _sum: { amount: 'desc' }
    },
    take: 1
  });
  const topCategory = categories[0]?.category || 'None';

  return { 
    totalIncome: income, 
    totalExpense: expense, 
    netProfit: income - expense,
    topCategory,
    period: 'All Time'
  };
};

export const getMonthlyGrowth = async (userId) => {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  const currentIncome = await prisma.transaction.aggregate({
    where: { userId, type: 'INCOME', date: { gte: currentMonthStart, lte: currentMonthEnd } },
    _sum: { amount: true }
  });
  const currentVal = currentIncome._sum.amount || 0;

  const prevIncome = await prisma.transaction.aggregate({
    where: { userId, type: 'INCOME', date: { gte: previousMonthStart, lte: previousMonthEnd } },
    _sum: { amount: true }
  });
  const prevVal = prevIncome._sum.amount || 0;

  let growth = 0;
  if (prevVal > 0) {
    growth = ((currentVal - prevVal) / prevVal) * 100;
  } else if (currentVal > 0) {
    growth = 100;
  }

  return {
    currentIncome: currentVal,
    previousIncome: prevVal,
    growth: Math.round(growth)
  };
};

export const getCategoryBreakdown = async (userId) => {
  const categories = await prisma.transaction.groupBy({
    by: ['category'],
    where: { userId, type: 'EXPENSE' },
    _sum: { amount: true }
  });
  
  const totalExpense = categories.reduce((sum, c) => sum + (c._sum.amount || 0), 0);

  return categories.map(c => ({
    category: c.category,
    amount: c._sum.amount || 0,
    percentage: totalExpense > 0 ? ((c._sum.amount || 0) / totalExpense) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);
};

export const getProfitMargin = async (userId) => {
  const totals = await prisma.transaction.groupBy({
    by: ['type'],
    where: { userId },
    _sum: { amount: true },
  });
  const income = totals.find(t => t.type === 'INCOME')?._sum.amount || 0;
  const expense = totals.find(t => t.type === 'EXPENSE')?._sum.amount || 0;
  
  let margin = 0;
  if (income > 0) {
    margin = ((income - expense) / income) * 100;
  }

  return {
    income,
    expense,
    profitMargin: Math.round(margin)
  };
};
