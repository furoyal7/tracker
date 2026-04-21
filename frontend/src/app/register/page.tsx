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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLegacyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setIsLoading(true);
    try {
      const response: any = await api.post('/auth/register', { email, password });
      setAuth(response.data.user, response.data.token);
      toast.success('Enterprise Account Created Successfully');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
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
      toast.success('Enterprise Account Created Store Success');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Google Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.05),transparent_50%)]" />
      
      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Join Elite</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] opacity-60 italic">Merchant Registration Protocol</p>
        </div>

        <Card className="p-8 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[2.5rem]">
          <div className="space-y-8 flex flex-col items-center">
            <div className="text-center">
               <p className="text-sm font-bold text-slate-900">New Entity Registry</p>
               <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest text-center">Initialize secure business credentials</p>
            </div>

            <form onSubmit={handleLegacyRegister} className="w-full space-y-4">
              <Input
                label="Primary Business Email"
                type="email"
                placeholder="admin@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Access Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm Access Code"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-2xl transition-all shadow-lg shadow-blue-200"
                isLoading={isLoading}
              >
                Register Entity
              </Button>
            </form>

            <div className="w-full flex items-center gap-4 opacity-20">
               <div className="h-px bg-slate-300 flex-1" />
               <span className="text-[8px] font-black uppercase tracking-widest">OR</span>
               <div className="h-px bg-slate-300 flex-1" />
            </div>

            <div className="w-full flex flex-col items-center gap-6">
               <div className="w-full transition-all hover:scale-[1.02] active:scale-[0.98]">
                  {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.includes('placeholder') ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-amber-800 uppercase tracking-tight">G-Sync Offline</p>
                    </div>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google Registration was unsuccessful')}
                      useOneTap={false}
                      shape="pill"
                      theme="filled_blue"
                      width="320"
                      text="signup_with"
                    />
                  )}
               </div>

               <p className="text-[9px] text-center text-slate-400 font-medium px-4 leading-relaxed">
                  By registering, you establish a secure operational node within the Antigravity Global network.
               </p>
            </div>
          </div>
        </Card>

        <div className="text-center">
           <button 
             onClick={() => router.push('/login')}
             className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
           >
             Existing Account? Sign In
           </button>
        </div>
      </div>
    </div>
  );
}
