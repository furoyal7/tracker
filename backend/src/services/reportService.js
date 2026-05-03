import prisma from '../lib/prisma.js';
import { startOfDay, subDays, endOfDay, format } from 'date-fns';
import ApiError from '../utils/ApiError.js';

export const getFinancialSummary = async (userId) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const yesterdayEnd = endOfDay(subDays(now, 1));
  const sevenDaysAgo = startOfDay(subDays(now, 7));

  try {
    // 1. Efficient Aggregations using Prisma
    const [totals, dailyTotals, debtTotals, productsCount] = await Promise.all([
      // Total Income & Expense
      prisma.transaction.groupBy({
        by: ['type'],
        where: { userId },
        _sum: { amount: true },
      }),
      // Today vs Yesterday Totals
      prisma.transaction.groupBy({
        by: ['type', 'date'],
        where: { 
          userId,
          date: { gte: yesterdayStart, lte: todayEnd }
        },
        _sum: { amount: true },
      }),
      // Debt Totals
      prisma.debt.groupBy({
        by: ['type'],
        where: { userId },
        _sum: { remainingAmount: true },
      }),
      // Inventory stats
      prisma.product.count({ where: { userId, quantity: 0 } }),
    ]);

    // 2. Process Basic Totals
    const totalIncome = totals.find(t => t.type === 'INCOME')?._sum.amount || 0;
    const totalExpense = totals.find(t => t.type === 'EXPENSE')?._sum.amount || 0;

    const totalReceivable = debtTotals.find(d => d.type === 'RECEIVABLE')?._sum.remainingAmount || 0;
    const totalPayable = debtTotals.find(d => d.type === 'PAYABLE')?._sum.remainingAmount || 0;

    // 3. Trends (Today vs Yesterday) - Grouped correctly by truncated date
    const incomeToday = dailyTotals
      .filter(t => t.type === 'INCOME' && startOfDay(new Date(t.date)).getTime() === todayStart.getTime())
      .reduce((s, t) => s + (t._sum.amount || 0), 0);
      
    const incomeYesterday = dailyTotals
      .filter(t => t.type === 'INCOME' && startOfDay(new Date(t.date)).getTime() === yesterdayStart.getTime())
      .reduce((s, t) => s + (t._sum.amount || 0), 0);
      
    const expenseToday = dailyTotals
      .filter(t => t.type === 'EXPENSE' && startOfDay(new Date(t.date)).getTime() === todayStart.getTime())
      .reduce((s, t) => s + (t._sum.amount || 0), 0);
      
    const expenseYesterday = dailyTotals
      .filter(t => t.type === 'EXPENSE' && startOfDay(new Date(t.date)).getTime() === yesterdayStart.getTime())
      .reduce((s, t) => s + (t._sum.amount || 0), 0);

    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // 4. Historical Chart Data (Last 7 Days) - Optimized fetch
    const historicalTxs = await prisma.transaction.findMany({
      where: { 
        userId,
        date: { gte: sevenDaysAgo }
      },
      select: { amount: true, type: true, date: true }
    });

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(todayStart, 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayIncome = historicalTxs
        .filter(t => t.type === 'INCOME' && new Date(t.date) >= dayStart && new Date(t.date) <= dayEnd)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const dayExpense = historicalTxs
        .filter(t => t.type === 'EXPENSE' && new Date(t.date) >= dayStart && new Date(t.date) <= dayEnd)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: format(date, 'EEE'),
        income: dayIncome,
        expense: dayExpense,
      };
    });

    // 5. Smart Insights
    const insights = [];
    
    // Profit Margin Insight
    const profitMargin = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
    if (profitMargin > 20) {
      insights.push({
        type: 'positive',
        title: 'Healthy Profit Margin',
        description: `Your profit margin stands at ${profitMargin}%, which is a strong indicator of business efficiency.`
      });
    } else if (totalExpense > totalIncome && totalIncome > 0) {
      insights.push({
        type: 'danger',
        title: 'Operating at a Loss',
        description: `Warning: Your expenses exceed your income by $${totalExpense - totalIncome}. Consider reviewing major costs.`
      });
    }

    // Debt Insight
    if (totalPayable > 0 && totalReceivable > 0) {
      const coverage = Math.round((totalReceivable / totalPayable) * 100);
      insights.push({
        type: 'info',
        title: 'Debt Coverage Ratio',
        description: `Your expected receivables cover ${coverage}% of your total payables.`
      });
    }

    const overdueCount = await prisma.debt.count({ where: { userId, status: 'OVERDUE' } });
    if (overdueCount > 0) {
      insights.push({
        type: 'warning',
        title: 'Overdue Debts Detected',
        description: `You have ${overdueCount} overdue debt${overdueCount > 1 ? 's' : ''} that need immediate attention to maintain liquidity.`
      });
    }

    // Inventory Insights
    if (productsCount > 0) {
      insights.push({
        type: 'danger',
        title: 'Critical Stock Out',
        description: `${productsCount} inventory items are completely out of stock. You may be losing potential sales.`
      });
    }

    const lowStockCount = await prisma.product.count({
      where: { userId, quantity: { lte: 5, gt: 0 } }
    });
    if (lowStockCount > 0) {
      insights.push({
        type: 'warning',
        title: 'Low Stock Alert',
        description: `Restock needed: ${lowStockCount} items are running critically low.`
      });
    }

    // 6. Distribution & Sales (Top Categories/Products)
    // For distribution, we can still use findMany but limit it or use more specific queries
    const recentTxs = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 1000 // Limit for in-memory analysis of distribution
    });

    const getDistribution = (type) => {
      const filtered = recentTxs.filter(t => t.type === type);
      const total = filtered.reduce((sum, t) => sum + t.amount, 0);
      const distribution = filtered.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

      return Object.entries(distribution)
        .map(([label, value]) => ({
          label,
          value: total > 0 ? Math.round((value / total) * 100) : 0,
          amount: value
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    };

    return {
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
      profitMargin: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
      totalReceivable,
      totalPayable,
      trends: {
        incomeChange: calculateChange(incomeToday, incomeYesterday),
        expenseChange: calculateChange(expenseToday, expenseYesterday),
        incomeToday,
        expenseToday
      },
      chartData,
      insights,
      incomeDistribution: getDistribution('INCOME'),
      expenseDistribution: getDistribution('EXPENSE'),
    };
  } catch (error) {
    throw new ApiError(500, `Failed to generate report: ${error.message}`);
  }
};
