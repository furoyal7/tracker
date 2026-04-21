import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-blue-600 text-white shadow-[0_4px_15px_-1px_rgba(37,99,235,0.2)] active:bg-blue-700',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
      outline: 'border border-slate-200 bg-transparent hover:bg-slate-50 text-slate-900',
      danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100',
      ghost: 'bg-transparent hover:bg-slate-50 text-slate-600',
    };

    const sizes = {
      sm: 'h-8 px-4 text-[9px] font-black uppercase tracking-[0.1em] rounded-lg',
      md: 'h-10 px-6 text-[10px] font-black uppercase tracking-[0.15em] rounded-xl',
      lg: 'h-12 px-8 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl',
      xl: 'h-16 px-10 text-[12px] font-black uppercase tracking-[0.25em] rounded-[1.5rem]',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="mr-3 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
