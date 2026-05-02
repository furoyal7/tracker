import { create } from 'zustand';
import api from '../services/api';
import { Product } from '../types';

interface InventoryState {
  products: Product[];
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  fetchProducts: (background?: boolean) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  isLoading: false,
  isFetching: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchProducts: async (background = false) => {
    if (get().isFetching) return;

    if (!background) set({ isLoading: true });
    set({ isFetching: true, error: null });
    
    try {
      const response: any = await api.get('/products');
      set({ products: response.data || [], isLoading: false, isFetching: false });
    } catch (error: any) {
      if (error.message?.includes('cancelled')) return;
      set({ error: error.message, isLoading: false, isFetching: false });
    }
  },

  addProduct: async (productData) => {
    if (get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      await api.post('/products', productData);
      set({ isFetching: false }); // Allow refresh
      await get().fetchProducts(true);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw new Error(error.message);
    }
  },

  updateProduct: async (id, productData) => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      await api.put(`/products/${id}`, productData);
      set({ isFetching: false });
      await get().fetchProducts(true);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw new Error(error.message);
    }
  },

  deleteProduct: async (id) => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      await api.delete(`/products/${id}`);
      set({ isFetching: false });
      await get().fetchProducts(true);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw new Error(error.message);
    }
  },
}));
