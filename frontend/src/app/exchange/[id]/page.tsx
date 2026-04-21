'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  ExternalLink, 
  ArrowLeft, 
  Copy, 
  ShieldCheck, 
  CreditCard,
  FileText,
  Fingerprint,
  Info
} from 'lucide-react';
import { cn } from '@/utils/cn';
import exchangeService from '@/services/exchangeService';
import { ExchangeOrder } from '@/types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const BANK_DETAILS = {
  bankName: 'First Global Bank',
  accountNumber: '1234567890',
  accountName: 'Antigravity Exchange Services',
  swiftCode: 'AGEXUS22'
};

export default function OrderDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<ExchangeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [senderInfo, setSenderInfo] = useState({
    senderName: '',
    amountSent: '',
    referenceUsed: ''
  });

  const fetchOrder = async () => {
    try {
      const response: any = await exchangeService.getOrder(id);
      const data = response.data;
      setOrder(data);
      if (data && data.status === 'pending') {
        setSenderInfo(prev => ({ ...prev, referenceUsed: data.referenceCode }));
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a receipt image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('proof', file);
      formData.append('senderName', senderInfo.senderName);
      formData.append('amountSent', senderInfo.amountSent);
      formData.append('referenceUsed', senderInfo.referenceUsed);

      await exchangeService.uploadProof(id, formData);
      toast.success('Audit session initiated');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing...</div>;
  if (!order) return <div className="p-8 text-center">Session not found.</div>;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': return { color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock, label: 'Awaiting Payment' };
      case 'proof_uploaded': return { color: 'text-blue-600', bg: 'bg-blue-50', icon: Search, label: 'Audit in Progress' };
      case 'ready_for_confirmation': return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: ShieldCheck, label: 'L2 Verified' };
      case 'under_review': return { color: 'text-orange-600', bg: 'bg-orange-50', icon: Fingerprint, label: 'Manual Review' };
      case 'confirmed': return { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2, label: 'Payment Confirmed' };
      case 'rejected': return { color: 'text-rose-600', bg: 'bg-rose-50', icon: AlertCircle, label: 'Session Declined' };
      case 'completed': return { color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2, label: 'Exchange Complete' };
      default: return { color: 'text-slate-600', bg: 'bg-slate-100', icon: Clock, label: status };
    }
  };

  const status = getStatusConfig(order.status);

  return (
    <MainLayout>
      <div className="flex flex-col space-y-8 pb-10">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-4">
            <button onClick={() => router.push('/exchange')} className="p-3 bg-white rounded-2xl shadow-sm border border-slate-50 text-slate-400 active:scale-90 transition-all">
              <ArrowLeft size={20} />
            </button>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order Interface</p>
              <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">#{order.referenceCode}</h1>
            </div>
          </div>
          <div className={cn("px-4 py-2 rounded-2xl flex items-center gap-2", status.bg)}>
            <status.icon size={14} className={status.color} />
            <span className={cn("text-[9px] font-black uppercase tracking-widest", status.color)}>{status.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 animate-ingress">
          
          {/* Summary Module */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm space-y-6">
             <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                <div className="space-y-1.5">
                   <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Exchange Value</p>
                   <h2 className="text-3xl font-black tracking-tighter tabular-nums leading-none">
                     {order.amount.toLocaleString()} <span className="text-[12px] uppercase opacity-30">{order.fromCurrency}</span>
                   </h2>
                </div>
                <div className="text-right space-y-1.5">
                   <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 leading-none">Expected Yield</p>
                   <h2 className="text-3xl font-black tracking-tighter tabular-nums leading-none text-blue-600">
                     {order.expectedReceiveAmount.toLocaleString()} <span className="text-[12px] uppercase opacity-30">{order.toCurrency}</span>
                   </h2>
                </div>
             </div>
             
             {order.status === 'pending' && (
               <div className="bg-slate-900 rounded-3xl p-8 space-y-6 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                     <ShieldCheck size={120} strokeWidth={1} />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center space-x-2">
                       <CreditCard size={14} className="text-blue-400" />
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Secure Payment Channel</h3>
                    </div>
                    
                    <div className="grid gap-5">
                       {[
                         { label: 'Bank', val: BANK_DETAILS.bankName },
                         { label: 'A/C Number', val: BANK_DETAILS.accountNumber, copy: true },
                         { label: 'A/C Name', val: BANK_DETAILS.accountName },
                         { label: 'Network Ref', val: order.referenceCode, copy: true, accent: true }
                       ].map((item) => (
                         <div key={item.label} className="flex flex-col space-y-1.5">
                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "font-black tracking-widest",
                                item.accent ? "text-blue-400 text-lg" : "text-white text-sm"
                              )}>{item.val}</span>
                              {item.copy && (
                                <button onClick={() => copyToClipboard(item.val)} className="p-2 transition-colors text-slate-600 hover:text-white active:scale-90">
                                  <Copy size={16} />
                                </button>
                              )}
                            </div>
                         </div>
                       ))}
                    </div>
                    
                    <div className="pt-2 flex items-center space-x-2 opacity-50">
                       <Info size={12} />
                       <p className="text-[8px] font-black uppercase tracking-widest leading-none">Include Network Ref in transfer memo</p>
                    </div>
                  </div>
               </div>
             )}
          </div>

          {/* Audit & Proof Module */}
          <div className="space-y-6">
             {order.status === 'pending' ? (
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm space-y-8">
                   <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-slate-900" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Verification Hub</h3>
                   </div>
                   
                   <form onSubmit={handleUpload} className="space-y-8">
                      <div className="grid gap-6">
                        <Input 
                          label="Sender Legal Name" 
                          placeholder="AS APPEARS ON BANK STATEMENT" 
                          value={senderInfo.senderName}
                          onChange={(e) => setSenderInfo({...senderInfo, senderName: e.target.value})}
                          required 
                          className="bg-slate-50 border-none px-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input 
                            label="Exact Amount" 
                            type="number" 
                            placeholder={order.amount.toString()}
                            value={senderInfo.amountSent}
                            onChange={(e) => setSenderInfo({...senderInfo, amountSent: e.target.value})}
                            required 
                            className="bg-slate-50 border-none px-4 py-4 rounded-2xl text-[11px] font-black"
                          />
                          <Input 
                            label="Reference Code" 
                            placeholder="EXCH-XXXX" 
                            value={senderInfo.referenceUsed}
                            onChange={(e) => setSenderInfo({...senderInfo, referenceUsed: e.target.value})}
                            required 
                            className="bg-slate-50 border-none px-4 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest"
                          />
                        </div>
                        
                        <div className="space-y-2">
                           <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Proof Transmission</label>
                           <div className="relative border-2 border-dashed border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center space-y-3 bg-slate-50 group hover:border-blue-200 transition-colors">
                              <Search size={24} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{file ? file.name : 'Select Receipt Artifact'}</p>
                              <input 
                                type="file" 
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                required 
                              />
                           </div>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-blue-600 text-white py-10 rounded-3xl font-black uppercase text-xs tracking-[0.25em] shadow-xl shadow-blue-100" 
                        disabled={uploading}
                      >
                        {uploading ? 'Transmitting...' : 'Initialize Audit'}
                      </Button>
                   </form>
                </div>
             ) : (
                <div className="grid gap-6">
                   {/* Visual Proof */}
                   <div className="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Transmission Artifact</h3>
                         <button 
                            className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5"
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${order.proof?.imageUrl}`, '_blank')}
                          >
                            <ExternalLink size={12} /> Expand
                         </button>
                      </div>
                      {order.proof && (
                        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
                           <img 
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${order.proof.imageUrl}`} 
                              alt="Audit Proof" 
                              className="w-full h-auto aspect-video object-cover"
                           />
                        </div>
                      )}
                   </div>

                   {/* L2 System Logs */}
                   <div className="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm space-y-6">
                      <div className="flex items-center space-x-2">
                        <Fingerprint size={16} className="text-slate-900" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">System Audit Logs</h3>
                      </div>
                      <div className="space-y-4">
                        {order.logs?.map((log, i) => (
                          <div key={i} className={cn(
                            "p-5 rounded-3xl flex items-center justify-between transition-all",
                            log.result === 'matched' ? "bg-emerald-50 border border-emerald-100/50" : "bg-rose-50 border border-rose-100/50"
                          )}>
                             <div className="space-y-1.5">
                               <p className={cn(
                                 "text-[10px] font-black uppercase tracking-widest leading-none",
                                 log.result === 'matched' ? "text-emerald-600" : "text-rose-600"
                               )}>Validation Result: {log.result}</p>
                               <div className="flex items-center space-x-2 opacity-50">
                                  <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest">Ref: {log.checkedReference}</p>
                                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                  <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest">Val: {log.checkedAmount}</p>
                               </div>
                             </div>
                             {log.result === 'matched' ? (
                               <CheckCircle2 size={24} className="text-emerald-600" />
                             ) : (
                               <AlertCircle size={24} className="text-rose-600" />
                             )}
                          </div>
                        ))}
                      </div>
                   </div>

                   {order.status === 'under_review' && (
                     <div className="bg-amber-900 rounded-3xl p-6 flex items-start space-x-4 border border-amber-800 shadow-xl shadow-amber-100/50 text-white animate-pulse">
                        <AlertCircle className="text-amber-400 shrink-0" size={24} />
                        <div className="space-y-1">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Manual review Required</p>
                           <p className="text-[11px] font-black opacity-80 leading-relaxed uppercase tracking-tight">System audit detected discrepancies. High-level merchant review in progress.</p>
                        </div>
                     </div>
                   )}
                </div>
             )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
