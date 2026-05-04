import { PrismaClient } from '@prisma/client';
import { startOfMonth, subMonths, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();

/**
 * Advanced Insights Engine
 * Computes business intelligence from existing transaction data.
 */
export const generateInsights = async (userId) => {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  // 1. Fetch Transactions for growth and margin calculations
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' }
  });

  // 2. Monthly Growth %
  const currentMonthSales = transactions
    .filter(t => t.type === 'INCOME' && new Date(t.date) >= currentMonthStart)
    .reduce((sum, t) => sum + t.amount, 0);

  const previousMonthSales = transactions
    .filter(t => t.type === 'INCOME' && new Date(t.date) >= previousMonthStart && new Date(t.date) <= previousMonthEnd)
    .reduce((sum, t) => sum + t.amount, 0);

  let growthRate = 0;
  if (previousMonthSales > 0) {
    growthRate = ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100;
  } else if (currentMonthSales > 0) {
    growthRate = 100; // 100% growth if starting from zero
  }

  // 3. Expense Breakdown (Group by category)
  const expenses = transactions.filter(t => t.type === 'EXPENSE');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  const categoryMap = {};
  expenses.forEach(e => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const expenseBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  // 4. Profit Margin
  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? (profit / totalIncome) * 100 : 0;

  // 5. Debt Risk Indicator
  const debts = await prisma.debt.findMany({
    where: { userId, status: { in: ['UNPAID', 'OVERDUE'] } }
  });
  const totalUnpaidDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0);
  const debtRisk = totalUnpaidDebt > (totalIncome * 0.3) ? 'HIGH' : totalUnpaidDebt > 0 ? 'MODERATE' : 'LOW';

  // 6. Cash Flow Trend (Last 6 Months)
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(now, i);
    return {
      start: startOfMonth(d),
      end: endOfMonth(d),
      label: d.toLocaleString('default', { month: 'short' })
    };
  }).reverse();

  const cashFlowTrend = months.map(m => {
    const monthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d >= m.start && d <= m.end;
    });

    return {
      month: m.label,
      income: monthTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
      expense: monthTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
    };
  });

  return {
    kpis: {
      growthRate: Math.round(growthRate * 10) / 10,
      profitMargin: Math.round(profitMargin * 10) / 10,
      debtRisk,
      totalUnpaidDebt
    },
    expenseBreakdown,
    cashFlowTrend,
    topExpenses: expenseBreakdown.slice(0, 5)
  };
};
