import { zodResolver } from "@hookform/resolvers/zod";
import { BrainCircuit, GitBranch, LogIn, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../../auth/AuthProvider";
import { ApiClientError } from "../../lib/api/client";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const registerSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  targetRole: z.string().min(1).max(120),
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
      setError(caught instanceof ApiClientError ? caught.message : "Unable to sign in");
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="brand-lockup">
          <BrainCircuit size={32} aria-hidden="true" />
          <div>
            <h1 id="login-title">InterviewForge AI</h1>
            <p>Interview workspace</p>
          </div>
        </div>

        <form className="form-stack" onSubmit={form.handleSubmit(onSubmit)}>
          <label>
            <span>Email</span>
            <input type="email" autoComplete="email" {...form.register("email")} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" autoComplete="current-password" {...form.register("password")} />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={form.formState.isSubmitting}>
            <LogIn size={18} aria-hidden="true" />
            Sign in
          </button>
        </form>

        <div className="auth-row">
          <Link to="/register">Create account</Link>
          <button type="button" className="ghost-button" disabled>
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
      setError(caught instanceof ApiClientError ? caught.message : "Unable to create account");
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel auth-panel-wide" aria-labelledby="register-title">
        <div className="brand-lockup">
          <Mail size={32} aria-hidden="true" />
          <div>
            <h1 id="register-title">Create Workspace</h1>
            <p>InterviewForge AI</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={form.handleSubmit(onSubmit)}>
          <label>
            <span>Name</span>
            <input autoComplete="name" {...form.register("name")} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" autoComplete="email" {...form.register("email")} />
          </label>
          <label>
            <span>Password</span>
            <input type="password" autoComplete="new-password" {...form.register("password")} />
          </label>
          <label>
            <span>Target role</span>
            <input {...form.register("targetRole")} />
          </label>
          <label>
            <span>Experience</span>
            <select {...form.register("experienceLevel")}>
              <option value="fresh_graduate">Fresh graduate</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
              <option value="staff">Staff</option>
              <option value="principal">Principal</option>
            </select>
          </label>
          <label>
            <span>Target companies</span>
            <input placeholder="Google, Meta, Startup" {...form.register("targetCompanies")} />
          </label>
          {error ? <p className="form-error grid-span">{error}</p> : null}
          <button className="primary-button grid-span" type="submit" disabled={form.formState.isSubmitting}>
            <UserPlus size={18} aria-hidden="true" />
            Create account
          </button>
        </form>

        <div className="auth-row">
          <Link to="/login">Sign in</Link>
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
        <strong>84</strong>
        <span>IRS</span>
      </div>
    </aside>
  );
}
