'use client';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/currency';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  ShoppingBag, 
  User, 
  CreditCard, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronRight, 
  Package, 
  Search,
  Wallet,
  Banknote,
  Info
} from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { useSaleStore } from '@/store/saleStore';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';

import { useTranslation } from 'react-i18next';

export default function SalesPage() {
  const { t } = useTranslation();
  const { products, fetchProducts } = useInventoryStore();
  const { addSale, isLoading: isSaving } = useSaleStore();
  
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerType, setCustomerType] = useState('RETAIL');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity >= product.quantity) {
        toast.error(`${t('sales.only')} ${product.quantity} ${t('sales.unitsAvailable')}`);
        return;
      }
      setCart(cart.map(item => 
        item.productId === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.sellingPrice,
        discount: 0
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const product = products.find(p => p.id === productId);
        const newQty = Math.max(0, item.quantity + delta);
        if (product && newQty > product.quantity) {
          toast.error(`${t('sales.only')} ${product.quantity} ${t('sales.unitsAvailable')}`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalDiscount = parseFloat(discount || '0');
  const totalTax = parseFloat(tax || '0');
  const totalAmount = subtotal - totalDiscount + totalTax;
  const balance = totalAmount - parseFloat(amountPaid || '0');

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error(t('sales.cartEmpty'));
      return;
    }

    if (!customerName) {
      toast.error(t('sales.customerNameRequired'));
      return;
    }

    if (balance > 0 && !dueDate) {
      toast.error(t('sales.dueDateRequired'));
      return;
    }

    try {
      const payload = {
        customerName,
        customerPhone: customerPhone || undefined,
        customerType,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount
        })),
        subtotal,
        tax: totalTax,
        discount: totalDiscount,
        totalAmount,
        amountPaid: parseFloat(amountPaid || '0'),
        paymentMethod,
        channel: 'IN_STORE',
        dueDate: dueDate || undefined
      };

      await addSale(payload);
      toast.success(t('sales.saleSuccess'));
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setAmountPaid('');
      setDiscount('0');
      setTax('0');
      setDueDate('');
    } catch (error: any) {
      toast.error(error.message || t('sales.saleError'));
    }
  };

  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6 pb-24 max-w-lg mx-auto">
        
        {/* 🏷️ Header */}
        <div className="flex items-center justify-between px-1">
           <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">{t('sales.terminalTitle')}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{t('sales.terminalSubtitle')}</p>
           </div>
           <div className="h-10 w-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingBag size={18} />
           </div>
        </div>

        {/* 🔍 Product Selection */}
        <section className="space-y-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('sales.searchPlaceholder')}
                className="w-full bg-white border border-slate-100 shadow-sm rounded-xl py-3 pl-11 pr-4 text-[12px] font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>

           <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 px-1">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.quantity <= 0}
                  className={cn(
                    "flex-none w-[120px] bg-white border border-slate-100 rounded-2xl p-3 shadow-sm active:scale-95 transition-all text-left group",
                    product.quantity <= 0 && "opacity-50 grayscale"
                  )}
                >
                   <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center mb-2 group-hover:bg-blue-50 transition-colors">
                      <Package size={14} className="text-slate-400 group-hover:text-blue-600" />
                   </div>
                   <p className="text-[10px] font-black text-slate-900 leading-tight mb-1 truncate">{product.name}</p>
                   <p className="text-[9px] font-black text-blue-600">{formatCurrency(product.sellingPrice)}</p>
                   <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest mt-1">{product.quantity} {t('sales.inStock')}</p>
                </button>
              ))}
           </div>
        </section>

        {/* 🛒 Cart Items */}
        {cart.length > 0 && (
          <section className="space-y-3">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('sales.orderItems')}</h3>
                <span className="text-[9px] font-black text-blue-600">{cart.length} {t('sales.itemsSelected')}</span>
             </div>
             <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                   {cart.map(item => (
                     <div key={item.productId} className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                           <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                              <Package size={14} />
                           </div>
                           <div>
                              <p className="text-[11px] font-black text-slate-900 leading-none mb-1">{item.productName}</p>
                              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{formatCurrency(item.unitPrice)} / unit</p>
                           </div>
                        </div>
                        <div className="flex items-center space-x-3">
                           <div className="flex items-center bg-slate-50 rounded-lg p-1">
                              <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 text-slate-400 hover:text-slate-900 transition-colors"><Minus size={10} /></button>
                              <span className="w-6 text-center text-[10px] font-black tabular-nums">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 text-slate-400 hover:text-slate-900 transition-colors"><Plus size={10} /></button>
                           </div>
                           <p className="w-16 text-right text-[11px] font-black text-slate-900 tabular-nums">
                              {formatCurrency(item.quantity * item.unitPrice)}
                           </p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </section>
        )}

        {/* 👤 Customer & Payment */}
        <section className="grid grid-cols-1 gap-4">
           <div className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                 <User size={14} className="text-slate-400" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('sales.customerIntel')}</h3>
              </div>
              <div className="space-y-3">
                 <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder={t('sales.customerNamePlaceholder')}
                      required
                      className="bg-slate-50 border-none rounded-xl p-3 text-[10px] font-black outline-none focus:ring-1 focus:ring-blue-100"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder={t('sales.contactPlaceholder')}
                      className="bg-slate-50 border-none rounded-xl p-3 text-[10px] font-black outline-none focus:ring-1 focus:ring-blue-100"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                 </div>
                 <div className="flex p-1 bg-slate-50 rounded-xl">
                    {['RETAIL', 'WHOLESALE', 'REPEAT'].map(st => (
                      <button
                        key={st}
                        onClick={() => setCustomerType(st)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                          customerType === st ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                        )}
                      >
                        {t(`sales.type.${st.toLowerCase()}`)}
                      </button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm space-y-5">
              <div className="flex items-center space-x-2 mb-2">
                 <CreditCard size={14} className="text-slate-400" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('sales.paymentSummary')}</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                 {[
                   { id: 'CASH', label: t('sales.method.cash'), icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-50' },
                   { id: 'BANK', label: t('sales.method.bank'), icon: Banknote, color: 'text-blue-600', bg: 'bg-blue-50' },
                   { id: 'CARD', label: t('sales.method.card'), icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
                 ].map(m => (
                   <button
                     key={m.id}
                     onClick={() => setPaymentMethod(m.id)}
                     className={cn(
                       "flex flex-col items-center justify-center p-3 rounded-xl border transition-all space-y-1.5",
                       paymentMethod === m.id ? "border-slate-900 bg-white shadow-sm scale-[1.02]" : "border-transparent opacity-40 hover:opacity-100"
                     )}
                   >
                      <m.icon size={16} className={m.color} />
                      <span className="text-[8px] font-black uppercase tracking-widest">{m.label}</span>
                   </button>
                 ))}
              </div>

              <div className="space-y-3 pt-2">
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{t('sales.subtotal')}</span>
                    <span className="text-slate-900">{formatCurrency(subtotal)}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{t('sales.tax')} (%)</span>
                    <input 
                      type="number" 
                      className="w-16 bg-slate-50 border-none rounded-lg p-1 text-right text-slate-900 outline-none"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                    />
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{t('sales.discount')} (ETB)</span>
                    <input 
                      type="number" 
                      className="w-16 bg-slate-50 border-none rounded-lg p-1 text-right text-slate-900 outline-none"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                    />
                 </div>
                 <div className="h-px bg-slate-50 w-full" />
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">{t('sales.totalAmount')}</span>
                    <span className="text-lg font-black text-blue-600 tabular-nums">{formatCurrency(totalAmount)}</span>
                 </div>
              </div>

              <div className="pt-2 space-y-3">
                 <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">{t('sales.amountPaidNow')}</label>
                 <div className="relative">
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-slate-900 text-white border-none rounded-2xl py-4 px-6 text-xl font-black tabular-nums outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                       <button 
                        onClick={() => setAmountPaid(totalAmount.toString())}
                        className="text-[8px] font-black uppercase tracking-widest bg-white/10 px-2 py-1 rounded-md hover:bg-white/20"
                       >
                         {t('sales.full')}
                       </button>
                    </div>
                 </div>
                 
                 {balance > 0 && (
                   <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center space-x-2 bg-rose-50 p-3 rounded-xl border border-rose-100">
                         <Info size={12} className="text-rose-600" />
                         <p className="text-[9px] font-bold text-rose-600 uppercase tracking-tight">
                           {t('sales.remaining')} <span className="font-black">{formatCurrency(balance)}</span> {t('sales.debtNotice')}
                         </p>
                      </div>
                      <div className="space-y-1">
                         <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">{t('sales.repaymentDueDate')}</label>
                         <input 
                           type="date" 
                           required
                           className="w-full bg-slate-50 border-none rounded-xl p-3 text-[10px] font-black outline-none focus:ring-1 focus:ring-rose-200"
                           value={dueDate}
                           onChange={(e) => setDueDate(e.target.value)}
                         />
                      </div>
                   </div>
                 )}
              </div>

              <Button 
                onClick={handleCheckout}
                isLoading={isSaving}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100"
              >
                {t('sales.completeSale')} <ChevronRight size={14} className="ml-2" />
              </Button>
           </div>
        </section>

        <div className="py-10 text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-200">{t('sales.footer')}</p>
        </div>

      </div>
    </MainLayout>
  );
}
