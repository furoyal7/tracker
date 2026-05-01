import { create } from 'zustand';
import api from '@/services/api';

interface SaleItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

interface Sale {
  id: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  balance: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

interface SaleStore {
  sales: Sale[];
  isLoading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
  addSale: (saleData: any) => Promise<void>;
}

export const useSaleStore = create<SaleStore>((set) => ({
  sales: [],
  isLoading: false,
  error: null,

  fetchSales: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/sales');
      set({ sales: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addSale: async (saleData) => {
    set({ isLoading: true });
    try {
      await api.post('/sales', saleData);
      const response = await api.get('/sales');
      set({ sales: response.data.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
