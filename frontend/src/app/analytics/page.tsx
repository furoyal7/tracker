'use client';
import React, { useEffect } from 'react';
import { formatCurrency } from '@/utils/currency';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAnalyticsStore } from '@/store/analyticsStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart2, Activity } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsPage() {
  const { summary, monthlyGrowth, categoryBreakdown, profitMargin, isLoading, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6 pb-28 px-4 pt-6">
        
        <div className="flex flex-col">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">Advanced Insights</p>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics</h1>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-slate-400 mb-2">
              <Activity size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Growth</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{monthlyGrowth?.growth || 0}%</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-slate-400 mb-2">
              <TrendingUp size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Margin</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{profitMargin?.margin || 0}%</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-slate-400 mb-2">
              <BarChart2 size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Income</span>
            </div>
            <p className="text-xl font-black text-emerald-600">{formatCurrency(summary?.income || 0)}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-slate-400 mb-2">
              <PieChartIcon size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Expense</span>
            </div>
            <p className="text-xl font-black text-rose-600">{formatCurrency(summary?.expense || 0)}</p>
          </div>
        </div>

        {/* Line Chart: Monthly Growth */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center"><Activity size={16} className="mr-2 text-blue-500" /> Monthly Growth Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyGrowth?.history || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `${val} ETB`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pie Chart: Categories */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center"><PieChartIcon size={16} className="mr-2 text-purple-500" /> Expense Categories</h2>
            <div className="h-64 flex items-center justify-center">
              {(!categoryBreakdown || categoryBreakdown.length === 0) ? (
                <p className="text-sm text-slate-400">No data available</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="amount"
                      nameKey="category"
                    >
                      {categoryBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(Number(value))}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bar Chart: Income vs Expense */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center"><BarChart2 size={16} className="mr-2 text-amber-500" /> Income vs Expense Overview</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitMargin ? [{ name: 'Overview', Income: profitMargin.income, Expense: profitMargin.expense }] : []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `${val} ETB`} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
