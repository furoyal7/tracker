'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  User as UserIcon, 
  Camera, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  Lock, 
  Activity, 
  Settings, 
  ChevronRight, 
  LogOut, 
  Smartphone, 
  Globe, 
  Bell, 
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Key,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useFinanceStore } from '@/store/financeStore';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// --- Types ---
type TabType = 'overview' | 'business' | 'security' | 'activity' | 'settings';

export default function ProfilePage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user, updateProfile, uploadAvatar, changePassword, getActivityLogs, getSessions, logoutSession, logout } = useAuthStore();
  const { summary, fetchSummary } = useFinanceStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [businessData, setBusinessData] = useState({
    businessName: user?.businessName || '',
    businessType: user?.businessType || '',
    address: user?.address || '',
    phone: user?.phone || '',
    name: user?.name || ''
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Load initial data
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Load tab-specific data
  useEffect(() => {
    if (activeTab === 'activity') {
      getActivityLogs().then(setLogs).catch(err => toast.error(err.message));
    } else if (activeTab === 'security') {
      getSessions().then(setSessions).catch(err => toast.error(err.message));
    }
  }, [activeTab]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateCompletion = () => {
    if (!user) return 0;
    const fields = ['name', 'username', 'avatarUrl', 'phone', 'businessName', 'address', 'bio'];
    const filled = fields.filter(f => !!(user as any)[f]).length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadAvatar(file);
        toast.success(t('settings.profileUpdated'));
      } catch (error: any) {
        toast.error(error.message);
      }
    }
  };

  const handleUpdateBusiness = async () => {
    setIsLoading(true);
    try {
      await updateProfile(businessData);
      toast.success(t('common.success'));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      return toast.error(t('auth.passwordsDoNotMatch'));
    }
    setIsLoading(true);
    try {
      await changePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      });
      toast.success(t('common.success'));
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutSession = async (sid: string) => {
    try {
      await logoutSession(sid);
      setSessions(prev => prev.filter(s => s.id !== sid));
      toast.success(t('common.success'));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const completion = calculateCompletion();

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-slate-50/50 pb-24 lg:pb-10">
        
        {/* 🏆 STICKY PROFILE HEADER */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-100 group-active:scale-95 transition-all">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon size={20} className="text-slate-400" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-blue-600 rounded-lg flex items-center justify-center text-white border-2 border-white shadow-sm">
                <Camera size={10} />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate max-w-[150px]">
                  {user?.businessName || user?.name || 'Merchant'}
                </h2>
                {user?.isVerified && (
                  <div className="p-0.5 bg-blue-50 text-blue-600 rounded-md">
                    <ShieldCheck size={12} fill="currentColor" className="text-white" />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end mr-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('profile.completion')}</p>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${completion}%` }} />
              </div>
            </div>
            <Button 
              variant="outline"
              className="h-9 gap-2 rounded-xl border-slate-100 text-slate-400 hover:text-blue-600 transition-all text-[9px] font-black uppercase tracking-widest px-3"
              onClick={() => toast.success('Financial Report Exported (PDF)')}
            >
              <FileText size={14} />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button 
              onClick={logout}
              variant="outline"
              className="h-9 w-9 p-0 rounded-xl border-slate-100 text-slate-400 hover:text-rose-600 transition-all"
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
          
          {/* 📊 QUICK STATS BAR */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t('profile.totalBalance'), value: summary?.profit || 0, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: t('profile.totalDebt'), value: summary?.totalReceivable || 0, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: t('profile.monthlyProfit'), value: (summary?.totalIncome || 0) * 0.15, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex flex-col items-center text-center">
                <div className={cn("p-2 rounded-xl mb-2", stat.bg)}>
                  <stat.icon size={16} className={stat.color} />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mb-1">{stat.label}</p>
                <h4 className="text-sm font-black text-slate-900 tabular-nums">
                  {formatCurrency(stat.value)}
                </h4>
              </div>
            ))}
          </div>

          {/* 🗂️ TAB NAVIGATION */}
          <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-[2rem] border border-white flex items-center shadow-sm overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', icon: Activity, label: t('profile.tabs.overview') },
              { id: 'business', icon: Briefcase, label: t('profile.tabs.business') },
              { id: 'security', icon: Lock, label: t('profile.tabs.security') },
              { id: 'activity', icon: Globe, label: t('profile.tabs.activity') },
              { id: 'settings', icon: Settings, label: t('profile.tabs.settings') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full transition-all whitespace-nowrap active:scale-95",
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                )}
              >
                <tab.icon size={14} className={activeTab === tab.id ? "text-blue-400" : ""} />
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 📦 TAB CONTENT */}
          <div className="min-h-[400px]">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">{t('profile.overview.revenue')}</h3>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">REAL-TIME</span>
                    </div>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                      <LineChart data={summary?.chartData || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} 
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#2563eb" 
                          strokeWidth={4} 
                          dot={false} 
                          activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 mb-6">{t('profile.overview.expenseBreakdown')}</h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%" minHeight={0} minWidth={0}>
                        <PieChart>
                          <Pie
                            data={summary?.expenseDistribution || [{ label: 'Empty', value: 100 }]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ef4444" />
                            <Cell fill="#10b981" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-sm flex flex-col justify-between">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2 mb-4">{t('profile.overview.recentActivity')}</h3>
                     <div className="space-y-4">
                        {[1, 2, 3].map((_, i) => (
                           <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                              <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                 <Activity size={18} />
                              </div>
                              <div className="flex-1">
                                 <p className="text-[11px] font-black text-slate-900 uppercase leading-none">Security Login</p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Today, 12:45 PM</p>
                              </div>
                              <ChevronRight size={14} className="text-slate-300" />
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-6 text-white md:col-span-2">
                     <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                        <MessageSquare className="w-8 h-8" />
                     </div>
                     <div className="flex-1 text-center md:text-left">
                        <h4 className="text-sm font-black uppercase tracking-tight mb-1">Merchant Communication Hub</h4>
                        <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase tracking-widest">Connect with your customers and partners in real-time through the end-to-end encrypted protocol.</p>
                     </div>
                     <Button 
                        onClick={() => router.push('/chat')}
                        className="h-12 px-8 bg-white text-slate-900 rounded-2xl text-[9px] font-black uppercase tracking-widest"
                     >
                        Open Messages
                     </Button>
                  </div>
                </div>
              </div>
            )}

            {/* BUSINESS INFO TAB */}
            {activeTab === 'business' && (
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t('profile.tabs.business')}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t('profile.subtitle')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label={t('profile.business.name')}
                    value={businessData.businessName}
                    onChange={e => setBusinessData({...businessData, businessName: e.target.value})}
                    placeholder="Company Name"
                    className="h-14 bg-slate-50 rounded-2xl"
                  />
                  <Input 
                    label={t('profile.business.owner')}
                    value={businessData.name}
                    onChange={e => setBusinessData({...businessData, name: e.target.value})}
                    placeholder="Legal Owner"
                    className="h-14 bg-slate-50 rounded-2xl"
                  />
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{t('profile.business.type')}</label>
                    <select 
                      value={businessData.businessType}
                      onChange={e => setBusinessData({...businessData, businessType: e.target.value})}
                      className="w-full h-14 bg-slate-50 rounded-2xl px-4 text-sm font-bold border-none focus:ring-2 focus:ring-blue-100 outline-none"
                    >
                      <option value="">Select Type</option>
                      <option value="RETAIL">Retail</option>
                      <option value="WHOLESALE">Wholesale</option>
                      <option value="SERVICE">Service Provider</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <Input 
                    label={t('profile.business.phone')}
                    value={businessData.phone}
                    onChange={e => setBusinessData({...businessData, phone: e.target.value})}
                    placeholder="+251 ..."
                    className="h-14 bg-slate-50 rounded-2xl"
                  />
                  <div className="relative">
                    <Input 
                      label={t('profile.business.email')}
                      value={user?.email || ''}
                      disabled
                      placeholder="Email"
                      className="h-14 bg-slate-50 rounded-2xl opacity-60"
                    />
                    <div className="absolute right-4 top-10 flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg border border-emerald-100">
                      <CheckCircle2 size={10} />
                      <span className="text-[8px] font-black uppercase tracking-widest">{t('profile.verified')}</span>
                    </div>
                  </div>
                </div>

                {/* Phone Verification Section (Mock) */}
                {!user?.isVerified && (
                  <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                        <Smartphone size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-900 uppercase">Phone Verification Required</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Unlock all merchant features</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="h-9 rounded-xl text-[9px] font-black uppercase tracking-widest px-4 border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white"
                      onClick={() => toast.info('OTP Sent to ' + user?.phone)}
                    >
                      Verify Now
                    </Button>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{t('profile.business.address')}</label>
                  <textarea 
                    value={businessData.address}
                    onChange={e => setBusinessData({...businessData, address: e.target.value})}
                    className="w-full h-32 bg-slate-50 rounded-2xl p-4 text-sm font-bold border-none focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                    placeholder="Physical location..."
                  />
                </div>

                <Button 
                  onClick={handleUpdateBusiness}
                  isLoading={isLoading}
                  className="w-full h-14 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-100"
                >
                  {t('profile.business.save')}
                </Button>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                {/* Password Change */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                      <Lock size={20} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t('profile.security.changePassword')}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <Input 
                      type="password"
                      label={t('profile.security.currentPassword')}
                      value={passwordData.current}
                      onChange={e => setPasswordData({...passwordData, current: e.target.value})}
                      className="h-14 bg-slate-50 rounded-2xl"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input 
                        type="password"
                        label={t('profile.security.newPassword')}
                        value={passwordData.new}
                        onChange={e => setPasswordData({...passwordData, new: e.target.value})}
                        className="h-14 bg-slate-50 rounded-2xl"
                      />
                      <Input 
                        type="password"
                        label={t('profile.security.confirmPassword')}
                        value={passwordData.confirm}
                        onChange={e => setPasswordData({...passwordData, confirm: e.target.value})}
                        className="h-14 bg-slate-50 rounded-2xl"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleChangePassword}
                    isLoading={isLoading}
                    className="w-full h-14 bg-slate-900 text-white rounded-3xl text-[10px] font-black uppercase tracking-[0.2em]"
                  >
                    {t('profile.security.changePassword')}
                  </Button>
                </div>

                {/* Sessions */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">{t('profile.security.sessions')}</h3>
                  <div className="space-y-3">
                    {sessions.map((session, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                            <Smartphone size={18} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-900 uppercase">{session.deviceInfo || 'Unknown Device'}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{session.ipAddress} • {t('profile.security.lastActive')}: {new Date(session.lastActive).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleLogoutSession(session.id)}
                          variant="ghost" 
                          className="h-10 w-10 rounded-xl text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <div className="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t('profile.tabs.activity')}</h3>
                  <Button variant="outline" className="h-9 rounded-xl text-[9px] font-black uppercase tracking-widest px-4 border-slate-100">
                    {t('profile.activity.filter')}
                  </Button>
                </div>

                <div className="space-y-1">
                  {logs.length > 0 ? logs.map((log, i) => (
                    <div key={i} className="relative pl-8 pb-8 last:pb-0 group">
                      {/* Timeline Line */}
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-100 group-last:bg-transparent" />
                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-1.5 h-6 w-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm z-10 group-hover:scale-110 transition-transform">
                         <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      </div>
                      
                      <div className="bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100/50 group-hover:bg-white group-hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{log.actionType.replace('_', ' ')}</p>
                          <span className="text-[9px] font-bold text-slate-400 tabular-nums">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                           {JSON.stringify(log.metadata) !== '{}' ? JSON.stringify(log.metadata) : 'No additional metadata logged for this action.'}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <div className="py-20 text-center space-y-4">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Activity size={32} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No activity detected on this protocol</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-8">
                  
                  {/* Language Setting */}
                  <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-blue-600 border border-slate-100">
                        <Globe size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{t('settings.localeRegion')}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Current: {i18n.language === 'am' ? 'AMHARIC' : 'ENGLISH'}</p>
                      </div>
                    </div>
                    <select 
                      value={i18n.language}
                      onChange={(e) => {
                        i18n.changeLanguage(e.target.value);
                        updateProfile({ preferredLanguage: e.target.value });
                      }}
                      className="bg-white border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
                    >
                      <option value="en">ENGLISH</option>
                      <option value="am">AMHARIC</option>
                    </select>
                  </div>

                  {/* Notification Setting */}
                  <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-amber-600 border border-slate-100">
                        <Bell size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{t('settings.pushAlerts')}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Chat & Transaction Notifications</p>
                      </div>
                    </div>
                    <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                       <div className="absolute right-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>

                  <div className="h-px bg-slate-50" />
                  
                  {/* Danger Zone */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest px-2">{t('profile.security.deleteAccount')}</h4>
                    <div className="p-6 rounded-[2.5rem] bg-rose-50/30 border border-rose-100 flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1 text-center md:text-left">
                        <p className="text-[11px] font-black text-rose-900 uppercase tracking-tight mb-2">Protocol Termination</p>
                        <p className="text-[9px] font-bold text-rose-400 uppercase leading-relaxed">{t('profile.security.deleteWarning')}</p>
                      </div>
                      <Button className="h-12 px-8 bg-rose-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-100">
                         {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
        
        {/* FOOTER INFO */}
        <div className="mt-auto py-10 text-center space-y-2 opacity-30">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Merchant Financial Protocol v4.2.0-Alpha</p>
          <div className="flex items-center justify-center gap-2">
             <ShieldCheck size={10} />
             <p className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-500">End-to-End Encrypted Data Pipeline</p>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
