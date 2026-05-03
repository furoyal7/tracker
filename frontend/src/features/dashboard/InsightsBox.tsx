'use client';
import React from 'react';
import { Lightbulb, Info, Sparkles } from 'lucide-react';
import { useFinanceStore } from '@/store/financeStore';

export const InsightsBox = () => {
  const { summary } = useFinanceStore();
  const insights = summary?.insights || [];

  return (
    <div className="bg-white rounded-[2.5rem] p-8 relative overflow-hidden shadow-sm border border-slate-50">
      <div className="absolute top-0 right-0 p-8 opacity-5">
         <Sparkles size={40} className="text-slate-900" />
      </div>
      
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-xl">
           <Lightbulb size={20} className="text-blue-600" />
        </div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Smart Business Insights</h3>
      </div>

      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-slate-500 text-center">
            <Info className="h-6 w-6 mb-3 opacity-32" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              Register more transactions to unlock AI insights.
            </p>
          </div>
        ) : (
          insights.map((insight, index) => {
            let iconColor = "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.2)]";
            if (insight.type === 'positive') iconColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]";
            else if (insight.type === 'warning') iconColor = "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]";
            else if (insight.type === 'danger') iconColor = "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.2)]";

            return (
              <div 
                key={index} 
                className="flex items-start p-5 rounded-3xl bg-slate-50/50 border border-slate-50 active:bg-slate-50 transition-all"
              >
                <div className={`mt-1.5 h-2 w-2 rounded-full ${iconColor} mr-4 shrink-0`}></div>
                <div>
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">{insight.title}</h4>
                  <p className="text-xs font-medium text-slate-500 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
