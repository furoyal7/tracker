'use client';
import React, { useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardSummary } from '@/features/dashboard/DashboardSummary';
import { useFinanceStore } from '@/store/financeStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useAuthStore } from '@/store/authStore';
import { RecentTransactions } from '@/features/dashboard/RecentTransactions';
import { QuickActions } from '@/features/dashboard/QuickActions';
import { FinancialChart } from '@/features/dashboard/FinancialChart';
import Link from 'next/link';
import exchangeService from '@/services/exchangeService';
import { ExchangeOrder } from '@/types';
import { Repeat, Clock, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const { fetchSummary, fetchTransactions } = useFinanceStore();
  const { fetchProducts } = useInventoryStore();
  const { isAuthenticated } = useAuthStore();
  const [activeSession, setActiveSession] = React.useState<ExchangeOrder | null>(null);
  const isSyncing = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || isSyncing.current) return;
    
    const controller = new AbortController();
    isSyncing.current = true;

    const initDashboard = async () => {
      try {
        await Promise.all([
          fetchSummary(),
          fetchTransactions(),
          fetchProducts()
        ]);

        // Check for active exchange sessions
        const response: any = await exchangeService.getUserOrders();
        if (!controller.signal.aborted) {
          const active = response.data?.find((o: any) => 
            ['pending', 'proof_uploaded', 'under_review', 'ready_for_confirmation', 'confirmed'].includes(o.status)
          );
          if (active) setActiveSession(active);
        }
      } catch (e: any) {
        if (!controller.signal.aborted) {
          console.error('[Dashboard] Sync failed:', e.message);
        }
      } finally {
        isSyncing.current = false;
      }
    };

    initDashboard();

    return () => {
      controller.abort();
      isSyncing.current = false;
    };
  }, [fetchSummary, fetchTransactions, fetchProducts, isAuthenticated]);

  return (
    <MainLayout>
      <div className="flex flex-col space-y-10">
        
        {/* 📊 Financial Summary */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Financial Pulse</h3>
             <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">REALTIME</span>
          </div>
          <DashboardSummary />
        </section>

        {/* 🛠️ Quick Actions */}
        <section className="space-y-4">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Merchant Core</h3>
           <QuickActions />
        </section>

        {/* 📉 Performance */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Growth Trajectory</h3>
          <div className="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-[0_4px_20px_-1px_rgba(0,0,0,0.01)] transition-all hover:shadow-xl hover:shadow-blue-50/50">
            <FinancialChart />
          </div>
        </section>

        {/* 🔃 Exchange Pulse (Contextual) */}
        {activeSession && (
          <section className="space-y-4 animate-ingress">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Exchange Pulse</h3>
                <Link href="/exchange" className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:underline">Manage All</Link>
             </div>
             <Link href={`/exchange/${activeSession.id}`} className="block">
                <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl shadow-indigo-100/20 relative overflow-hidden group active:scale-95 transition-all">
                   <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                      <Repeat size={80} strokeWidth={1} className="text-white" />
                   </div>
                   <div className="relative z-10 flex items-center justify-between">
                      <div className="space-y-2">
                         <div className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Active Session</span>
                         </div>
                         <h4 className="text-sm font-black text-white uppercase tracking-tight">#{activeSession.referenceCode}</h4>
                         <div className="flex items-center space-x-3 pt-1">
                            <div className="flex items-center space-x-1.5">
                               <Clock size={10} className="text-slate-500" />
                               <span className="text-[8px] font-black text-slate-500 uppercase">{activeSession.status.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                               <ShieldCheck size={10} className="text-slate-500" />
                               <span className="text-[8px] font-black text-slate-500 uppercase">L2 SECURE</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Value</p>
                         <p className="text-lg font-black text-white leading-none">
                            {activeSession.expectedReceiveAmount.toLocaleString()} <span className="text-[10px] text-indigo-400">{activeSession.toCurrency}</span>
                         </p>
                      </div>
                   </div>
                </div>
             </Link>
          </section>
        )}

        {/* 📋 Recent Activity */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Activity Feed</h3>
            <Link href="/transactions" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">
              View History
            </Link>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-50 overflow-hidden shadow-sm">
             <RecentTransactions />
          </div>
        </section>

        {/* 🛠️ Maintenance Info */}
        <div className="py-6 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-200">End-to-End Encryption Active</p>
        </div>

      </div>
    </MainLayout>
  );
}
