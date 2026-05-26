import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Frontend render error", error, info);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="screen-center screen-error">
          <section className="status-panel status-panel-tight status-panel-error" aria-live="polite">
            <div className="error-icon">
              <AlertTriangle size={32} color="var(--coral)" aria-hidden="true" />
            </div>
            <h1 className="error-title">Something went wrong</h1>
            <p className="error-message">
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <button 
              type="button" 
              className="primary-button"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={18} />
              Reload Page
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
