'use client';
import React, { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useInsightStore } from '@/store/insightStore';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, PieChart as PieChartIcon, 
  Activity, AlertCircle, ArrowUpRight, Zap, Info, ShieldAlert
} from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function InsightsPage() {
  const { t } = useTranslation();
  const { insights, isLoading, fetchInsights } = useInsightStore();

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (isLoading && !insights) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="h-12 w-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Analyzing Business Intel...</p>
        </div>
      </MainLayout>
    );
  }

  const kpis = insights?.kpis || {};
  const cashFlow = insights?.cashFlowTrend || [];
  const breakdown = insights?.expenseBreakdown || [];

  return (
    <MainLayout>
      <div className="flex flex-col space-y-8 pb-28">
        
        {/* 🚀 AI Header */}
        <div className="flex items-end justify-between px-1">
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Advanced Business Intelligence</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">📊 Insights Engine</h1>
           </div>
           <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl border border-emerald-100">
              <Zap size={18} fill="currentColor" />
           </div>
        </div>

        {/* 📈 Smart KPI Grid */}
        <div className="grid grid-cols-2 gap-4">
           {/* Growth Card */}
           <div className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Monthly Growth</p>
                 <div className="flex items-center space-x-2">
                    <h4 className={cn(
                      "text-2xl font-black tracking-tighter",
                      kpis.growthRate >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {kpis.growthRate > 0 ? '+' : ''}{kpis.growthRate || 0}%
                    </h4>
                    {kpis.growthRate >= 0 ? <TrendingUp size={16} className="text-emerald-400" /> : <TrendingDown size={16} className="text-rose-400" />}
                 </div>
              </div>
              <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                 <Activity size={80} strokeWidth={3} />
              </div>
           </div>

           {/* Margin Card */}
           <div className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Profit Margin</p>
                 <div className="flex items-center space-x-2">
                    <h4 className="text-2xl font-black tracking-tighter text-blue-600">
                      {kpis.profitMargin || 0}%
                    </h4>
                    <ArrowUpRight size={16} className="text-blue-400" />
                 </div>
              </div>
              <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                 <TrendingUp size={80} strokeWidth={3} />
              </div>
           </div>
        </div>

        {/* 🛡️ Risk Assessment */}
        <div className={cn(
          "rounded-[2rem] p-6 border flex items-center justify-between shadow-sm",
          kpis.debtRisk === 'HIGH' ? "bg-rose-50 border-rose-100" : 
          kpis.debtRisk === 'MODERATE' ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
        )}>
           <div className="flex items-center space-x-4">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
                kpis.debtRisk === 'HIGH' ? "bg-rose-500 text-white" : 
                kpis.debtRisk === 'MODERATE' ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
              )}>
                 <ShieldAlert size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Debt Risk Assessment</p>
                 <h4 className="text-lg font-black uppercase tracking-tight">
                   {kpis.debtRisk || 'LOW'} RISK
                 </h4>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-bold opacity-40 uppercase mb-1">Unpaid Balance</p>
              <p className="text-sm font-black tabular-nums">{formatCurrency(kpis.totalUnpaidDebt)}</p>
           </div>
        </div>

        {/* 📊 Cash Flow Trend (Line Chart) */}
        <section className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Cash Flow Intelligence</h3>
              <div className="flex items-center space-x-3">
                 <div className="flex items-center space-x-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    <span className="text-[8px] font-black uppercase text-slate-400">Income</span>
                 </div>
                 <div className="flex items-center space-x-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    <span className="text-[8px] font-black uppercase text-slate-400">Expense</span>
                 </div>
              </div>
           </div>
           <div className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm h-64">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={cashFlow}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    />
                    <YAxis 
                      hide 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      dot={false} 
                      activeDot={{ r: 6, strokeWidth: 0 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#f43f5e" 
                      strokeWidth={4} 
                      dot={false} 
                      activeDot={{ r: 6, strokeWidth: 0 }} 
                    />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </section>

        {/* 🥧 Expense Breakdown (Pie Chart) */}
        <div className="grid grid-cols-1 gap-6">
           <section className="space-y-4">
              <div className="flex items-center space-x-2 px-2">
                 <PieChartIcon size={14} className="text-slate-400" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Expense Allocation</h3>
              </div>
              <div className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm flex flex-col items-center">
                 <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                            data={breakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="amount"
                            nameKey="category"
                          >
                            {breakdown.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => formatCurrency(Number(value))}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
                 
                 <div className="w-full mt-6 space-y-3">
                    {breakdown.slice(0, 4).map((item: any, idx: number) => (
                       <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                             <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{item.category}</span>
                          </div>
                          <span className="text-[10px] font-black text-slate-900">{Math.round(item.percentage)}%</span>
                       </div>
                    ))}
                 </div>
              </div>
           </section>
        </div>

        {/* 💡 Smart Recommendation */}
        <div className="bg-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden">
           <div className="relative z-10 space-y-4">
              <div className="flex items-center space-x-2">
                 <Info size={16} className="text-blue-200" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">System Recommendation</p>
              </div>
              <p className="text-lg font-bold leading-tight">
                {kpis.growthRate > 10 
                  ? "Business is scaling rapidly. Consider increasing inventory of top-selling items to meet demand." 
                  : kpis.profitMargin < 15 
                  ? "Profit margins are thinning. Review operational expenses and consider adjusting pricing strategy."
                  : "Stable performance detected. Good time to focus on customer retention and long-term debt collection."}
              </p>
           </div>
           <div className="absolute -right-4 -bottom-4 opacity-10">
              <Zap size={120} fill="currentColor" />
           </div>
        </div>

        <div className="py-10 text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-200">End-to-End Business Intel Engine</p>
        </div>

      </div>
    </MainLayout>
  );
}
