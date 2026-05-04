import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  updatePasscode: (passcode: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  getCurrentUser: () => Promise<void>;
  changePassword: (data: any) => Promise<void>;
  verifyPhone: (data: any) => Promise<void>;
  getActivityLogs: (limit?: number, offset?: number) => Promise<any[]>;
  getSessions: () => Promise<any[]>;
  logoutSession: (sessionId: string) => Promise<void>;
  logout: () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
        // Sync language if available
        if (user.preferredLanguage) {
          import('@/i18n/config').then(m => m.default.changeLanguage(user.preferredLanguage));
        }
      },
      setUser: (user) => set({ user }),
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
          // Sync language preference from backend
          if (response.data.preferredLanguage) {
            import('@/i18n/config').then(m => m.default.changeLanguage(response.data.preferredLanguage));
          }
        } catch (error: any) {
          // Only sign out if explicitly unauthorized (401)
          // We check the error message or status if the interceptor didn't already handle it
          if (error.message?.includes('401') || error.response?.status === 401) {
            localStorage.removeItem('token');
            set({ user: null, token: null, isAuthenticated: false });
          }
        }
      },
      changePassword: async (data: any) => {
        await api.post('/auth/change-password', data);
      },
      verifyPhone: async (data: any) => {
        const response: any = await api.post('/auth/verify-phone', data);
        set((state) => ({
          user: state.user ? { ...state.user, ...response.data } : response.data
        }));
      },
      getActivityLogs: async (limit = 20, offset = 0) => {
        const response: any = await api.get(`/users/activity?limit=${limit}&offset=${offset}`);
        return response.data;
      },
      getSessions: async () => {
        const response: any = await api.get('/users/sessions');
        return response.data;
      },
      logoutSession: async (sessionId: string) => {
        await api.delete(`/users/sessions/${sessionId}`);
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
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
