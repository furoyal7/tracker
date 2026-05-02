'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 animate-in zoom-in duration-500">
            <AlertCircle size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Something went wrong</h1>
            <p className="text-[14px] text-slate-500 max-w-xs mx-auto">
              We've encountered an unexpected error. Don't worry, your data is safe.
            </p>
          </div>
          <Button 
            onClick={this.handleReset}
            className="bg-blue-600 text-white rounded-2xl px-8 h-12 flex items-center gap-2"
          >
            <RefreshCcw size={18} />
            Try Again
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-slate-50 rounded-xl text-left max-w-lg overflow-auto">
              <p className="text-[10px] font-mono text-rose-600 leading-relaxed whitespace-pre-wrap">
                {this.state.error?.stack}
              </p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
