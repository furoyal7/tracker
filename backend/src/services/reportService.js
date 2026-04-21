import prisma from '../lib/prisma.js';
import { startOfDay, subDays, endOfDay } from 'date-fns';

export const getFinancialSummary = async (userId) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const sevenDaysAgo = startOfDay(subDays(now, 7));

  // 1. Fetch all relevant data
  const [allTransactions, debts] = await Promise.all([
    prisma.transaction.findMany({ where: { userId } }),
    prisma.debt.findMany({ where: { userId }, include: { payments: true } }),
  ]);

  // 2. Basic Totals
  const totalIncome = allTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = allTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalReceivable = debts
    .filter((d) => d.type === 'RECEIVABLE')
    .reduce((sum, d) => sum + d.remainingAmount, 0);

  // 3. Today vs Yesterday (Trends)
  const getDailyTotal = (txs, day, type) => 
    txs.filter(t => t.type === type && new Date(t.date) >= startOfDay(day) && new Date(t.date) <= endOfDay(day))
       .reduce((sum, t) => sum + t.amount, 0);

  const incomeToday = getDailyTotal(allTransactions, todayStart, 'INCOME');
  const incomeYesterday = getDailyTotal(allTransactions, yesterdayStart, 'INCOME');
  const expenseToday = getDailyTotal(allTransactions, todayStart, 'EXPENSE');
  const expenseYesterday = getDailyTotal(allTransactions, yesterdayStart, 'EXPENSE');

  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // 4. Historical Chart Data (Last 7 Days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(todayStart, 6 - i);
    return {
      name: date.toLocaleDateString('en-US', { weekday: 'short' }),
      income: getDailyTotal(allTransactions, date, 'INCOME'),
      expense: getDailyTotal(allTransactions, date, 'EXPENSE'),
    };
  });

  // 5. Smart Insights
  const insights = [];
  
  // Overdue debts
  const overdueCount = debts.filter(d => d.status === 'OVERDUE').length;
  if (overdueCount > 0) {
    insights.push(`You have ${overdueCount} overdue debt${overdueCount > 1 ? 's' : ''} that need attention.`);
  }

  // Top debtor
  const topDebtor = [...debts]
    .filter(d => d.type === 'RECEIVABLE')
    .sort((a, b) => b.remainingAmount - a.remainingAmount)[0];
  if (topDebtor && topDebtor.remainingAmount > 0) {
    insights.push(`${topDebtor.name} owes you the most: $${topDebtor.remainingAmount.toLocaleString()}.`);
  }

  // 6. Inventory Insights
  const lowStockProducts = await prisma.product.findMany({
    where: { 
      userId,
      quantity: { lte: 5, gt: 0 } 
    }
  });

  const outOfStockCount = await prisma.product.count({
    where: { userId, quantity: 0 }
  });

  if (outOfStockCount > 0) {
    insights.push(`Danger! ${outOfStockCount} items are completely out of stock.`);
  }

  if (lowStockProducts.length > 0) {
    insights.push(`Restock Alert: ${lowStockProducts.length} items are running low (under 5 units).`);
  }

  // Expense spike
  const weeklyExpense = allTransactions
    .filter(t => t.type === 'EXPENSE' && new Date(t.date) >= sevenDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);
  const prevWeeklyExpense = allTransactions
    .filter(t => t.type === 'EXPENSE' && new Date(t.date) < sevenDaysAgo && new Date(t.date) >= subDays(sevenDaysAgo, 7))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenseSpike = calculateChange(weeklyExpense, prevWeeklyExpense);
  if (expenseSpike > 15) {
    insights.push(`Your weekly expenses increased by ${expenseSpike}% compared to last week.`);
  }

  return {
    totalIncome,
    totalExpense,
    profit: totalIncome - totalExpense,
    totalReceivable,
    totalPayable: debts.filter(d => d.type === 'PAYABLE').reduce((sum, d) => sum + d.remainingAmount, 0),
    trends: {
      incomeChange: calculateChange(incomeToday, incomeYesterday),
      expenseChange: calculateChange(expenseToday, expenseYesterday),
      incomeToday,
      expenseToday
    },
    chartData,
    insights
  };
};
