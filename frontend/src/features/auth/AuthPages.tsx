import { zodResolver } from "@hookform/resolvers/zod";
import { BrainCircuit, CheckCircle2, GitBranch, LogIn, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../auth/AuthProvider";
import { ApiClientError } from "../../lib/api/client";
import { ROLE_PRESETS } from "../../lib/rolePresets";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  targetRole: z.string().min(1, "Target role is required").max(120),
  experienceLevel: z.enum(["fresh_graduate", "junior", "mid", "senior", "staff", "principal"]),
  targetCompanies: z.string().max(240)
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: LoginValues): Promise<void> {
    setError(null);
    try {
      await login(values);
      navigate("/", { replace: true });
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Unable to sign in. Please check your credentials.");
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="brand-lockup">
          <BrainCircuit size={32} aria-hidden="true" />
          <div>
            <h1 id="login-title">InterviewForge AI</h1>
            <p>Role-ready practice for SRE, DevOps, QA, and engineers</p>
          </div>
        </div>

        <form className="form-stack" onSubmit={form.handleSubmit(onSubmit)}>
          <label>
            <span>Email</span>
            <input 
              type="email" 
              autoComplete="email" 
              placeholder="you@example.com"
              {...form.register("email")} 
            />
          </label>
          <label>
            <span>Password</span>
            <input 
              type="password" 
              autoComplete="current-password" 
              placeholder="Enter your password"
              {...form.register("password")} 
            />
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={form.formState.isSubmitting}>
            <LogIn size={18} aria-hidden="true" />
            {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="auth-row">
          <Link to="/register">Create new account</Link>
          <button type="button" className="ghost-button" disabled title="Coming soon">
            <GitBranch size={16} aria-hidden="true" />
            GitHub
          </button>
        </div>
      </section>
      <InterviewPreview />
    </main>
  );
}

export function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      targetRole: "",
      experienceLevel: "fresh_graduate",
      targetCompanies: ""
    }
  });
  const selectedRole = form.watch("targetRole");

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function onSubmit(values: RegisterValues): Promise<void> {
    setError(null);
    try {
      await register({
        email: values.email,
        password: values.password,
        profile: {
          name: values.name,
          targetRole: values.targetRole,
          experienceLevel: values.experienceLevel,
          targetCompanies: values.targetCompanies
            .split(",")
            .map((company) => company.trim())
            .filter(Boolean),
          preferredLanguage: "en",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          dressCodePreference: "business_casual"
        }
      });
      navigate("/", { replace: true });
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught.message : "Unable to create account. Please try again.");
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel auth-panel-wide" aria-labelledby="register-title">
        <div className="brand-lockup">
          <Sparkles size={32} aria-hidden="true" />
          <div>
            <h1 id="register-title">Create Workspace</h1>
            <p>Start your interview preparation journey</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={form.handleSubmit(onSubmit)}>
          <label>
            <span>Full name</span>
            <input autoComplete="name" placeholder="John Doe" {...form.register("name")} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" autoComplete="new-password" placeholder="Min 8 characters" {...form.register("password")} />
          </label>
          <label>
            <span>Target role</span>
            <input placeholder="e.g., Site Reliability Engineer (SRE)" {...form.register("targetRole")} />
          </label>
          <div className="grid-span role-picker" aria-label="Role presets">
            {ROLE_PRESETS.map((role) => (
              <button
                key={role.value}
                type="button"
                className={`role-chip${selectedRole === role.value ? " role-chip-active" : ""}`}
                aria-pressed={selectedRole === role.value}
                onClick={() => form.setValue("targetRole", role.value, { shouldDirty: true, shouldValidate: true })}
              >
                {role.label}
              </button>
            ))}
          </div>
          <label>
            <span>Experience level</span>
            <select {...form.register("experienceLevel")}>
              <option value="fresh_graduate">Fresh graduate (0-1 years)</option>
              <option value="junior">Junior (1-2 years)</option>
              <option value="mid">Mid-level (2-5 years)</option>
              <option value="senior">Senior (5-8 years)</option>
              <option value="staff">Staff (8-12 years)</option>
              <option value="principal">Principal (12+ years)</option>
            </select>
          </label>
          <label>
            <span>Target companies</span>
            <input placeholder="Google, Meta, Amazon" {...form.register("targetCompanies")} />
          </label>
          {error ? <p className="form-error grid-span" role="alert">{error}</p> : null}
          <button className="primary-button grid-span" type="submit" disabled={form.formState.isSubmitting}>
            <UserPlus size={18} aria-hidden="true" />
            {form.formState.isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-row">
          <Link to="/login">Already have an account? Sign in</Link>
        </div>
      </section>
      <InterviewPreview />
    </main>
  );
}

function InterviewPreview() {
  return (
    <aside className="preview-stage" aria-hidden="true">
      <div className="avatar-tile">
        <div className="avatar-head">
          <span />
          <span />
        </div>
        <div className="avatar-body" />
        <div className="waveform">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="score-strip">
        <div>
          <strong>84</strong>
          <span>Interview Readiness Score</span>
        </div>
        <CheckCircle2 size={24} aria-hidden="true" className="accent-icon" />
      </div>
      <div className="preview-note">
        <strong className="preview-note-title">AI-Powered Practice</strong>
        Get personalized feedback, adaptive questions, and track your improvement over time.
      </div>
    </aside>
  );
}
