'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { Plus, ArrowRight, Clock, CheckCircle2, XCircle, Search, AlertCircle, Repeat, History } from 'lucide-react';
import { cn } from '@/utils/cn';
import exchangeService from '@/services/exchangeService';
import { ExchangeOrder } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

export default function ExchangeOrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState<ExchangeOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response: any = await exchangeService.getUserOrders();
      setOrders(response.data || []);
    } catch (error: any) {
      if (error._isCancelled) return;
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' };
      case 'proof_uploaded': return { icon: Search, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Uploaded' };
      case 'ready_for_confirmation': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Verified' };
      case 'under_review': return { icon: AlertCircle, color: 'text-orange-600', bg: 'bg-orange-50', label: 'Review' };
      case 'confirmed': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Confirmed' };
      case 'rejected': return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Rejected' };
      case 'completed': return { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Done' };
      default: return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-50', label: status };
    }
  };

  const formatCurrencyValue = (val: number, cur: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur === 'USDT' ? 'USD' : cur,
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <MainLayout>
      <div className="flex flex-col space-y-8 pb-10">
        
        {/* Elite Header */}
        <div className="flex items-center justify-between px-1">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Ledger</h3>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Exchange</h1>
          </div>
          <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex items-center gap-2">
            <History size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">{orders.length} Sessions</span>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-3">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-[2rem] bg-slate-50 border border-slate-100" />
              ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center space-y-4">
             <div className="bg-slate-50 p-6 rounded-[2.5rem]">
               <Repeat size={40} className="text-slate-300" />
             </div>
             <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-300">No exchange history detected</p>
             <Button onClick={() => router.push('/exchange/create')} className="bg-blue-600 rounded-2xl px-8">Initiate Session</Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const config = getStatusConfig(order.status);
              return (
                <button 
                  key={order.id} 
                  className="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-[0_4px_20px_-1px_rgba(0,0,0,0.01)] flex flex-col space-y-4 active:scale-95 transition-all text-left"
                  onClick={() => router.push(`/exchange/${order.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn("p-2.5 rounded-2xl", config.bg)}>
                        <config.icon className={cn("h-5 w-5 stroke-[2.5px]", config.color)} />
                      </div>
                      <div className="flex flex-col">
                         <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none">#{order.referenceCode}</h4>
                         <span className={cn("text-[7px] font-black uppercase tracking-widest mt-1", config.color)}>
                            {config.label}
                         </span>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Initiated</p>
                       <p className="text-[9px] font-black text-slate-900 italic font-mono leading-none lowercase">
                         {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 bg-slate-50/50 rounded-2xl px-4 border border-slate-50">
                    <div className="flex flex-col">
                       <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1.5">Deposit</span>
                       <span className="text-lg font-black text-slate-900 leading-none">{order.amount} <span className="text-[10px] opacity-40">{order.fromCurrency}</span></span>
                    </div>
                    <ArrowRight size={14} className="text-slate-200" />
                    <div className="flex flex-col text-right">
                       <span className="text-[7px] font-black text-blue-500 uppercase tracking-[0.2em] leading-none mb-1.5">Receive</span>
                       <span className="text-lg font-black text-blue-600 leading-none">
                         {order.expectedReceiveAmount.toLocaleString()} <span className="text-[10px] opacity-40">{order.toCurrency}</span>
                       </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Floating FAB for New Order */}
        {!loading && orders.length > 0 && (
          <button 
            onClick={() => router.push('/exchange/create')}
            className="fixed bottom-24 right-6 z-40 bg-blue-600 text-white p-5 rounded-full shadow-[0_8px_30px_rgb(37,99,235,0.4)] active:scale-90 transition-all outline-none border-none animate-in fade-in zoom-in duration-300"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        )}

      </div>
    </MainLayout>
  );
}
