import { 
  Plus, 
  Minus, 
  UserPlus,
  Repeat
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/cn';

export const QuickActions = () => {
  const router = useRouter();

  const actions = [
    { label: 'Sale', icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50/50', href: '/transactions?type=INCOME' },
    { label: 'Expense', icon: Minus, color: 'text-rose-600', bg: 'bg-rose-50/50', href: '/transactions?type=EXPENSE' },
    { label: 'Debt', icon: UserPlus, color: 'text-amber-600', bg: 'bg-amber-50/50', href: '/debts?add=true' },
    { label: 'Exchange', icon: Repeat, color: 'text-indigo-600', bg: 'bg-indigo-50/50', href: '/exchange/create' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => router.push(action.href)}
          className="flex items-center space-x-4 p-6 rounded-[2rem] bg-white border border-slate-50 shadow-[0_4px_20px_-1px_rgba(0,0,0,0.02)] active:scale-95 transition-all hover:border-blue-100 hover:shadow-lg group"
        >
          <div className={cn("p-3 rounded-[1.25rem] transition-transform group-hover:scale-110", action.bg)}>
            <action.icon className={cn("h-5 w-5 stroke-[2.5px]", action.color)} />
          </div>
          <p className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] text-slate-800 leading-none">
            {action.label}
          </p>
        </button>
      ))}
    </div>
  );
};
