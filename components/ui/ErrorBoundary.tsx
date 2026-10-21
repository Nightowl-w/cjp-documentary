'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Real React error boundary. Class components are required: a function
 * component cannot catch render errors (the previous implementation was a
 * function, so it never intercepted anything).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[error-boundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
          <div className="max-w-md text-center">
            <h2 className="mb-3 font-display text-2xl font-light gradient-gold">
              Something interrupted the story
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              The documentary hit an unexpected error. Reload to continue from the beginning.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload documentary
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
