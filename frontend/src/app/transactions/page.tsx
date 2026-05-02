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

function TransactionsContent() {
  const { transactions, isLoading, fetchTransactions, addTransaction } = useFinanceStore();
  const { products, fetchProducts } = useInventoryStore();
  const searchParams = useSearchParams();
  const [isAdding, setIsAdding] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
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
      toast.error('Please enter a valid positive amount');
      return;
    }

    try {
      // 1. Mandatory Field Validation
      if (type === 'INCOME' && !partyName) {
        toast.error('Customer name is required for sales tracking');
        return;
      }

      if ((paymentMethod === 'BANK' || paymentMethod === 'CARD') && !reference) {
        toast.error(`Reference number is required for ${paymentMethod.toLowerCase()} payments`);
        return;
      }

      if (!category) {
        toast.error('Please select or enter a category');
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
      toast.success(`${type === 'INCOME' ? 'Sale' : 'Expense'} recorded successfully`);
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
                placeholder="Search records..."
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
                 <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-900">Custom Date Range</h4>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">Start</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-lg p-2.5 text-[9px] font-bold outline-none"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">End</label>
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
                Apply Filter
              </button>
           </div>
        )}

        {/* 📜 Transaction List */}
        <div className="flex flex-col space-y-2.5">
           {filteredTransactions.length === 0 && !isLoading ? (
             <div className="py-20 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">No entries recorded</p>
             </div>
           ) : (
             filteredTransactions.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-50 p-3.5 flex flex-col space-y-2.5 shadow-sm active:bg-slate-50 transition-colors">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          t.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {t.type === 'INCOME' ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                        </div>
                        <div className="flex flex-col">
                           <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none">{t.partyName || t.category}</h4>
                           <div className="flex items-center space-x-1.5 mt-1">
                             <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                               {new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                             </span>
                             {t.paymentMethod && (
                               <span className="text-[7px] font-black text-slate-200 uppercase tracking-widest">
                                 | {t.paymentMethod}
                               </span>
                             )}
                           </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className={cn(
                           "text-[13px] font-black tabular-nums leading-none",
                           t.type === 'INCOME' ? "text-emerald-600" : "text-rose-600"
                         )}>
                           {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                         </p>
                         {t.reference && (
                           <p className="text-[6px] font-bold text-slate-300 uppercase tracking-widest mt-1">#{t.reference}</p>
                         )}
                      </div>
                   </div>
                   
                   {(t.note || t.productId) && (
                     <div className="flex items-center justify-between pl-11 pt-2 border-t border-slate-50/50">
                        <p className="text-[8px] font-medium text-slate-400 italic truncate max-w-[65%]">
                          {t.note || t.category}
                        </p>
                        {t.productId && (
                          <div className="flex items-center space-x-1 text-blue-500/60">
                             <Package size={8} />
                             <span className="text-[7px] font-black uppercase tracking-widest">{t.quantity}qty</span>
                          </div>
                        )}
                     </div>
                   )}
                </div>
             ))
           )}
        </div>

        {/* ➕ FAB */}
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="fixed bottom-24 right-6 z-40 bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl active:scale-90 transition-all border-none"
          >
            <Plus size={20} strokeWidth={3} />
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
               className="bg-white rounded-t-[2.5rem] p-6 pb-12 animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto no-scrollbar shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.1)] relative z-[10001]"
               onClick={(e) => {
                 e.stopPropagation(); // Stop click from hitting the backdrop
               }}
             >
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-sm font-black uppercase tracking-tight text-slate-900">Add Entry</h2>
                   <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-50 rounded-full text-slate-400">
                      <X size={16} />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Type Selector */}
                  <div className="flex items-center p-1 bg-slate-50 rounded-xl w-full">
                    {['INCOME', 'EXPENSE'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t as any)}
                        className={cn(
                          "flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                          type === t 
                            ? "bg-white shadow-sm " + (t === 'INCOME' ? "text-emerald-600" : "text-rose-600")
                            : "text-slate-400"
                        )}
                      >
                        {t === 'INCOME' ? 'Sale' : 'Expense'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {/* Amount Input */}
                    <div className="relative group">
                       <input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="w-full bg-slate-50 border-none px-4 py-6 rounded-xl text-xl font-black text-center focus:ring-1 focus:ring-blue-100 outline-none"
                      />
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-slate-200 group-focus-within:text-slate-400">$</span>
                    </div>

                    {/* Professional Info Group */}
                    <div className="bg-slate-50/50 rounded-xl p-3.5 space-y-3.5">
                       <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Business Details</label>
                       
                       <div className="grid grid-cols-3 gap-2">
                          {paymentMethods.map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setPaymentMethod(m.id)}
                              className={cn(
                                "flex items-center justify-center space-x-2 py-2 px-1 rounded-lg border transition-all",
                                paymentMethod === m.id ? "bg-white border-slate-900 shadow-sm" : "border-transparent opacity-50"
                              )}
                            >
                               <m.icon size={12} className={m.color.split(' ')[1]} />
                               <span className="text-[8px] font-black uppercase">{m.label}</span>
                            </button>
                          ))}
                       </div>

                       <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                             <label className="text-[7px] font-black uppercase tracking-widest text-slate-400 px-1">{type === 'INCOME' ? 'Customer' : 'Supplier'}</label>
                             <input 
                               type="text"
                               placeholder="..."
                               value={partyName}
                               onChange={(e) => setPartyName(e.target.value)}
                               className="w-full bg-white border border-slate-100 rounded-lg p-2.5 text-[9px] font-bold outline-none"
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[7px] font-black uppercase tracking-widest text-slate-400 px-1">Ref No.</label>
                             <input 
                               type="text"
                               placeholder="..."
                               value={reference}
                               onChange={(e) => setReference(e.target.value)}
                               className="w-full bg-white border border-slate-100 rounded-lg p-2.5 text-[9px] font-bold outline-none"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-3.5">
                      {/* Product Selector */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">Link Inventory</label>
                        <select
                          value={productId}
                          onChange={(e) => handleProductChange(e.target.value)}
                          className="w-full bg-slate-50 border-none p-3 rounded-lg text-[10px] font-bold outline-none"
                        >
                          <option value="">No link</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.quantity})</option>
                          ))}
                        </select>
                      </div>

                      {productId && (
                        <div className="space-y-1 animate-in fade-in duration-200">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">Quantity</label>
                          <input 
                            type="number" 
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full bg-slate-50 border-none p-3 rounded-lg text-[10px] font-bold outline-none"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
                          <input 
                            type="text" 
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g., Sale"
                            className="w-full bg-slate-50 border-none p-3 rounded-lg text-[10px] font-bold outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">Note</label>
                          <input 
                            type="text" 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="..."
                            className="w-full bg-slate-50 border-none p-3 rounded-lg text-[10px] font-bold outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      isLoading={isLoading}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md shadow-blue-100"
                    >
                      Save Record
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
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Journal...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
