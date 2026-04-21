'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, X, ArrowUpRight, ArrowDownRight, Package, Hash, Filter, Calendar, RotateCcw } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFinanceStore } from '@/store/financeStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { cn } from '@/utils/cn';
import { Transaction } from '@/types';

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

  useEffect(() => {
    fetchTransactions();
    fetchProducts();
    
    // Auto-open form if type is provided in URL
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
    e.preventDefault();
    await addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      note,
      productId: productId || undefined,
      quantity: productId ? parseInt(quantity) : undefined,
      date: new Date().toISOString(),
    });
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setAmount('');
    setCategory('');
    setNote('');
    setProductId('');
    setQuantity('1');
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
    t.note?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        
        {/* 🔍 Search & Filter Actions */}
        <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search history..."
                className="w-full bg-white border border-slate-100 shadow-sm rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsFiltering(!isFiltering)}
              className={cn(
                "p-3.5 rounded-2xl border transition-all active:scale-95",
                isFiltering || startDate || endDate
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" 
                  : "bg-white text-slate-400 border-slate-100 shadow-sm"
              )}
            >
               <Filter size={20} />
            </button>
        </div>

        {/* 📅 Date Filter Drawer/Section */}
        {isFiltering && (
           <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm p-6 space-y-5 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center space-x-2 mb-2">
                 <Calendar size={14} className="text-blue-600" />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Custom Date Range</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">From Date</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold outline-none"
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">To Date</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl p-3 text-[10px] font-bold outline-none"
                    />
                 </div>
              </div>
              <div className="flex space-x-2 pt-2">
                <button 
                  onClick={handleApplyFilter}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                >
                  Apply Filter
                </button>
                <button 
                  onClick={handleResetFilter}
                  className="p-3 bg-slate-100 text-slate-500 rounded-xl active:scale-95 transition-all"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
           </div>
        )}

        {/* 🕒 Active Filter Chips */}
        {(startDate || endDate) && !isFiltering && (
           <div className="flex items-center space-x-2 animate-in fade-in duration-300">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full flex items-center">
                 History: {startDate || '...'} to {endDate || 'Today'}
                 <X size={10} className="ml-2 cursor-pointer" onClick={handleResetFilter} />
              </span>
           </div>
        )}

        {/* 📜 Transaction List */}
        <div className="flex flex-col space-y-4">
           {filteredTransactions.length === 0 && !isLoading ? (
             <div className="py-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">No activity logs found</p>
             </div>
           ) : (
             filteredTransactions.map((t) => (
                <div key={t.id} className="bg-white rounded-2xl border-b border-slate-50 p-3 flex flex-col space-y-2.5 transition-all active:bg-slate-50">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "h-7 w-7 rounded-lg flex items-center justify-center",
                          t.type === 'INCOME' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        )}>
                          {t.type === 'INCOME' ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                        </div>
                        <div className="flex flex-col">
                           <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight leading-none">{t.category}</h4>
                           <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1 leading-none">
                             {new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                           </p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className={cn(
                           "text-xs font-black tabular-nums leading-none",
                           t.type === 'INCOME' ? "text-emerald-600" : "text-rose-600"
                         )}>
                           {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                         </p>
                      </div>
                   </div>
                   
                   {(t.note || t.productId) && (
                     <div className="flex items-center justify-between pl-10">
                        {t.note && (
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight italic truncate max-w-[50%]">
                            {t.note}
                          </p>
                        )}
                        {t.productId && (
                          <div className="flex items-center space-x-1 text-blue-500/70 ml-auto">
                             <Package size={8} />
                             <span className="text-[7px] font-black uppercase tracking-widest leading-none">{t.quantity} unit(s)</span>
                          </div>
                        )}
                     </div>
                   )}
                </div>
             ))
           )}
        </div>

        {/* ➕ FAB for New Transaction */}
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="fixed bottom-24 right-6 z-40 bg-blue-600 text-white p-5 rounded-full shadow-[0_8px_30px_rgb(37,99,235,0.4)] active:scale-90 transition-all outline-none border-none animate-in fade-in zoom-in duration-300"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        )}

        {/* 📝 New Transaction Sheet (Orders) */}
        {isAdding && (
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex flex-col justify-end">
             <div className="bg-white rounded-t-[3rem] p-8 pb-12 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">Record Entry</h2>
                   <button onClick={() => setIsAdding(false)} className="p-2 bg-slate-100 rounded-full text-slate-500">
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Type Selector */}
                  <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl w-full">
                    <button
                      type="button"
                      onClick={() => setType('INCOME')}
                      className={cn(
                        "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                        type === 'INCOME' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400"
                      )}
                    >
                      Sale
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('EXPENSE')}
                      className={cn(
                        "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all",
                        type === 'EXPENSE' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"
                      )}
                    >
                      Expense
                    </button>
                  </div>

                  <div className="space-y-5">
                    {/* Amount Input */}
                    <div className="relative">
                       <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="bg-slate-50 border-none px-4 py-8 rounded-2xl text-2xl font-black text-center"
                      />
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">$</span>
                    </div>

                    {/* Linking Option (Product Select) */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center px-1">
                        <Package size={12} className="mr-1.5" /> Link Inventory Item (Optional)
                      </label>
                      <select
                        value={productId}
                        onChange={(e) => handleProductChange(e.target.value)}
                        className="w-full bg-slate-50 border-none px-4 py-4 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Manual Entry (No Product Linked)</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - In Stock: {p.quantity}</option>
                        ))}
                      </select>
                    </div>

                    {productId && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center px-1">
                          <Hash size={12} className="mr-1.5" /> Order Quantity
                        </label>
                        <Input 
                          type="number" 
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                        />
                      </div>
                    )}

                    <Input 
                      label="Category / Item Name" 
                      placeholder="e.g., General Sale, Rent, Supplies" 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                    />

                    <Input 
                      label="Public Note / Note" 
                      placeholder="Optional additional details..." 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                    />
                  </div>

                  <div className="pt-4 pb-4">
                    <Button type="submit" className="w-full bg-blue-600 text-white py-8 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100">
                      Confirm Record
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
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <TransactionsContent />
    </Suspense>
  );
}
