'use client';
import React, { useState, useEffect } from 'react';
import { AlertCircle, Activity, Globe, Shield, Terminal } from 'lucide-react';
import { getServerUrl } from '@/services/api';

export const ProductionDebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    // Shortcut: Shift + D to toggle
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'D') {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch(`${getServerUrl()}/api/health`);
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setHealth({ status: 'unreachable', error: err.message });
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed bottom-20 right-6 z-[9999] animate-in slide-in-from-right-10 duration-300">
      <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-2xl border border-slate-800 w-80 max-h-[500px] overflow-y-auto font-mono">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-blue-400" />
            <h3 className="text-xs font-black uppercase tracking-widest">System Diagnostics v3.0</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl mb-2">
             <p className="text-[9px] font-black text-emerald-400 uppercase text-center">Status: Production Ready (v3.0)</p>
          </div>
          {/* Environment */}
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 uppercase font-black">Environment</p>
            <div className="flex items-center justify-between text-[11px]">
              <span>Mode:</span>
              <span className="text-emerald-400 uppercase">{process.env.NODE_ENV}</span>
            </div>
            <div className="flex flex-col text-[10px] bg-black/30 p-2 rounded-lg mt-1">
              <span className="text-slate-500 mb-1">API URL:</span>
              <span className="text-blue-300 break-all">{getServerUrl()}</span>
            </div>
          </div>

          {/* Health Check */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-500 uppercase font-black">Backend Health</p>
              <button 
                onClick={checkHealth}
                className="text-[9px] bg-blue-600 px-2 py-1 rounded-md font-black uppercase hover:bg-blue-500"
              >
                Pulse Check
              </button>
            </div>
            
            {health && (
              <div className="text-[11px] bg-black/30 p-3 rounded-xl space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className={health.status === 'ok' ? 'text-emerald-400' : 'text-rose-400'}>
                    {health.status?.toUpperCase()}
                  </span>
                </div>
                {health.database && (
                  <div className="flex items-center justify-between">
                    <span>Database:</span>
                    <span className="text-blue-400">{health.database}</span>
                  </div>
                )}
                {health.version && (
                  <div className="flex items-center justify-between">
                    <span>Version:</span>
                    <span className="text-slate-300">{health.version}</span>
                  </div>
                )}
                {health.error && (
                  <p className="text-rose-400 text-[9px] mt-1 italic">{health.error}</p>
                )}
              </div>
            )}
          </div>

          {/* Tips */}
          {!process.env.NEXT_PUBLIC_API_URL && !window.location.hostname.includes('localhost') && (
            <div className="bg-rose-900/20 p-3 rounded-xl border border-rose-900/30 mb-2">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={12} className="text-rose-400" />
                <p className="text-[9px] font-black text-rose-400 uppercase">Warning: Config Missing</p>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                <code className="text-rose-300">NEXT_PUBLIC_API_URL</code> is not set. The app will fail to reach the live backend.
              </p>
            </div>
          )}

          <div className="bg-blue-900/20 p-3 rounded-xl border border-blue-900/30">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={12} className="text-blue-400" />
              <p className="text-[9px] font-black text-blue-400 uppercase">Pro Tip</p>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              If features are missing, ensure your <code className="text-blue-300">NEXT_PUBLIC_API_URL</code> matches the live backend URL in Vercel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
