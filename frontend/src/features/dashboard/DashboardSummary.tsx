'use client';
import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertCircle
} from 'lucide-react';
import { useFinanceStore } from '@/store/financeStore';
import { cn } from '@/utils/cn';

export const DashboardSummary = () => {
  const { summary, isLoading } = useFinanceStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading && !summary) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-[2rem] md:rounded-[2.5rem] bg-slate-50 border border-slate-100" />
        ))}
      </div>
    );
  }

  const items = [
    {
      title: 'Net Profit',
      value: formatCurrency(summary?.profit || 0),
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50/50',
    },
    {
      title: 'Revenue',
      value: formatCurrency(summary?.totalIncome || 0),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
    },
    {
      title: 'Expense',
      value: formatCurrency(summary?.totalExpense || 0),
      icon: TrendingDown,
      color: 'text-rose-600',
      bg: 'bg-rose-50/50',
    },
    {
      title: 'Pending',
      value: formatCurrency(summary?.totalReceivable || 0),
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map((item) => (
        <div key={item.title} className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-50 shadow-[0_4px_20px_-1px_rgba(0,0,0,0.01)] flex flex-col active:scale-95 transition-all hover:shadow-xl hover:shadow-blue-50/20 group">
          <div className={cn('p-3 rounded-[1.25rem] w-fit mb-4 transition-transform group-hover:scale-110', item.bg)}>
            <item.icon className={cn('h-5 w-5 stroke-[2.5px]', item.color)} />
          </div>
          <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2 leading-none">{item.title}</p>
          <h4 className={cn('text-2xl md:text-3xl font-black tracking-tighter tabular-nums text-slate-900 leading-none')}>
            {item.value}
          </h4>
        </div>
      ))}
    </div>
  );
};
