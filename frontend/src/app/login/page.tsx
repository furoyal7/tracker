'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

import { Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const requestedMode = searchParams.get('mode');
    if (requestedMode === 'register') setMode('register');
    else if (requestedMode === 'login') setMode('login');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register' && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const payload = mode === 'login' 
      ? { email, password } 
      : { email, password, name, username };

    const successMsg = mode === 'login' 
      ? 'Welcome back! You have successfully signed in.' 
      : 'Account created successfully. Welcome aboard!';

    try {
      const response: any = await api.post(endpoint, payload);
      setAuth(response.data.user, response.data.token);
      toast.success(successMsg);
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className={`w-full transition-all duration-500 ease-in-out ${mode === 'register' ? 'max-w-[480px]' : 'max-w-[420px]'} space-y-10`}>
        {/* Brand Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
               <span className="text-white font-black text-xl italic">M</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 leading-none">
                {mode === 'login' ? 'Welcome back' : 'Start your journey'}
              </h1>
              <p className="text-base text-slate-500 font-medium px-2 leading-relaxed">
                {mode === 'login' 
                  ? 'Sign in to access your merchant dashboard' 
                  : 'Join thousands of merchants managing their business smarter'}
              </p>
            </div>
          </div>
        </div>

        <Card className={`p-10 border-slate-200 shadow-xl shadow-slate-200/40 rounded-3xl border bg-white transition-all duration-300 ${mode === 'register' ? 'space-y-6' : 'space-y-8'}`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 h-11"
                />
                <Input
                  label="Username"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 h-11"
                />
              </div>
            )}
            
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-xl border-slate-200 h-11"
            />
            
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl border-slate-200 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 bottom-3 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
                <Input
                  label="Confirm Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 h-11"
                  error={password !== confirmPassword && confirmPassword !== '' ? "Passwords do not match" : undefined}
                />
              </div>
            )}

            <div className="pt-4 flex justify-center">
              <Button 
                type="submit" 
                className={`${mode === 'login' ? 'w-full' : 'px-12'} h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-50 active:scale-[0.99] transition-all text-sm`}
                isLoading={isLoading}
              >
                {mode === 'login' ? 'Sign In' : 'Get Started'}
              </Button>
            </div>
          </form>

          <div className="pt-4 text-center border-t border-slate-50">
             <button 
               onClick={() => {
                 setMode(mode === 'login' ? 'register' : 'login');
                 // Reset registration fields only if switching away
                 if (mode === 'login') {
                    setName('');
                    setUsername('');
                    setConfirmPassword('');
                 }
               }}
               className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
             >
               {mode === 'login' ? (
                 <>New here? <span className="text-blue-600">Create an account</span></>
               ) : (
                 <>Already have an account? <span className="text-blue-600">Sign In</span></>
               )}
             </button>
          </div>
        </Card>

        {/* Footer Links */}
        <div className="text-center space-y-6 pt-2 pb-10">
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            Protecting your business assets with <br/>
            <span className="text-slate-600 font-bold hover:underline cursor-pointer">MoneyManager Security</span>.
          </p>
          <div className="h-px bg-slate-100 w-16 mx-auto" />
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">
            Secure Infrastructure & Encryption
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

