import { create } from 'zustand';
import api from '../services/api';

interface InsightsState {
  insights: any | null;
  isLoading: boolean;
  error: string | null;
  fetchInsights: () => Promise<void>;
}

export const useInsightStore = create<InsightsState>((set) => ({
  insights: null,
  isLoading: false,
  error: null,
  fetchInsights: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/insights');
      set({ 
        insights: response.data.data, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch insights', 
        isLoading: false 
      });
    }
  },
}));
