'use client';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useFinanceStore } from '@/store/financeStore';

export const FinancialChart = () => {
  const { summary } = useFinanceStore();
  const [isMounted, setIsMounted] = React.useState(false);
  const data = summary?.chartData || [];

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="w-full h-[350px] mt-6 bg-slate-50/50 animate-pulse rounded-3xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[350px] mt-6 items-center justify-center text-slate-400 border border-dashed border-slate-100 rounded-3xl">
        No performance data available
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] mt-6 relative" style={{ minWidth: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
            dy={15}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
            tickFormatter={(value) => `$${value}`}
            width={60}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              padding: '12px'
            }}
            itemStyle={{ fontWeight: 800, fontSize: '12px' }}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#059669"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorIncome)"
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#dc2626"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorExpense)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>

  );
};
