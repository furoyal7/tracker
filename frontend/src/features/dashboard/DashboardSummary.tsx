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
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-[2.5rem] bg-slate-50 border border-slate-100" />
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
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.title} className="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-[0_4px_20px_-1px_rgba(0,0,0,0.01)] flex flex-col active:scale-95 transition-all">
          <div className={cn('p-3 rounded-[1.25rem] w-fit mb-4', item.bg)}>
            <item.icon className={cn('h-5 w-5 stroke-[2.5px]', item.color)} />
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1.5 leading-none">{item.title}</p>
          <h4 className={cn('text-xl font-black tracking-tighter tabular-nums text-slate-900 leading-none')}>
            {item.value}
          </h4>
        </div>
      ))}
    </div>
  );
};
