import { create } from 'zustand';
import { Transaction, Debt, FinancialSummary } from '../types';
import api from '../services/api';

interface FinanceState {
  transactions: Transaction[];
  debts: Debt[];
  summary: FinancialSummary | null;
  isLoading: boolean;
  isFetchingSummary: boolean;
  isFetchingTransactions: boolean;
  isFetchingDebts: boolean;
  error: string | null;

  fetchSummary: (background?: boolean) => Promise<void>;
  fetchTransactions: (params?: { startDate?: string, endDate?: string, type?: string, category?: string }, background?: boolean) => Promise<void>;
  fetchDebts: (background?: boolean) => Promise<void>;
  addTransaction: (data: Partial<Transaction>) => Promise<void>;
  addDebt: (data: Partial<Debt>) => Promise<void>;
  addPayment: (debtId: string, amount: number) => Promise<void>;
  clearError: () => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  debts: [],
  summary: null,
  isLoading: false,
  isFetchingSummary: false,
  isFetchingTransactions: false,
  isFetchingDebts: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchSummary: async (background = false) => {
    if (get().isFetchingSummary) return;
    
    if (!background) set({ isLoading: true });
    set({ isFetchingSummary: true, error: null });
    
    try {
      const summary: any = await api.get('/reports/summary');
      set({ summary: summary.data, isLoading: false, isFetchingSummary: false });
    } catch (error: any) {
      if (error.message?.includes('cancelled')) return;
      set({ error: error.message, isLoading: false, isFetchingSummary: false });
    }
  },

  fetchTransactions: async (params, background = false) => {
    if (get().isFetchingTransactions) return;

    if (!background) set({ isLoading: true });
    set({ isFetchingTransactions: true, error: null });

    try {
      const response: any = await api.get('/transactions', { params });
      set({ transactions: response.data.transactions, isLoading: false, isFetchingTransactions: false });
    } catch (error: any) {
      if (error.message?.includes('cancelled')) return;
      set({ error: error.message, isLoading: false, isFetchingTransactions: false });
    }
  },

  fetchDebts: async (background = false) => {
    if (get().isFetchingDebts) return;

    if (!background) set({ isLoading: true });
    set({ isFetchingDebts: true, error: null });

    try {
      const response: any = await api.get('/debts');
      set({ debts: response.data, isLoading: false, isFetchingDebts: false });
    } catch (error: any) {
      if (error.message?.includes('cancelled')) return;
      set({ error: error.message, isLoading: false, isFetchingDebts: false });
    }
  },

  addTransaction: async (data) => {
    if (get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      await api.post('/transactions', data);
      
      // Refresh data
      const currentFilters = get().transactions.length > 0 ? undefined : undefined; // Simplified for now
      
      await Promise.all([
        get().fetchTransactions(undefined, true),
        get().fetchSummary(true)
      ]);
      set({ isLoading: false });
    } catch (error: any) {
      if (error.message?.includes('cancelled')) return;
      const message = error.message || 'Failed to add transaction';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  addDebt: async (data) => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      await api.post('/debts', data);
      
      set({ isFetchingDebts: false, isFetchingSummary: false });
      
      await Promise.all([
        get().fetchDebts(true),
        get().fetchSummary(true)
      ]);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw new Error(error.message);
    }
  },

  addPayment: async (debtId, amount) => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });
    try {
      await api.post('/payments', { debtId, amount });
      
      set({ isFetchingDebts: false, isFetchingSummary: false });
      
      await Promise.all([
        get().fetchDebts(true),
        get().fetchSummary(true)
      ]);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw new Error(error.message);
    }
  },
}));
