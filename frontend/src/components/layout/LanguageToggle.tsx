'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export const LanguageToggle = () => {
  const { i18n } = useTranslation();
  const { user, setUser } = useAuthStore();

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
    
    // Persist to backend if user is logged in
    if (user) {
      try {
        const response: any = await api.patch('/users/profile', { preferredLanguage: newLang });
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to sync language preference', error);
      }
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100/50 hover:bg-slate-100 transition-all border border-slate-200/50 active:scale-95"
    >
      <span className={`text-[10px] font-black tracking-tighter ${i18n.language === 'en' ? 'text-blue-600' : 'text-slate-400'}`}>
        EN
      </span>
      <span className="w-[1px] h-2 bg-slate-300" />
      <span className={`text-[10px] font-black tracking-tighter ${i18n.language === 'am' ? 'text-blue-600' : 'text-slate-400'}`}>
        አማ
      </span>
    </button>
  );
};
