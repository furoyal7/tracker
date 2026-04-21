'use client';
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  Download,
  Calendar
} from 'lucide-react';
import { useFinanceStore } from '@/store/financeStore';
import { FinancialChart } from '@/features/dashboard/FinancialChart';

export default function ReportsPage() {
  const { summary } = useFinanceStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const performanceItems = [
    { label: 'Revenue', value: summary?.totalIncome || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50/50' },
    { label: 'Expenses', value: summary?.totalExpense || 0, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50/50' },
    { label: 'Net Profit', value: summary?.profit || 0, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50/50' },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        
        {/* 📅 Period Selector */}
        <div className="flex items-center justify-between">
           <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-2xl border border-slate-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <Calendar size={14} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-900">This Month</span>
           </div>
           <button className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200 active:scale-90 transition-all">
              <Download size={16} />
           </button>
        </div>

        {/* 📊 Key Performance Stack (Minimized) */}
        <div className="flex flex-col space-y-2.5">
           {performanceItems.map((item) => (
             <div key={item.label} className="bg-white rounded-[1.5rem] p-4 border border-slate-50 shadow-sm flex items-center justify-between transition-all active:scale-[0.99]">
                <div className="flex items-center space-x-3">
                   <div className={`h-8 w-8 flex items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                      <item.icon size={16} strokeWidth={2.5} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 leading-none mb-1.5">{item.label}</p>
                      <h4 className="text-sm font-black text-slate-900 tabular-nums leading-none">
                        {formatCurrency(item.value)}
                      </h4>
                   </div>
                </div>
                <div className="flex items-center text-emerald-600 text-[9px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-full">
                   <ArrowUpRight size={10} className="mr-0.5" />
                   12%
                </div>
             </div>
           ))}
        </div>

        {/* 📈 Main Trajectory Graph */}
        <section className="space-y-4 pt-2">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Growth Analysis</h3>
           <div className="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-sm">
              <FinancialChart />
           </div>
        </section>

        {/* 🥧 Distribution Analysis (Premium Amber) */}
        <div className="bg-amber-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-amber-100/50">
           {/* Decorative background element */}
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl"></div>
           
           <div className="flex items-center space-x-3 mb-8 relative z-10">
              <div className="p-2.5 bg-white/10 rounded-xl">
                 <PieChartIcon size={20} className="text-amber-400" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-[0.1em] text-white">Expense Distribution</h3>
           </div>
           
           <div className="space-y-6 relative z-10">
              {[
                { label: 'Inventory', value: 45, color: 'bg-amber-400' },
                { label: 'Operations', value: 30, color: 'bg-amber-100' },
                { label: 'Marketing', value: 25, color: 'bg-amber-600' },
              ].map((group) => (
                <div key={group.label} className="space-y-2.5">
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.15em]">
                      <span className="text-amber-200/60">{group.label}</span>
                      <span className="text-white">{group.value}%</span>
                   </div>
                   <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${group.color} rounded-full transition-all duration-1000 ease-out`} 
                        style={{ width: `${group.value}%` }}
                      ></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="py-8 text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">Intelligent insights synchronized for today</p>
        </div>

      </div>
    </MainLayout>
  );
}
