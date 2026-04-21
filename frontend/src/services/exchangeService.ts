import api from './api';
import { ExchangeOrder } from '../types';

export const exchangeService = {
  createOrder: async (data: {
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    exchangeRate: number;
  }): Promise<ExchangeOrder> => {
    return api.post('/exchange/create', data);
  },

  getUserOrders: async (): Promise<ExchangeOrder[]> => {
    return api.get('/exchange/mine');
  },

  getOrder: async (id: string): Promise<ExchangeOrder> => {
    return api.get(`/exchange/${id}`);
  },

  uploadProof: async (
    id: string,
    data: FormData
  ): Promise<ExchangeOrder> => {
    return api.post(`/exchange/upload-proof/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Admin Methods
  getAdminOrders: async (): Promise<ExchangeOrder[]> => {
    return api.get('/exchange/admin/all');
  },

  confirmOrder: async (id: string): Promise<ExchangeOrder> => {
    return api.patch(`/exchange/${id}/confirm`);
  },

  rejectOrder: async (id: string): Promise<ExchangeOrder> => {
    return api.patch(`/exchange/${id}/reject`);
  },

  completeOrder: async (id: string): Promise<ExchangeOrder> => {
    return api.patch(`/exchange/${id}/complete`);
  },
};

export default exchangeService;
