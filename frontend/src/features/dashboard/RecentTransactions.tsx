'use client';
import React from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { cn } from '@/utils/cn';
import { Transaction } from '@/types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const RecentTransactions = () => {
  const { transactions, isLoading } = useFinanceStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading && transactions.length === 0) {
    return (
      <div className="flex flex-col">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse border-b border-slate-50" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white">
      {transactions.slice(0, 10).map((transaction: Transaction, index) => (
        <div 
          key={transaction.id} 
          className={cn(
            "flex items-center justify-between px-4 py-3 active:bg-slate-100 transition-colors cursor-pointer",
            index !== 0 && "border-t border-slate-50"
          )}
        >
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {/* Left: Category Icon (Telegram style circle) */}
            <div className={cn(
              "h-11 w-11 rounded-full flex items-center justify-center shrink-0",
              transaction.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {transaction.type === 'INCOME' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
            </div>

            {/* Center: Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-bold text-slate-900 truncate pr-2">
                  {transaction.partyName || transaction.category}
                </p>
                <p className={cn(
                  "text-[15px] font-bold tabular-nums shrink-0",
                  transaction.type === 'INCOME' ? "text-emerald-600" : "text-rose-600"
                )}>
                  {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-[13px] text-slate-500 truncate">
                  {transaction.category}{transaction.note ? ` • ${transaction.note}` : ''}
                </p>
                <p className="text-[11px] text-slate-400 shrink-0">
                  {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
