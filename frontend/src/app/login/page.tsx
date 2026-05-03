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
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';

import { Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Use for email or username
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { t } = useTranslation();
  
  const { setAuth, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      router.push('/');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    const requestedMode = searchParams.get('mode');
    if (requestedMode === 'register') setMode('register');
    else if (requestedMode === 'login') setMode('login');
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'register' && password !== confirmPassword) {
      toast.error(t('auth.passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);
    
    const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
    const payload = mode === 'login' 
      ? { email: identifier.includes('@') ? identifier : undefined, 
          username: identifier.includes('@') ? undefined : identifier, 
          password } 
      : { username, password };

    const successMsg = mode === 'login' 
      ? t('auth.loginSuccess') 
      : t('auth.registerSuccess');

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

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const response: any = await api.post('/auth/google', {
        idToken: credentialResponse.credential,
      });
      setAuth(response.data.user, response.data.token);
      toast.success('Signed in successfully with Google!');
      router.push('/');
    } catch (err: any) {
      toast.error(err.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };


  if (!_hasHydrated || isAuthenticated) {
    return null;
  }

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
                {mode === 'login' ? t('auth.welcomeBack') : t('auth.startJourney')}
              </h1>
              <p className="text-base text-slate-500 font-medium px-2 leading-relaxed">
                {mode === 'login' 
                  ? t('auth.loginDescription') 
                  : t('auth.registerDescription')}
              </p>
            </div>
          </div>
        </div>

        <Card className={`p-10 border-slate-200 shadow-xl shadow-slate-200/40 rounded-3xl border bg-white transition-all duration-300 ${mode === 'register' ? 'space-y-6' : 'space-y-8'}`}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <Input
                  label={t('auth.username')}
                  placeholder={t('auth.usernamePlaceholder')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 h-11"
                />
              </div>
            )}
            
            {mode === 'login' && (
              <Input
                label={t('auth.usernameOrEmail')}
                placeholder={t('auth.usernameOrEmailPlaceholder')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                className="rounded-xl border-slate-200 h-11"
              />
            )}
            
            <div className="relative">
              <Input
                label={t('auth.password')}
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
                  label={t('auth.confirmPassword')}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 h-11"
                  error={password !== confirmPassword && confirmPassword !== '' ? t('auth.passwordsDoNotMatch') : undefined}
                />
              </div>
            )}

            <div className="pt-4 flex justify-center">
              <Button 
                type="submit" 
                className={`${mode === 'login' ? 'w-full' : 'px-12'} h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-50 active:scale-[0.99] transition-all text-sm`}
                isLoading={isLoading}
              >
                {mode === 'login' ? t('auth.signIn') : t('auth.getStarted')}
              </Button>
            </div>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          <div className="flex justify-center w-full">
            {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.includes('placeholder') ? (
              <div className="w-full flex justify-center transition-transform duration-300 hover:scale-105">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error('Google Login Failed')}
                  theme="outline"
                  shape="pill"
                  size="large"
                  text="continue_with"
                />
              </div>
            ) : (
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{t('auth.enterpriseAuthUnavailable')}</p>
            )}
          </div>

          <div className="pt-4 text-center border-t border-slate-50">
             <button 
               onClick={() => {
                 setMode(mode === 'login' ? 'register' : 'login');
                 // Reset registration fields only if switching away
                 if (mode === 'login') {
                    setUsername('');
                    setConfirmPassword('');
                 }
               }}
               className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
             >
               {mode === 'login' ? (
                 <>{t('auth.newHere')} <span className="text-blue-600">{t('auth.createAccount')}</span></>
               ) : (
                 <>{t('auth.alreadyHaveAccount')} <span className="text-blue-600">{t('auth.signIn')}</span></>
               )}
             </button>
          </div>
        </Card>

        {/* Footer Links */}
        <div className="text-center space-y-6 pt-2 pb-10">
          <p className="text-sm text-slate-400 font-medium leading-relaxed">
            {t('auth.protectingBusiness')} <br/>
            <span className="text-slate-600 font-bold hover:underline cursor-pointer">{t('auth.moneyManagerSecurity')}</span>.
          </p>
          <div className="h-px bg-slate-100 w-16 mx-auto" />
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none">
            {t('auth.secureInfrastructure')}
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

