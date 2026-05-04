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
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '@/utils/currency';

export const DashboardSummary = () => {
  const { summary, isLoading } = useFinanceStore();
  const { t } = useTranslation();

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
      title: t('dashboard.netProfit'),
      value: formatCurrency(summary?.profit || 0),
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50/50',
    },
    {
      title: t('dashboard.revenue'),
      value: formatCurrency(summary?.totalIncome || 0),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/50',
    },
    {
      title: t('dashboard.expense'),
      value: formatCurrency(summary?.totalExpense || 0),
      icon: TrendingDown,
      color: 'text-rose-600',
      bg: 'bg-rose-50/50',
    },
    {
      title: t('dashboard.pending'),
      value: formatCurrency(summary?.totalReceivable || 0),
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map((item) => (
        <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-50 flex flex-col active:bg-slate-50 transition-colors group">
          <div className={cn('p-2.5 rounded-full w-fit mb-3 transition-transform group-hover:scale-110', item.bg)}>
            <item.icon className={cn('h-5 w-5 stroke-[2.5px]', item.color)} />
          </div>
          <p className="text-[12px] font-bold uppercase tracking-wider text-slate-400 mb-1 leading-none">{item.title}</p>
          <h4 className={cn('text-2xl font-black tabular-nums text-slate-900 leading-none')}>
            {item.value}
          </h4>
        </div>
      ))}
    </div>
  );
};
