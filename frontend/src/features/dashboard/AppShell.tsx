import { BrainCircuit, FileText, Gauge, LogOut, MessageSquareText } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BrainCircuit size={28} aria-hidden="true" />
          <strong>InterviewForge</strong>
        </div>
        <nav aria-label="Primary">
          <NavLink to="/" end>
            <Gauge size={18} aria-hidden="true" />
            Dashboard
          </NavLink>
          <NavLink to="/resumes">
            <FileText size={18} aria-hidden="true" />
            Resumes
          </NavLink>
          <NavLink to="/interview">
            <MessageSquareText size={18} aria-hidden="true" />
            Interview
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div>
            <span>{user?.profile.name || "User"}</span>
            <small>{user?.profile.targetRole || "Target role pending"}</small>
          </div>
          <button type="button" className="icon-button" onClick={() => void logout()} aria-label="Sign out">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </aside>
      <Outlet />
    </div>
  );
}

