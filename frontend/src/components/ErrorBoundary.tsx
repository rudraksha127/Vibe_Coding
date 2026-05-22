import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Frontend render error", error, info);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="screen-center">
          <section className="status-panel" aria-live="polite">
            <AlertTriangle size={28} aria-hidden="true" />
            <h1>Something went wrong</h1>
            <button type="button" onClick={() => window.location.reload()}>
              Reload
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

