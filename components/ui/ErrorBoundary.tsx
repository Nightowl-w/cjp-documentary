'use client';

import { useState, useEffect, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
    error: null,
  });

  const staticGetDerivedStateFromError = (error: Error): ErrorBoundaryState => ({
    hasError: true,
    error,
  });

  useEffect(() => {
    if (state.hasError && state.error) {
      console.error('ErrorBoundary caught:', state.error);
    }
  }, [state]);

  if (state.hasError) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white p-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-medium text-accent-gold mb-4">Documentary loading...</h2>
          <p className="text-muted-foreground mb-4">Please refresh the page to continue.</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary px-6 py-3"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return children;
}