import React from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Uncaught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  private handleRetry = () => {
    this.props.onReset?.();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            We apologize for the inconvenience. Please try refreshing the page or contact support if the problem persists.
          </p>
          <Button onClick={this.handleRetry} className="min-w-[200px]">
            Try Again
          </Button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-8 p-4 bg-black/10 rounded-lg text-sm overflow-auto max-w-full text-left">
              {this.state.error.message}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}