'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, X, ArrowUpRight, ArrowDownRight, Package, Hash, Filter, Calendar, RotateCcw, CreditCard, Wallet, Banknote, User, ReceiptText, Tag } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFinanceStore } from '@/store/financeStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { cn } from '@/utils/cn';
import { Transaction } from '@/types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

function TransactionsContent() {
  const { transactions, isLoading, fetchTransactions, addTransaction } = useFinanceStore();
  const { products, fetchProducts } = useInventoryStore();
  const searchParams = useSearchParams();
  const [isAdding, setIsAdding] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { t, i18n } = useTranslation();
  
  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form state
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [partyName, setPartyName] = useState('');
  const [reference, setReference] = useState('');

  // Auto-open form if type is provided in URL
  useEffect(() => {
    fetchTransactions();
    fetchProducts();
    
    const typeParam = searchParams.get('type');
    if (typeParam === 'INCOME' || typeParam === 'EXPENSE') {
      setType(typeParam);
      setIsAdding(true);
    }
  }, [fetchTransactions, fetchProducts, searchParams]);

  const handleApplyFilter = () => {
    fetchTransactions({ startDate, endDate });
    setIsFiltering(false);
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchTransactions();
    setIsFiltering(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // NUCLEAR PREVENTION OF REDIRECTS
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.nativeEvent) {
        e.nativeEvent.stopImmediatePropagation();
        e.nativeEvent.preventDefault();
      }
    }
    
    console.log('[TRACE] Form Submission Started - REDIRECTS BLOCKED');
    
    if (isLoading) {
      console.log('[TRACE] Submission blocked: Already loading');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast.error(t('transactions.validAmountError'));
      return;
    }

    try {
      // 1. Mandatory Field Validation
      if (type === 'INCOME' && !partyName) {
        toast.error(t('transactions.customerRequiredError'));
        return;
      }

      if ((paymentMethod === 'BANK' || paymentMethod === 'CARD') && !reference) {
        toast.error(`Reference number is required for ${paymentMethod.toLowerCase()} payments`);
        return;
      }

      if (!category) {
        toast.error(t('transactions.categoryRequiredError'));
        return;
      }

      const payload = {
        type,
        amount: numericAmount,
        category: category || (type === 'INCOME' ? 'Sale' : 'Expense'),
        note: note || undefined,
        productId: productId || undefined,
        quantity: productId ? parseInt(quantity) : undefined,
        paymentMethod,
        partyName: partyName || undefined,
        reference: reference || undefined,
        date: new Date().toISOString(),
      };
      
      console.log('[TRACE] Sending Payload:', payload);
      const result = await addTransaction(payload);
      
      console.log('[TRACE] Success Response Received:', result);
      setIsAdding(false);
      resetForm();
      toast.success(t(`transactions.${type.toLowerCase()}Recorded`));
    } catch (err: any) {
      if (err._isCancelled) return;
      console.error('[TRACE] Submission Failed:', err);
      toast.error(err.message || 'Failed to record entry');
    }
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setNote('');
    setProductId('');
    setQuantity('1');
    setPaymentMethod('CASH');
    setPartyName('');
    setReference('');
  };

  const preventInvalidChars = (e: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Sync amount with selected product if it's an Income/Sale
  const handleProductChange = (id: string) => {
    setProductId(id);
    if (id && type === 'INCOME') {
      const product = products.find(p => p.id === id);
      if (product) {
        setAmount((product.sellingPrice * parseInt(quantity || '1')).toString());
        setCategory(product.name);
      }
    }
  };

  // Sync amount when quantity changes for a product
  useEffect(() => {
    if (productId && type === 'INCOME') {
      const product = products.find(p => p.id === productId);
      if (product) {
        setAmount((product.sellingPrice * parseInt(quantity || '1')).toString());
      }
    }
  }, [quantity, productId, type, products]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredTransactions = (transactions || []).filter((t: Transaction) => 
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.partyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paymentMethods = [
    { id: 'CASH', label: 'Cash', icon: Wallet, color: 'bg-orange-50 text-orange-600' },
    { id: 'BANK', label: 'Bank', icon: Banknote, color: 'bg-blue-50 text-blue-600' },
    { id: 'CARD', label: 'Card', icon: CreditCard, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <MainLayout>
      <div className="flex flex-col space-y-4 pb-24">
        
        {/* 🔍 Search & Filter Actions */}
        <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('transactions.searchPlaceholder')}
                className="w-full bg-white border border-slate-100 shadow-sm rounded-xl py-2.5 pl-10 pr-4 text-[12px] font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsFiltering(!isFiltering)}
              className={cn(
                "p-2.5 rounded-xl border transition-all active:scale-95",
                isFiltering || startDate || endDate
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                  : "bg-white text-slate-400 border-slate-100 shadow-sm"
              )}
            >
               <Filter size={16} />
            </button>
        </div>

        {/* 📅 Date Filter */}
        {isFiltering && (
           <div className="bg-white rounded-[1.5rem] border border-slate-50 shadow-sm p-4 space-y-3 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-2 mb-1">
                 <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Calendar size={12} className="text-blue-600" />
                 </div>
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-900">{t('transactions.customDateRange')}</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">{t('common.start')}</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-lg p-2.5 text-[9px] font-bold outline-none"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">{t('common.end')}</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-lg p-2.5 text-[9px] font-bold outline-none"
                    />
                 </div>
              </div>
              <button 
                onClick={handleApplyFilter}
                className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
              >
                {t('transactions.applyFilter')}
              </button>
           </div>
        )}

        {/* 📜 Transaction List (Telegram Style) */}
        <div className="flex flex-col bg-white overflow-hidden">
           {filteredTransactions.length === 0 && !isLoading ? (
             <div className="py-20 text-center">
                <p className="text-[14px] text-slate-400">{t('transactions.noTransactions')}</p>
             </div>
           ) : (
             filteredTransactions.map((t, index) => (
                <div 
                  key={t.id} 
                  className={cn(
                    "flex items-center justify-between px-4 py-3 active:bg-slate-100 transition-colors cursor-pointer",
                    index !== 0 && "border-t border-slate-50"
                  )}
                >
                   <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {/* Left: Category Icon */}
                      <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                        t.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {t.type === 'INCOME' ? <ArrowUpRight size={20} strokeWidth={2.5} /> : <ArrowDownRight size={20} strokeWidth={2.5} />}
                      </div>

                      {/* Center: Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[16px] font-semibold text-slate-900 truncate pr-2">
                            {t.partyName || t.category}
                          </p>
                          <p className={cn(
                            "text-[16px] font-bold tabular-nums shrink-0",
                            t.type === 'INCOME' ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <div className="flex items-center space-x-2 truncate pr-4">
                            <span className="text-[13px] text-slate-500 truncate">{t.category}</span>
                            {t.paymentMethod && (
                              <span className="text-[11px] text-slate-300 font-medium uppercase tracking-wider">{t.paymentMethod}</span>
                            )}
                          </div>
                          <p className="text-[12px] text-slate-400 shrink-0">
                            {new Intl.DateTimeFormat(i18n.language === 'am' ? 'am-ET' : 'en-US', {
                              month: 'short',
                              day: 'numeric'
                            }).format(new Date(t.date))}
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

        {/* 📝 New Transaction Sheet */}
        {isAdding && (
          <div 
            className="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-sm flex flex-col justify-end pointer-events-auto touch-none"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('[TRACE] Backdrop Clicked - Closing Sheet');
              setIsAdding(false);
            }}
          >
             <div 
                className="bg-white rounded-t-[2.5rem] p-8 pb-12 animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto no-scrollbar shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)] relative z-[10001]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                 <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
                 
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{t('transactions.newEntry')}</h2>
                    <button onClick={() => setIsAdding(false)} className="p-2 text-slate-300">
                       <X size={24} />
                    </button>
                 </div>
 
                   <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-full">
                      {['INCOME', 'EXPENSE'].map((tVal) => (
                        <button
                          key={tVal}
                          type="button"
                          onClick={() => setType(tVal as any)}
                          className={cn(
                            "flex-1 py-3 text-[13px] font-bold rounded-xl transition-all",
                            type === tVal 
                              ? "bg-white text-blue-600 shadow-sm" 
                              : "text-slate-500"
                          )}
                        >
                          {t(`transactions.${tVal.toLowerCase()}`)}
                        </button>
                      ))}
                    </div>
 
                    <div className="space-y-6">
                      <div className="space-y-2">
                         <label className="text-[12px] font-bold text-slate-400 px-1">{t('transactions.amount')}</label>
                         <div className="relative">
                           <input 
                             type="number" 
                             inputMode="decimal"
                             step="0.01"
                             placeholder="0.00" 
                             value={amount}
                             onChange={(e) => setAmount(e.target.value)}
                             onKeyDown={preventInvalidChars}
                             required
                             className="w-full bg-slate-50 border-none px-6 py-6 rounded-2xl text-3xl font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                           />
                           <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300">$</span>
                         </div>
                      </div>
 
                      <div className="space-y-6 bg-slate-50/30 rounded-[2rem] p-2">
                         <Input 
                           label={t('transactions.customer')} 
                           placeholder={t('transactions.customerPlaceholder')} 
                           value={partyName}
                           onChange={(e) => setPartyName(e.target.value)}
                           className="bg-white border-none px-4 py-4 rounded-xl"
                         />
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[12px] font-bold text-slate-400 px-1">{t('transactions.category')}</label>
                              <input 
                                type="text" 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder={t('transactions.categoryPlaceholder')}
                                className="w-full bg-white border-none p-4 rounded-xl text-[14px] font-medium outline-none focus:ring-2 focus:ring-blue-50"
                                required
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[12px] font-bold text-slate-400 px-1">{t('transactions.paymentMethod')}</label>
                              <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full bg-white border-none p-4 rounded-xl text-[14px] font-medium outline-none focus:ring-2 focus:ring-blue-50"
                              >
                                <option value="CASH">{t('transactions.cash')}</option>
                                <option value="BANK">{t('transactions.bank')}</option>
                                <option value="CARD">{t('transactions.card')}</option>
                              </select>
                           </div>
                         </div>
 
                         <Input 
                           label={t('transactions.notes')} 
                           placeholder={t('transactions.notesPlaceholder')} 
                           value={note}
                           onChange={(e) => setNote(e.target.value)}
                           className="bg-white border-none px-4 py-4 rounded-xl"
                         />
                      </div>
                    </div>
 
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        isLoading={isLoading}
                        className="w-full bg-blue-600 text-white py-8 rounded-3xl text-sm font-bold shadow-2xl shadow-blue-200 active:scale-95 transition-all"
                      >
                        {t('transactions.save')}
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

export default function TransactionsPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">{t('transactions.loadingJournal')}</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
