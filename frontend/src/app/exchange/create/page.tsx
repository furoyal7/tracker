'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { ArrowLeft, Repeat, Coins, Zap, ShieldCheck, ArrowDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import exchangeService from '@/services/exchangeService';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function CreateExchangeOrder() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fromCurrency: 'USDT',
    toCurrency: 'NGN',
    amount: '',
    exchangeRate: '1550',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response: any = await exchangeService.createOrder({
        fromCurrency: formData.fromCurrency,
        toCurrency: formData.toCurrency,
        amount: parseFloat(formData.amount),
        exchangeRate: parseFloat(formData.exchangeRate),
      });
      toast.success('Order session initialized');
      router.push(`/exchange/${response.data.id}`);
    } catch (error: any) {
      if (error._isCancelled) return;
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const expectedAmount = parseFloat(formData.amount || '0') * parseFloat(formData.exchangeRate || '0');

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6 pb-12">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-50 text-slate-400 active:scale-90 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Merchant Hub</h3>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">New Session</h1>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-50 shadow-[0_4px_30px_-1px_rgba(37,99,235,0.03)] p-8 space-y-8 animate-ingress">
          
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Currency Selectors */}
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Deposit Asset</label>
                  <div className="relative group">
                    <select
                      className="w-full bg-slate-50 border-none px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
                      value={formData.fromCurrency}
                      onChange={(e) => setFormData({ ...formData, fromCurrency: e.target.value })}
                    >
                      <option value="USDT">USDT (Tether)</option>
                      <option value="USD">USD (Cash)</option>
                      <option value="EUR">EUR (Euro)</option>
                    </select>
                    <Coins className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 pointer-events-none" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Payout Asset</label>
                  <div className="relative group">
                    <select
                      className="w-full bg-slate-50 border-none px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
                      value={formData.toCurrency}
                      onChange={(e) => setFormData({ ...formData, toCurrency: e.target.value })}
                    >
                      <option value="NGN">NGN (Naira)</option>
                      <option value="KES">KES (Shilling)</option>
                      <option value="GHS">GHS (Cedi)</option>
                    </select>
                    <Zap className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 pointer-events-none" />
                  </div>
               </div>
            </div>

            {/* Large Amount Input */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 text-center block">Amount to Exchange</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="bg-slate-50 border-none px-6 py-10 rounded-[2rem] text-4xl font-black text-center text-slate-900 placeholder:text-slate-200"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-slate-300 tracking-tighter">{formData.fromCurrency}</span>
              </div>
            </div>

            {/* Rate Adjustment */}
            <div className="space-y-3 flex flex-col items-center">
               <div className="h-6 w-[1px] bg-slate-100"></div>
               <div className="bg-slate-50 px-4 py-2 rounded-full flex items-center space-x-2 border border-slate-100">
                  <Repeat size={12} className="text-blue-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Rate</span>
                  <input
                    type="number"
                    value={formData.exchangeRate}
                    onChange={(e) => setFormData({ ...formData, exchangeRate: e.target.value })}
                    className="bg-transparent border-none text-[10px] font-black text-slate-900 w-16 text-center outline-none"
                    required
                  />
               </div>
               <div className="h-6 w-[1px] bg-slate-100"></div>
            </div>

            {/* Preview Card */}
            {formData.amount && (
              <div className="p-1 bg-emerald-50 rounded-[2rem] overflow-hidden">
                <div className="bg-white border border-emerald-100/50 rounded-[1.8rem] p-6 flex flex-col items-center space-y-2">
                   <p className="text-[8px] font-black uppercase tracking-[0.3em] text-emerald-600/60 flex items-center gap-1.5">
                     <ArrowDown size={10} /> Yield Estimate
                   </p>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
                     {expectedAmount.toLocaleString()}
                   </h2>
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{formData.toCurrency} Total</p>
                </div>
              </div>
            )}

            <div className="pt-4 space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-10 rounded-3xl font-black uppercase text-xs tracking-[0.25em] shadow-xl shadow-blue-100 active:scale-95 transition-all" 
                disabled={loading}
              >
                {loading ? 'Initializing...' : 'Start Session'}
              </Button>
              <div className="flex items-center justify-center space-x-2 opacity-40">
                <ShieldCheck size={12} className="text-slate-900" />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">Protected by L2 Audit</span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
