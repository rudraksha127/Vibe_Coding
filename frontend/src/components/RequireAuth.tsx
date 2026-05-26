import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2, BrainCircuit } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

export function RequireAuth() {
  const { user, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <main className="screen-center">
        <section className="status-panel status-panel-tight" aria-live="polite">
          <div className="loading-mark">
            <BrainCircuit 
              size={56} 
              aria-hidden="true" 
              className="loading-logo"
            />
            <div className="loading-spinner">
              <Loader2 className="spin" size={24} aria-hidden="true" />
            </div>
          </div>
          <h2 className="loading-title">InterviewForge AI</h2>
          <p>Loading your workspace...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
