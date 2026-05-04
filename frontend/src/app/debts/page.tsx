'use client';
import React, { useEffect, useState } from 'react';
import { formatCurrency } from '@/utils/currency';
import { useTranslation } from 'react-i18next';
import { Plus, CheckCircle, AlertCircle, Phone, CreditCard, X } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFinanceStore } from '@/store/financeStore';
import { cn } from '@/utils/cn';
import { Debt } from '@/types';

export default function DebtsPage() {
  const { t } = useTranslation();
  const { debts, isLoading, fetchDebts, addDebt, addPayment } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'UNPAID' | 'OVERDUE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // New Debt form
  const [type, setType] = useState<'RECEIVABLE' | 'PAYABLE'>('RECEIVABLE');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const handleSubmitDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDebt({
      type,
      name,
      phone,
      totalAmount: parseFloat(totalAmount),
      dueDate,
    });
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setTotalAmount('');
    setDueDate('');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDebtId) {
      await addPayment(selectedDebtId, parseFloat(paymentAmount));
      setSelectedDebtId(null);
      setPaymentAmount('');
    }
    setIsAdding(true);
  };

  const preventInvalidChars = (e: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const filteredDebts = debts.filter((debt) => {
    const matchesStatus = filterStatus === 'ALL' || debt.status === filterStatus;
    const matchesSearch = debt.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (debt.phone && debt.phone.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        
        {/* 🔝 Filter Chips */}
        {/* 🔝 Filter Chips (Professional Index) */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1 pt-2">
          {['ALL', 'UNPAID', 'OVERDUE', 'PAID'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] transition-all active:scale-95",
                filterStatus === status 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-100" 
                  : "bg-white text-slate-400 border border-slate-50 shadow-sm"
              )}
            >
              {t(`debts.filter${status.charAt(0) + status.slice(1).toLowerCase()}`)}
            </button>
          ))}
        </div>

        {/* 📋 Debt Ledger (Telegram Style) */}
        <div className="flex flex-col bg-white overflow-hidden border-y border-slate-50">
          {filteredDebts.length === 0 && !isLoading ? (
            <div className="py-20 text-center">
              <p className="text-[14px] text-slate-400">{t('debts.noRecords')}</p>
            </div>
          ) : (
            filteredDebts.map((debt, index) => (
              <div 
                key={debt.id} 
                className={cn(
                  "flex items-center justify-between px-4 py-3 active:bg-slate-100 transition-colors cursor-pointer",
                  index !== 0 && "border-t border-slate-50"
                )}
                onClick={() => debt.status !== 'PAID' && setSelectedDebtId(debt.id)}
              >
                 <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {/* Left: Status Icon */}
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                      debt.type === 'RECEIVABLE' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                    )}>
                       {debt.type === 'RECEIVABLE' ? <CreditCard size={20} strokeWidth={2.5} /> : <AlertCircle size={20} strokeWidth={2.5} />}
                    </div>

                    {/* Center: Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[16px] font-bold text-slate-900 truncate pr-2">{debt.name}</p>
                        <p className="text-[16px] font-bold text-blue-600 shrink-0">
                          {formatCurrency(debt.remainingAmount)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <div className="flex items-center space-x-2">
                           <span className={cn(
                             "text-[12px] font-medium",
                             debt.status === 'PAID' ? "text-emerald-600" : 
                             debt.status === 'OVERDUE' ? "text-rose-600" : "text-slate-400"
                           )}>
                              {t(`debts.filter${debt.status.charAt(0).toUpperCase() + debt.status.slice(1).toLowerCase()}`)}
                           </span>
                        </div>
                        <p className="text-[11px] text-slate-400 shrink-0 italic">
                          {t('debts.due')}: {new Date(debt.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* ➕ FAB (Telegram Style) */}
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="fixed bottom-24 right-6 z-40 bg-blue-600 text-white h-14 w-14 rounded-full shadow-[0_8px_30px_rgba(37,99,235,0.4)] flex items-center justify-center active:scale-90 transition-all border-none animate-in zoom-in duration-300"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        )}

        {/* 📝 New Debt Sheet */}
        {isAdding && (
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex flex-col justify-end">
             <div className="bg-white rounded-t-[3rem] p-8 pb-12 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">{t('debts.newDebt')}</h2>
                   <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={handleSubmitDebt} className="space-y-6">
                  <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl w-full">
                    <button
                      type="button"
                      onClick={() => setType('RECEIVABLE')}
                      className={cn(
                        "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                        type === 'RECEIVABLE' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
                      )}
                    >
                      Receivable
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('PAYABLE')}
                      className={cn(
                        "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                        type === 'PAYABLE' ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                      )}
                    >
                      Payable
                    </button>
                  </div>

                  <div className="space-y-5">
                    <Input 
                      label="Person Name" 
                      placeholder="e.g., John Smith" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                    />
                    <div className="grid grid-cols-2 gap-4">
                       <Input 
                        label="Amount" 
                        type="number" 
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        onKeyDown={preventInvalidChars}
                        required
                        className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                      />
                      <Input 
                        label="Due Date" 
                        type="date" 
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-blue-600 text-white py-8 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100">
                      Save Record
                    </Button>
                  </div>
                </form>
             </div>
          </div>
        )}

        {/* 💵 Payment Modal Overlay */}
        {selectedDebtId && (
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-6">
             <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 animate-in zoom-in-95 duration-200">
                <div className="text-center space-y-2 mb-8">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">{t('debts.quickPay')}</p>
                   <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">{t('debts.recordPayment')}</h2>
                </div>
                
                <form onSubmit={handleSubmitPayment} className="space-y-6">
                   <div className="relative">
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        className="bg-slate-50 border-none text-center text-2xl font-black py-8 rounded-3xl h-24"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        onKeyDown={preventInvalidChars}
                        autoFocus
                        required
                      />
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">ETB</span>
                   </div>

                   <div className="flex flex-col space-y-3">
                      <Button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                        Submit Payment
                      </Button>
                      <Button variant="ghost" onClick={() => setSelectedDebtId(null)} className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        Cancel
                      </Button>
                   </div>
                </form>
             </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
