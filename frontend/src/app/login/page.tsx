'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLegacyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response: any = await api.post('/auth/login', { email, password });
      setAuth(response.data.user, response.data.token);
      toast.success('Access Granted • Welcome back');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const response: any = await api.post('/auth/google', { 
        idToken: credentialResponse.credential 
      });
      setAuth(response.data.user, response.data.token);
      toast.success('Welcome to Elite Merchant Portal');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Google Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 relative overflow-hidden">
      {/* Decorative ambient blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 bg-blue-50 rounded-full mb-2">
             <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Secure Access</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">MoneyManager</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] opacity-60 italic">Merchant Operations Protocol</p>
        </div>

        <Card className="p-8 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem]">
          <div className="space-y-8 flex flex-col items-center">
            <div className="text-center">
               <p className="text-sm font-bold text-slate-900">Elite Portal Entry</p>
               <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">Authentication required to proceed</p>
            </div>

            <form onSubmit={handleLegacyLogin} className="w-full space-y-4">
              <Input
                label="Professional Email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Confidential Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl transition-all"
                isLoading={isLoading}
              >
                Execute Login
              </Button>
            </form>

            <div className="w-full flex items-center gap-4 opacity-20">
               <div className="h-px bg-slate-300 flex-1" />
               <span className="text-[8px] font-black uppercase tracking-widest">OR</span>
               <div className="h-px bg-slate-300 flex-1" />
            </div>

            <div className="w-full flex flex-col items-center gap-4">
               <div className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.includes('placeholder') ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">G-Sync Offline</p>
                    </div>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google Authentication failed')}
                      useOneTap={false}
                      shape="pill"
                      theme="filled_blue"
                      width="320"
                      text="signin_with"
                    />
                  )}
               </div>
               
               <button 
                 onClick={() => router.push('/register')}
                 className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
               >
                 Create New Entity Access
               </button>
            </div>
          </div>
        </Card>

        <div className="text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">
             © 2026 Antigravity Global Logic • v2.8.1-Stable
           </p>
        </div>
      </div>
    </div>
  );
}
