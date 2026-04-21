import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export const Card = ({ children, className, title, description }: CardProps) => {
  return (
    <div className={cn('rounded-xl border border-border bg-card text-card-foreground shadow-sm', className)}>
      {(title || description) && (
        <div className="flex flex-col space-y-1.5 p-6">
          {title && <h3 className="text-xl font-bold leading-none tracking-tight text-foreground">{title}</h3>}
          {description && <p className="text-sm text-slate-500 font-medium">{description}</p>}
        </div>
      )}
      <div className={cn('p-6 pt-0', !title && !description && 'pt-6')}>
        {children}
      </div>
    </div>

  );
};
