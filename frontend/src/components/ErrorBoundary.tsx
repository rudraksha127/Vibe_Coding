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
        <main className="screen-center" style={{ background: 'var(--coral-light)', minHeight: '100vh' }}>
          <section 
            className="status-panel" 
            aria-live="polite"
            style={{
              maxWidth: '420px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid var(--coral)',
              background: 'var(--paper)'
            }}
          >
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'var(--coral-light)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <AlertTriangle size={32} color="var(--coral)" aria-hidden="true" />
            </div>
            <h1 style={{ marginBottom: '12px', fontSize: '24px' }}>Something went wrong</h1>
            <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: '1.6' }}>
              {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            </p>
            <button 
              type="button" 
              className="primary-button"
              onClick={() => window.location.reload()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
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

