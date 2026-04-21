'use client';
import React, { useEffect, useState } from 'react';
import { Plus, Package, AlertTriangle, TrendingUp, Search, Trash2, Edit2, X } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useInventoryStore } from '@/store/inventoryStore';
import { cn } from '@/utils/cn';
import { Product } from '@/types';

export default function InventoryPage() {
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
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Items</p>
              <h4 className="text-xl font-black text-slate-900 tabular-nums">
                {products.reduce((acc, p) => acc + p.quantity, 0)}
              </h4>
           </div>
           
           <div className="bg-white rounded-3xl p-5 border border-slate-50 shadow-sm flex flex-col">
              <div className="p-2.5 rounded-2xl bg-amber-50 w-fit mb-3 text-amber-600">
                 <AlertTriangle size={18} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Low Stock</p>
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
             placeholder="Search items..."
             className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none"
             value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>

        {/* 📦 Product Cards */}
        <div className="flex flex-col space-y-4">
           {filteredProducts.length === 0 && !isLoading ? (
             <div className="py-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">No products found</p>
             </div>
           ) : (
             filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-[2rem] border border-slate-50 shadow-sm p-6 space-y-5 transition-all active:scale-95">
                   <div className="flex items-start justify-between">
                      <div className="flex flex-col">
                         <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{product.name}</h4>
                         <span className={cn(
                           "text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest mt-1 w-fit",
                           product.quantity > 5 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600 animate-pulse"
                         )}>
                            {product.quantity} In Stock
                         </span>
                      </div>
                      <div className="flex space-x-2">
                         <button onClick={() => handleEdit(product)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 active:text-blue-600">
                            <Edit2 size={16} />
                         </button>
                         <button onClick={() => deleteProduct(product.id)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 active:text-rose-600">
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cost Price</p>
                         <p className="text-sm font-bold text-slate-700">{formatCurrency(product.costPrice)}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale Price</p>
                         <p className="text-sm font-black text-blue-600">{formatCurrency(product.sellingPrice)}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between px-1">
                      <div className="flex items-center space-x-1.5 text-blue-600">
                         <TrendingUp size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest">
                            Margin: {Math.round(((product.sellingPrice - product.costPrice) / product.costPrice) * 100)}%
                         </span>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">#{product.id.slice(-4)}</span>
                   </div>
                </div>
             ))
           )}
        </div>

        {/* ➕ FAB for New Product */}
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="fixed bottom-24 right-6 z-40 bg-slate-900 text-white p-4 rounded-full shadow-2xl active:scale-95 transition-all outline-none border-none"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        )}

        {/* 📦 New Product Sheet */}
        {isAdding && (
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex flex-col justify-end">
             <div className="bg-white rounded-t-[3rem] p-8 pb-12 animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">{editingId ? 'Edit Item' : 'New Item'}</h2>
                   <button onClick={resetForm} className="p-2 bg-slate-100 rounded-full text-slate-500">
                      <X size={20} />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-5">
                    <Input 
                      label="Product Name" 
                      placeholder="e.g., Slim Wallet" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                    />
                    
                    <div className="grid grid-cols-1 gap-5">
                       <Input 
                        label="Stock Quantity" 
                        type="number" 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <Input 
                          label="Cost (Buying)" 
                          type="number" 
                          value={costPrice}
                          onChange={(e) => setCostPrice(e.target.value)}
                          required
                          className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                        />
                        <Input 
                          label="Price (Selling)" 
                          type="number" 
                          value={sellingPrice}
                          onChange={(e) => setSellingPrice(e.target.value)}
                          required
                          className="bg-slate-50 border-none px-4 py-4 rounded-2xl"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" className="w-full bg-blue-600 text-white py-8 rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-100">
                      {editingId ? 'Update Stock' : 'Add to Inventory'}
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
