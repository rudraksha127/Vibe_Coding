import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2, BrainCircuit } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

export function RequireAuth() {
  const { user, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <main className="screen-center" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        minHeight: '100vh'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            position: 'relative', 
            display: 'inline-block',
            marginBottom: '24px'
          }}>
            <BrainCircuit 
              size={56} 
              aria-hidden="true" 
              style={{ 
                color: 'var(--green-strong)',
                opacity: 0.8
              }} 
            />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}>
              <Loader2 className="spin" size={24} aria-hidden="true" style={{ color: 'var(--green)' }} />
            </div>
          </div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: 'var(--ink)',
            marginBottom: '8px'
          }}>
            InterviewForge AI
          </h2>
          <p style={{ 
            color: 'var(--muted)', 
            fontSize: '14px',
            marginTop: '0'
          }}>
            Loading your workspace...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

