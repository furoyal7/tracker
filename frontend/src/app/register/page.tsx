'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Enterprise Registration Proxy
 * Redirects to the unified authentication portal for optimized onboarding.
 */
export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Systematic redirection to the unified node deployment interface
    router.replace('/login?mode=register');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 relative overflow-hidden">
      <div className="text-center space-y-4 relative z-10 animate-pulse">
         <div className="inline-block px-3 py-1 bg-blue-50 rounded-full mb-2">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Redirecting</span>
         </div>
         <h1 className="text-xl font-black tracking-tighter text-slate-900 uppercase">Synchronizing Portal Access</h1>
         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] opacity-60">Initializing secure channel...</p>
      </div>
    </div>
  );
}
