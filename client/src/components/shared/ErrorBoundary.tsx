import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('💥 Uncaught UI Rendering Exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
          <Card className="p-8 max-w-md w-full text-center space-y-4 border-border/80 glass-panel shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <AlertTriangle className="h-8 w-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-foreground">Something went wrong</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                An unexpected interface error occurred. Our engineers have been alerted.
              </p>
            </div>

            <div className="flex gap-3 pt-3">
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/')}
                className="flex-1 font-bold text-xs h-10 gap-1.5 border-border"
              >
                <Home className="h-4 w-4" /> Go Home
              </Button>
              <Button
                onClick={() => this.setState({ hasError: false })}
                className="flex-1 font-extrabold text-xs h-10 gap-1.5 shadow-lg shadow-primary/30"
              >
                <RotateCcw className="h-4 w-4" /> Try Again
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
