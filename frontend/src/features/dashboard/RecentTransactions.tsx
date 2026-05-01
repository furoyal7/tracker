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
    <div className="flex flex-col divide-y divide-slate-50">
      {transactions.slice(0, 8).map((transaction: Transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-center justify-between p-4 active:bg-slate-50 transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center",
              transaction.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            )}>
              {transaction.type === 'INCOME' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">
                {transaction.partyName || transaction.category}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                {transaction.partyName && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-100" />
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none">
                      {transaction.category}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <p className={cn(
            "text-sm font-black tabular-nums leading-none",
            transaction.type === 'INCOME' ? "text-emerald-600" : "text-rose-600"
          )}>
            {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </p>
        </div>
      ))}
    </div>
  );
};
