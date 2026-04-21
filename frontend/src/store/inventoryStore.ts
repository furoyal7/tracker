import { create } from 'zustand';
import api from '../services/api';
import { Product } from '../types';

interface InventoryState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response: any = await api.get('/products');
      set({ products: response.data || [], isLoading: false });

    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addProduct: async (productData) => {
    set({ isLoading: true });
    try {
      await api.post('/products', productData);
      await get().fetchProducts();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true });
    try {
      await api.put(`/products/${id}`, productData);
      await get().fetchProducts();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/products/${id}`);
      await get().fetchProducts();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
