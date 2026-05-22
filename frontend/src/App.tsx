import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { LoginPage, RegisterPage } from "./features/auth/AuthPages";
import { AppShell } from "./features/dashboard/AppShell";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { InterviewPage } from "./features/interviews/InterviewPage";
import { ResumePage } from "./features/resumes/ResumePage";

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="/resumes" element={<ResumePage />} />
          <Route path="/interview" element={<InterviewPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

