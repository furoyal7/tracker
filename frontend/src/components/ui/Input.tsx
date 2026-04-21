import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1 leading-none">
            {label}
          </label>
        )}
        <input
          className={cn(
            'flex h-12 w-full rounded-[1.25rem] bg-slate-50 border-none px-5 text-sm font-bold text-slate-900 placeholder:text-slate-300 placeholder:font-black placeholder:uppercase placeholder:text-[9px] placeholder:tracking-[0.2em] transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:bg-white focus-visible:shadow-xl focus-visible:shadow-blue-50/50 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'ring-1 ring-red-500 bg-red-50/30',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-[9px] font-black uppercase tracking-widest text-red-500 pl-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
