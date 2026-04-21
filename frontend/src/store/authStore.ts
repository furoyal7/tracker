import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updatePasscode: (passcode: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      updatePasscode: async (passcode: string) => {
        try {
          await api.post('/auth/passcode', { passcode });
          set((state) => ({
            user: state.user ? { ...state.user, passcode: 'set' } : null
          }));
        } catch (error: any) {
          throw new Error(error.message || 'Failed to update passcode');
        }
      },
      updateProfile: async (data: Partial<User>) => {
        try {
          const response: any = await api.patch('/users/profile', data);
          set((state) => ({
            user: state.user ? { ...state.user, ...response.data } : response.data
          }));
        } catch (error: any) {
          throw new Error(error.message || 'Failed to update profile');
        }
      },
      uploadAvatar: async (file: File) => {
        try {
          const formData = new FormData();
          formData.append('avatar', file);
          const response: any = await api.post('/users/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          set((state) => ({
            user: state.user ? { ...state.user, avatarUrl: response.data.avatarUrl } : response.data
          }));
        } catch (error: any) {
          throw new Error(error.message || 'Failed to upload avatar');
        }
      },
      getCurrentUser: async () => {
        try {
          const response: any = await api.get('/users/profile');
          set((state) => ({
            user: state.user ? { ...state.user, ...response.data } : response.data,
            isAuthenticated: true
          }));
        } catch (error: any) {
          // Only sign out if explicitly unauthorized (401)
          // We check the error message or status if the interceptor didn't already handle it
          if (error.message?.includes('401') || error.response?.status === 401) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
          }
        }
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
