'use client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  Download,
  Calendar,
  Zap,
  ShoppingBag,
  Info,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useFinanceStore } from '@/store/financeStore';
import { FinancialChart } from '@/features/dashboard/FinancialChart';
import { cn } from '@/utils/cn';

export default function ReportsPage() {
  const { t } = useTranslation();
  const { summary } = useFinanceStore();
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const performanceItems = [
    { 
      label: t('reports.totalRevenue'), 
      value: summary?.totalIncome || 0, 
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      description: t('reports.totalSalesDesc')
    },
    { 
      label: t('reports.netExpenses'), 
      value: summary?.totalExpense || 0, 
      icon: TrendingDown, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50',
      description: t('reports.opsCostsDesc')
    },
    { 
      label: t('reports.netProfit'), 
      value: summary?.profit || 0, 
      icon: DollarSign, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      description: `${summary?.profitMargin || 0}% ${t('reports.profitMargin')}`
    },
  ];

  const currentDistribution = activeTab === 'EXPENSE' 
    ? summary?.expenseDistribution || [] 
    : summary?.incomeDistribution || [];

  return (
    <MainLayout>
      <div className="flex flex-col space-y-8 pb-28">
        
        {/* 🔝 Professional Header */}
        <div className="flex items-end justify-between px-1">
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">{t('reports.financialIntelligence')}</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{t('reports.title')}</h1>
           </div>
           <div className="flex space-x-2">
              <button className="h-10 px-4 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm active:scale-95 transition-all flex items-center">
                 <Calendar size={12} className="mr-2" />
                 {t('reports.last7Days')}
              </button>
           </div>
        </div>

        {/* 📈 Primary Metrics Grid */}
        <div className="grid grid-cols-1 gap-4">
           {performanceItems.map((item) => (
             <div key={item.label} className="bg-white rounded-[1.5rem] p-6 border border-slate-50 shadow-sm flex items-center justify-between transition-all group">
                <div className="flex items-center space-x-5">
                   <div className={cn("h-12 w-12 flex items-center justify-center rounded-2xl transition-transform", item.bg, item.color)}>
                      <item.icon size={22} strokeWidth={2.5} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{item.label}</p>
                      <h4 className="text-xl font-black text-slate-900 tabular-nums tracking-tight">
                        {formatCurrency(item.value)}
                      </h4>
                      <p className="text-[9px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{item.description}</p>
                   </div>
                </div>
                <ChevronRight size={16} className="text-slate-100 group-hover:text-slate-300 transition-colors" />
             </div>
           ))}
        </div>

        {/* 🧠 Smart Insights AI (Clean Version) */}
        {summary?.insights && summary.insights.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-2">
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('reports.intelligentAnalysis')}</h3>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">{t('reports.liveUpdates')}</span>
            </div>
            <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
              {summary.insights.map((insight, idx) => (
                <div key={idx} className="flex-none w-[280px] bg-slate-50 border border-slate-100 p-5 rounded-[1.75rem] transition-all hover:bg-white hover:shadow-md group">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1 p-1.5 bg-white rounded-lg shadow-sm">
                      <Info size={14} className="text-slate-900" />
                    </div>
                    <p className="text-[11px] font-bold leading-relaxed text-slate-600">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 📉 Main Growth Chart */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-2">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('reports.growthTrajectory')}</h3>
             <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                   <span className="text-[8px] font-black uppercase text-slate-400">{t('reports.in')}</span>
                </div>
                <div className="flex items-center space-x-1">
                   <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                   <span className="text-[8px] font-black uppercase text-slate-400">{t('reports.out')}</span>
                </div>
             </div>
           </div>
           <div className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm">
              <FinancialChart />
           </div>
        </section>

        {/* 🏆 Top Performance (Sales) - Clean Design */}
        {summary?.topSellingProducts && summary.topSellingProducts.length > 0 && (
          <section className="space-y-4">
             <div className="flex items-center space-x-2 px-2">
                <ShoppingBag size={14} className="text-slate-400" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('reports.salesDrivers')}</h3>
             </div>
             <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                   {summary.topSellingProducts.map((product, idx) => (
                     <div key={product.id} className="flex items-center justify-between p-5 active:bg-slate-50 transition-all">
                        <div className="flex items-center space-x-4">
                           <span className="text-[10px] font-black text-slate-200 tabular-nums">0{idx + 1}</span>
                           <div>
                              <p className="text-[11px] font-black text-slate-900 leading-none mb-1.5">{product.name}</p>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{product.quantity} {t('reports.unitsSold')}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-slate-900 tabular-nums tracking-tight">{formatCurrency(product.revenue)}</p>
                        </div>
                     </div>
                   ))}
                </div>
                <button className="w-full py-4 bg-slate-50 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center justify-center border-t border-slate-100 hover:text-slate-600 transition-colors">
                   {t('reports.viewFullInventory')} <ArrowRight size={10} className="ml-2" />
                </button>
             </div>
          </section>
        )}

        {/* 🥧 Distribution Breakdown - Clean Design */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center space-x-2">
                <PieChartIcon size={14} className="text-slate-400" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('reports.budgetAllocation')}</h3>
             </div>
             <div className="flex p-0.5 bg-slate-100 rounded-lg">
                {(['EXPENSE', 'INCOME'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                      activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                    )}
                  >
                    {tab === 'EXPENSE' ? t('reports.expenses') : t('reports.revenue')}
                  </button>
                ))}
             </div>
          </div>
          
          <div className="bg-white rounded-[2rem] p-8 border border-slate-50 shadow-sm space-y-7">
             {currentDistribution.length > 0 ? currentDistribution.map((group, idx) => (
                <div key={group.label} className="space-y-3">
                   <div className="flex justify-between items-end px-1">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-900">{group.label}</span>
                        <span className="block text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-1">{formatCurrency(group.amount)}</span>
                      </div>
                      <span className="text-[12px] font-black text-slate-900 tabular-nums">{group.value}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000 ease-out",
                          activeTab === 'EXPENSE' ? "bg-rose-500" : "bg-emerald-500"
                        )} 
                        style={{ width: `${group.value}%` }}
                      ></div>
                   </div>
                </div>
             )) : (
                <div className="py-10 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-200 italic">{t('reports.noHistoricalData')}</p>
                </div>
             )}
          </div>
        </section>

        <div className="py-10 text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-200">{t('reports.systemIntelligence')} • {new Date().getFullYear()}</p>
        </div>

      </div>
    </MainLayout>
  );
}
