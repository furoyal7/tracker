'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Package, AlertTriangle, TrendingUp, Search, Trash2, Edit2, X } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useInventoryStore } from '@/store/inventoryStore';
import { cn } from '@/utils/cn';
import { Product } from '@/types';

import { useTranslation } from 'react-i18next';

export default function InventoryPage() {
  const { t } = useTranslation();
  const { products, isLoading, fetchProducts, addProduct, updateProduct, deleteProduct } = useInventoryStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      quantity: parseInt(quantity),
      costPrice: parseFloat(costPrice),
      sellingPrice: parseFloat(sellingPrice),
    };

    if (editingId) {
      await updateProduct(editingId, data);
    } else {
      await addProduct(data);
    }

    resetForm();
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setQuantity('');
    setCostPrice('');
    setSellingPrice('');
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setQuantity(product.quantity.toString());
    setCostPrice(product.costPrice.toString());
    setSellingPrice(product.sellingPrice.toString());
    setIsAdding(true);
  };

  const preventInvalidChars = (e: React.KeyboardEvent) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProducts = (products || []).filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex flex-col space-y-6">
        
        {/* 📊 Stock Overview Tiles */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-sm flex flex-col">
              <div className="p-2.5 rounded-2xl bg-blue-50 w-fit mb-3 text-blue-600">
                 <Package size={18} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('inventory.totalItems')}</p>
              <h4 className="text-xl font-black text-slate-900 tabular-nums">
                {products.reduce((acc, p) => acc + p.quantity, 0)}
              </h4>
           </div>
           
           <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-sm flex flex-col">
              <div className="p-2.5 rounded-2xl bg-amber-50 w-fit mb-3 text-amber-600">
                 <AlertTriangle size={18} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t('inventory.lowStock')}</p>
              <h4 className="text-xl font-black text-rose-600 tabular-nums">
                {products.filter(p => p.quantity < 5).length}
              </h4>
           </div>
        </div>

        {/* 🔍 Search bar */}
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
           <input 
             type="text" 
             placeholder={t('inventory.searchItems')}
             className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>

        {/* 📋 Inventory List (Telegram Style) */}
        <div className="flex flex-col bg-white overflow-hidden border-y border-slate-50">
           {filteredProducts.length === 0 && !isLoading ? (
             <div className="py-20 text-center">
                <p className="text-[14px] text-slate-400">{t('inventory.noItems')}</p>
             </div>
           ) : (
             filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className={cn(
                    "flex items-center justify-between px-4 py-3 active:bg-slate-100 transition-colors cursor-pointer",
                    index !== 0 && "border-t border-slate-50"
                  )}
                  onClick={() => handleEdit(product)}
                >
                   <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {/* Left: Circle Icon */}
                      <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                        product.quantity > 5 ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
                      )}>
                        <Package size={20} strokeWidth={2.5} />
                      </div>

                      {/* Center: Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[16px] font-bold text-slate-900 truncate pr-2">
                            {product.name}
                          </p>
                          <p className="text-[16px] font-bold text-blue-600 shrink-0">
                            {formatCurrency(product.sellingPrice)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <div className="flex items-center space-x-2">
                            <span className={cn(
                              "text-[12px] font-medium",
                              product.quantity > 5 ? "text-emerald-600" : "text-rose-600"
                            )}>
                              {product.quantity} {t('inventory.unitsLeft')}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 shrink-0">
                            {t('inventory.cost')}: {formatCurrency(product.costPrice)}
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

        {/* 📦 New Product Sheet */}
        {isAdding && (
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex flex-col justify-end">
             <div className="bg-white rounded-t-[3rem] p-8 pb-12 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">{editingId ? t('inventory.editItem') : t('inventory.newItem')}</h2>
                   <button onClick={resetForm} className="p-2 bg-slate-100 rounded-full text-slate-500">
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-5">
                    <Input 
                      label={t('inventory.productName')} 
                      placeholder={t('inventory.productNamePlaceholder')} 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                    />
                    
                    <div className="grid grid-cols-1 gap-5">
                       <Input 
                        label={t('inventory.stockQuantity')} 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        onKeyDown={preventInvalidChars}
                        required
                        className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          label={t('inventory.costBuying')} 
                          type="number" 
                          value={costPrice}
                          onChange={(e) => setCostPrice(e.target.value)}
                          onKeyDown={preventInvalidChars}
                          required
                          className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                        />
                        <Input 
                          label={t('inventory.priceSelling')} 
                          type="number" 
                          value={sellingPrice}
                          onChange={(e) => setSellingPrice(e.target.value)}
                          onKeyDown={preventInvalidChars}
                          required
                          className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-blue-600 text-white py-8 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100">
                      {editingId ? t('inventory.updateStock') : t('inventory.addToInventory')}
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
