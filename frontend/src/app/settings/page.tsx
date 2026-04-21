'use client';
import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Shield, 
  Database,
  Lock,
  ChevronRight,
  LogOut,
  Bell,
  Cpu,
  Globe,
  Activity,
  User as UserIcon,
  Camera,
  Hash,
  Info,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

interface ToggleProps {
  label: string;
  sublabel: string;
  enabled: boolean;
  onToggle: () => void;
}

const ProToggle = ({ label, sublabel, enabled, onToggle }: ToggleProps) => (
  <button 
    onClick={onToggle}
    className="w-full flex items-center justify-between py-3 px-1 active:opacity-70 transition-all text-left"
  >
    <div className="flex flex-col">
      <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">{label}</p>
      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{sublabel}</p>
    </div>
    <div className={cn(
      "w-8 h-4 rounded-full relative transition-all duration-300",
      enabled ? "bg-blue-600" : "bg-slate-200"
    )}>
      <div className={cn(
        "absolute top-0.5 h-3 w-3 bg-white rounded-full transition-all duration-300",
        enabled ? "left-[1.1rem]" : "left-0.5"
      )} />
    </div>
  </button>
);

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const { user, logout, updatePasscode, updateProfile, uploadAvatar } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile States
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    age: user?.age?.toString() || '',
    bio: user?.bio || ''
  });

  // Pro Mock States
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [autoStock, setAutoStock] = useState(true);
  const [realtimeProfit, setRealtimeProfit] = useState(false);
  
  // PIN state
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        username: user.username || '',
        age: user.age?.toString() || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(file);
        toast.success('Profile identity updated');
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update Profile Information
      await updateProfile({
        name: profileData.name,
        username: profileData.username,
        age: profileData.age ? parseInt(profileData.age) : undefined,
        bio: profileData.bio
      });

      // 2. Update Passcode if provided
      if (pin) {
        if (!/^\d{6}$/.test(pin)) {
           toast.error('Passcode must be 6 digits');
           setIsSaving(false);
           return;
        }
        await updatePasscode(pin);
        setPin('');
      }
      
      toast.success('Elite Configuration Synchronized');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col space-y-8 pb-10">
        
        {/* 🛠️ Top Bar with Save */}
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">Settings</h2>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Pro Configuration Suite</p>
           </div>
           <Button 
             onClick={handleSave} 
             isLoading={isSaving} 
             className="h-9 px-6 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-100 border-none transition-all active:scale-95"
           >
              Deploy
           </Button>
        </div>

        {/* 📋 Settings Groups */}
        <div className="flex flex-col space-y-6">
          
          {/* 👤 Profile Identity Section */}
          <section className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Profile Identity</h3>
             <div className="bg-white rounded-[2.5rem] p-7 border border-slate-50 shadow-[0_2px_15px_rgba(0,0,0,0.01)] flex flex-col items-center">
                
                {/* Avatar Upload */}
                <div className="relative mb-8 group cursor-pointer" onClick={handleAvatarClick}>
                   <div className="h-24 w-24 rounded-[2rem] bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl group-active:scale-95 transition-all">
                      {user?.avatarUrl ? (
                         <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                         <UserIcon size={32} className="text-slate-300" />
                      )}
                   </div>
                   <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white">
                      <Camera size={14} />
                   </div>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileChange} 
                     className="hidden" 
                     accept="image/*"
                   />
                </div>

                <div className="w-full space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                         <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                         <Input 
                            label="Username" 
                            placeholder="Unique Handle"
                            value={profileData.username}
                            onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                            className="bg-slate-50 border-none pl-11 p-4 rounded-2xl text-sm font-bold h-14"
                         />
                      </div>
                      <div className="relative">
                         <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                         <Input 
                            label="Age" 
                            type="number"
                            placeholder="Age"
                            value={profileData.age}
                            onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                            className="bg-slate-50 border-none pl-11 p-4 rounded-2xl text-sm font-bold h-14"
                         />
                      </div>
                   </div>
                   <Input 
                      label="Full Name" 
                      placeholder="Display Name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold h-14"
                   />
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center px-1">
                        <Info size={12} className="mr-1.5" /> Biography
                      </label>
                      <textarea 
                        placeholder="Tell us about yourself..."
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold h-32 focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                      />
                   </div>
                </div>
             </div>
          </section>

          {/* Identity & Registry */}
          <section className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Account Registry</h3>
             <div className="bg-white rounded-[2.5rem] p-7 border border-slate-50 shadow-[0_2px_15px_rgba(0,0,0,0.01)] space-y-5">
                <Input 
                  label="Registry Email" 
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold h-14 opacity-60"
                />
             </div>
          </section>

          {/* Advanced Operations (Pro Module) */}
          <section className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Business Logic</h3>
             <div className="bg-white rounded-[2rem] p-6 border border-slate-50 shadow-sm space-y-2">
                <ProToggle 
                  label="Stock Auto-Decrement" 
                  sublabel="Reduce inventory on each sale"
                  enabled={autoStock}
                  onToggle={() => setAutoStock(!autoStock)}
                />
                <div className="h-px bg-slate-50 mx-1" />
                <ProToggle 
                  label="Real-time Profit" 
                  sublabel="Calculate net margin instantly"
                  enabled={realtimeProfit}
                  onToggle={() => setRealtimeProfit(!realtimeProfit)}
                />
                <div className="h-px bg-slate-50 mx-1" />
                <ProToggle 
                  label="Global Sync" 
                  sublabel="Sync data across all endpoints"
                  enabled={autoSync}
                  onToggle={() => setAutoSync(!autoSync)}
                />
             </div>
          </section>

          {/* Connectivity Protocols (Matte Black) */}
          <section className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">System Diagnostic</h3>
             <div className="bg-slate-950 rounded-[2.5rem] p-8 flex flex-col space-y-6 relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                
                <div className="flex items-center justify-between relative z-10">
                   <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 flex items-center justify-center bg-white/5 rounded-2xl text-blue-400 border border-white/5">
                         <Activity size={20} />
                      </div>
                      <div>
                         <p className="text-sm font-black text-white uppercase tracking-tight leading-none">System Health</p>
                         <p className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest mt-2">Latency: 24ms (Optimal)</p>
                      </div>
                   </div>
                   <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]"></div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 relative z-10">
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Endpoints</p>
                      <p className="text-sm font-bold text-white leading-none">12 Active</p>
                   </div>
                   <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Enc Level</p>
                      <p className="text-sm font-bold text-white leading-none">AES-256</p>
                   </div>
                </div>
             </div>
          </section>

          {/* Communication Hub */}
          <section className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Notifications</h3>
             <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden">
                <div className="p-5 flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 flex items-center justify-center bg-blue-50 rounded-xl text-blue-600">
                         <Bell size={18} />
                      </div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Push Alerts</p>
                   </div>
                   <ProToggle label="" sublabel="" enabled={notifications} onToggle={() => setNotifications(!notifications)} />
                </div>
                <div className="h-px bg-slate-50 mx-4" />
                <button className="w-full flex items-center justify-between p-5 active:bg-slate-50 transition-all text-left">
                   <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400">
                         <Globe size={18} />
                      </div>
                      <div>
                         <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">Locale & Region</p>
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">US-EN ($) UTC-5</p>
                      </div>
                   </div>
                   <ChevronRight size={14} className="text-slate-300" />
                </button>
             </div>
          </section>

          {/* Security Architecture */}
          <section className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Privacy & Access</h3>
             <div className="bg-white rounded-[2rem] border border-slate-50 shadow-sm overflow-hidden">
                <button className="w-full flex items-center justify-between p-5 active:bg-slate-50 transition-all text-left">
                   <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 flex items-center justify-center bg-emerald-50 rounded-xl text-emerald-600">
                         <Shield size={18} />
                      </div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Access Control</p>
                   </div>
                   <ChevronRight size={14} className="text-slate-300" />
                </button>
                <div className="h-px bg-slate-50 mx-4" />
                
                {/* 🔢 Numeric Security Key (Functional) */}
                <div className="p-5 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                         <div className="h-9 w-9 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400">
                            <Lock size={18} />
                         </div>
                         <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">Security Key (PIN)</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">Numeric Access Protocol</p>
                         </div>
                      </div>
                   </div>
                   <div className="relative">
                      <input 
                        type="password" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="SET 6-DIGIT PIN"
                        className="w-full h-12 bg-slate-50 rounded-xl border-none px-4 text-center text-lg font-black tracking-[0.5em] text-slate-900 placeholder:text-[9px] placeholder:tracking-[0.2em] placeholder:text-slate-300 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                      />
                      {pin.length === 6 && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                      )}
                   </div>
                </div>

                <div className="h-px bg-slate-50 mx-4" />
                <button className="w-full flex items-center justify-between p-5 active:bg-slate-50 transition-all text-left">
                   <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400">
                         <Cpu size={18} />
                      </div>
                      <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Hardware Reset</p>
                   </div>
                   <ChevronRight size={14} className="text-slate-300" />
                </button>
             </div>
          </section>

          {/* Danger Zone */}
          <div className="pt-6">
             <button 
               onClick={logout}
               className="w-full py-5 rounded-[2rem] bg-rose-50 text-rose-600 flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-sm"
             >
                <LogOut size={16} strokeWidth={2.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Terminate Session</span>
             </button>
          </div>

          <div className="py-6 text-center space-y-2">
             <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-200 italic">Merchant Operations Protocol v3.0.01-Pro</p>
             <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-300">© 2026 Antigravity Global Logic</p>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
