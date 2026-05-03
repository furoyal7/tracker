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
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
  const { fetchSummary, fetchTransactions } = useFinanceStore();
  const { fetchProducts } = useInventoryStore();
  const { isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
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
      <div className="flex flex-col space-y-8 max-w-lg mx-auto">
        
        {/* 📊 Financial Summary (Flat Cards) */}
        <section className="space-y-3 px-4">
          <div className="flex items-center justify-between">
             <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400">{t('dashboard.summary')}</h3>
          </div>
          <DashboardSummary />
        </section>

        {/* 🛠️ Quick Actions */}
        <section className="space-y-3 px-4">
           <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400">{t('dashboard.quickActions')}</h3>
           <QuickActions />
        </section>

        {/* 📉 Performance */}
        <section className="space-y-3 px-4">
          <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400">{t('dashboard.performance')}</h3>
          <div className="bg-white rounded-2xl p-4 border border-slate-50">
            <FinancialChart />
          </div>
        </section>

        {/* 📋 Recent Activity (Telegram List) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[13px] font-bold uppercase tracking-widest text-slate-400">{t('dashboard.recentTransactions')}</h3>
            <Link href="/transactions" className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
              {t('common.seeAll')}
            </Link>
          </div>
          <div className="bg-white border-y border-slate-50 overflow-hidden">
             <RecentTransactions />
          </div>
        </section>

        <div className="py-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">{t('common.secured')}</p>
        </div>
      </div>
    </MainLayout>
  );
}
