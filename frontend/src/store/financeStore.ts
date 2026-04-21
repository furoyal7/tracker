import { create } from 'zustand';
import { Transaction, Debt, FinancialSummary } from '../types';
import api from '../services/api';

interface FinanceState {
  transactions: Transaction[];
  debts: Debt[];
  summary: FinancialSummary | null;
  isLoading: boolean;
  error: string | null;

  fetchSummary: () => Promise<void>;
  fetchTransactions: (params?: { startDate?: string, endDate?: string, type?: string, category?: string }) => Promise<void>;
  fetchDebts: () => Promise<void>;
  addTransaction: (data: Partial<Transaction>) => Promise<void>;
  addDebt: (data: Partial<Debt>) => Promise<void>;
  addPayment: (debtId: string, amount: number) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  debts: [],
  summary: null,
  isLoading: false,
  error: null,

  fetchSummary: async () => {
    set({ isLoading: true });
    try {
      const summary = await api.get('/reports/summary');
      set({ summary: summary.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchTransactions: async (params?: { startDate?: string, endDate?: string, type?: string, category?: string }) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/transactions', { params });
      set({ transactions: response.data.transactions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchDebts: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/debts');
      set({ debts: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTransaction: async (data) => {
    set({ isLoading: true });
    try {
      await api.post('/transactions', data);
      await get().fetchTransactions();
      await get().fetchSummary();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addDebt: async (data) => {
    set({ isLoading: true });
    try {
      await api.post('/debts', data);
      await get().fetchDebts();
      await get().fetchSummary();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addPayment: async (debtId, amount) => {
    set({ isLoading: true });
    try {
      await api.post('/payments', { debtId, amount });
      await get().fetchDebts();
      await get().fetchSummary();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
}));
