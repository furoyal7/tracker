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
          <label className="text-xs font-semibold text-slate-700 pl-1 leading-6">
            {label}
          </label>
        )}
        <input
          className={cn(
            'flex h-11 w-full rounded-xl bg-white border border-slate-200 px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/2 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm',
            error && 'border-red-500 bg-red-50/10 focus-visible:ring-red-500/2 focus-visible:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-[11px] font-medium text-red-500 pl-1 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
