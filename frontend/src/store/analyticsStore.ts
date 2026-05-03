import { create } from 'zustand';
import axios from 'axios';

interface AnalyticsState {
  summary: any;
  monthlyGrowth: any;
  categoryBreakdown: any;
  profitMargin: any;
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  summary: null,
  monthlyGrowth: null,
  categoryBreakdown: null,
  profitMargin: null,
  isLoading: false,
  error: null,
  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const [summaryRes, growthRes, categoryRes, profitRes] = await Promise.all([
        axios.get(`${API_URL}/analytics/summary`, { withCredentials: true }),
        axios.get(`${API_URL}/analytics/monthly-growth`, { withCredentials: true }),
        axios.get(`${API_URL}/analytics/category-breakdown`, { withCredentials: true }),
        axios.get(`${API_URL}/analytics/profit-margin`, { withCredentials: true }),
      ]);
      set({
        summary: summaryRes.data.data,
        monthlyGrowth: growthRes.data.data,
        categoryBreakdown: categoryRes.data.data,
        profitMargin: profitRes.data.data,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch analytics', isLoading: false });
    }
  },
}));
