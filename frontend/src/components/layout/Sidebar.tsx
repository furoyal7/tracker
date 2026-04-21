'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  Package, 
  PieChart, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Receipt, label: 'Transactions', href: '/transactions' },
  { icon: Users, label: 'Debts', href: '/debts' },
  { icon: Package, label: 'Inventory', href: '/inventory' },
  { icon: PieChart, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isSidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <div 
      className={cn(
        "flex h-full flex-col border-r-0 bg-white transition-all duration-200 ease-in-out overflow-hidden will-change-[width]",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b-0 px-6 shrink-0">
        <div className={cn(
          "flex items-center w-full transition-all duration-200",
          isSidebarCollapsed ? "justify-center" : "justify-between"
        )}>
          <span className={cn(
            "text-xl font-black text-blue-600 uppercase tracking-tighter whitespace-nowrap transition-all duration-200",
            isSidebarCollapsed ? "w-0 opacity-0 invisible" : "w-auto opacity-100 visible"
          )}>
            MoneyManager
          </span>
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-transparent hover:bg-slate-50 text-slate-600 transition-colors"
          >
            {isSidebarCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-1 py-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center px-6 py-3 text-sm font-bold transition-all duration-200 relative whitespace-nowrap',
                isActive 
                  ? 'bg-transparent text-blue-700 border-r-4 border-blue-700' 
                  : 'text-slate-900 hover:text-blue-600',
                isSidebarCollapsed && "px-0 justify-center border-r-0"
              )}
            >
              <item.icon className={cn(
                'shrink-0 h-5 w-5 transition-all duration-200',
                isActive ? 'text-blue-700' : 'text-slate-600',
                !isSidebarCollapsed && "mr-3"
              )} />

              <span className={cn(
                "transition-all duration-200 uppercase tracking-widest text-[10px]",
                isSidebarCollapsed ? "w-0 opacity-0 invisible" : "w-auto opacity-100 visible ml-0"
              )}>
                {item.label}
              </span>

              {isActive && isSidebarCollapsed && (
                <div className="absolute left-0 h-full w-1 bg-blue-700 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t-0 space-y-2 shrink-0">
        <Link href="/settings" className={cn(
          "flex items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-all active:scale-95",
          isSidebarCollapsed ? "justify-center px-0 bg-transparent border-none" : "space-x-3"
        )}>
           <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-blue-100">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Me" className="h-full w-full object-cover" />
              ) : (
                <span className="text-white font-black text-xs">{user?.name?.charAt(0) || user?.email?.charAt(0)}</span>
              )}
           </div>
           {!isSidebarCollapsed && (
             <div className="flex flex-col min-w-0">
                <p className="text-[10px] font-black text-slate-900 truncate tracking-tight uppercase leading-none mb-1">
                  {user?.name || user?.email?.split('@')[0]}
                </p>
                <p className="text-[8px] font-bold text-slate-400 truncate tracking-widest uppercase leading-none">
                  {user?.username ? `@${user.username}` : 'Pro Member'}
                </p>
             </div>
           )}
        </Link>
        <button
          onClick={() => logout()}
          className={cn(
            "flex w-full items-center py-3 text-sm font-black uppercase tracking-widest text-[10px] text-slate-800 hover:text-red-600 transition-all duration-200 rounded-lg hover:bg-red-50",
            isSidebarCollapsed ? "justify-center px-0" : "px-4"
          )}
        >
          <LogOut className={cn("h-5 w-5 shrink-0 transition-all duration-200", !isSidebarCollapsed && "mr-3")} />
          <span className={cn(
            "transition-all duration-200",
            isSidebarCollapsed ? "w-0 opacity-0 invisible" : "w-auto opacity-100 visible"
          )}>
            Logout
          </span>
        </button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  );
};
