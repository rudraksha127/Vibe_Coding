import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, Loader2, MessageSquareText, Trophy } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { MetricRing } from "../../components/MetricRing";
import { listInterviews } from "../../lib/api/interviews";
import { listResumes } from "../../lib/api/resumes";

export function DashboardPage() {
  const { user } = useAuth();
  const resumes = useQuery({ queryKey: ["resumes"], queryFn: listResumes });
  const interviews = useQuery({ queryKey: ["interviews"], queryFn: listInterviews });
  const latestScore =
    interviews.data?.find((session) => session.scorecard)?.scorecard?.interviewReadinessScore ?? 0;
  const completed = interviews.data?.filter((session) => session.status === "completed").length ?? 0;
  const inProgress = interviews.data?.filter((session) => session.status === "in_progress").length ?? 0;

  const isLoading = resumes.isLoading || interviews.isLoading;

  if (isLoading) {
    return (
      <main className="workspace workspace-centered">
        <div className="center-stack">
          <Loader2 className="spin icon" size={40} aria-hidden="true" />
          <p>Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">{user?.profile.targetRole || "Interview preparation"}</p>
          <h1>
            {user?.profile.name 
              ? `Welcome back, ${user.profile.name.split(' ')[0]}!` 
              : "Your Readiness Dashboard"}
          </h1>
        </div>
        <Link className="primary-link" to="/interview">
          Start interview
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </header>

      <section className="kpi-grid" aria-label="Progress metrics">
        <MetricRing value={latestScore} label="IRS" />
        <Kpi 
          icon={<FileText size={20} />} 
          label="Resumes" 
          value={resumes.data?.length ?? 0} 
          description="Uploaded resumes"
        />
        <Kpi 
          icon={<MessageSquareText size={20} />} 
          label="In Progress" 
          value={inProgress} 
          description="Active sessions"
        />
        <Kpi 
          icon={<Trophy size={20} />} 
          label="Completed" 
          value={completed} 
          description="Finished interviews"
        />
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Recent interview sessions</h2>
            <Link to="/interview">View all</Link>
          </div>
          <div className="list-stack">
            {(interviews.data ?? []).slice(0, 5).map((session) => (
              <article className="list-item" key={session._id}>
                <div>
                  <strong>{session.targetRole}</strong>
                  <span>
                    {session.level} · <StatusBadge status={session.status} />
                  </span>
                </div>
                <ScoreBadge 
                  score={session.scorecard?.interviewReadinessScore ?? session.currentDifficulty} 
                  isNumeric={typeof (session.scorecard?.interviewReadinessScore ?? session.currentDifficulty) === 'number'}
                />
              </article>
            ))}
            {interviews.data?.length === 0 ? (
              <EmptyState 
                message="No interview sessions yet" 
                hint="Create your first session to start practicing"
              />
            ) : null}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Resume insights</h2>
            <Link to="/resumes">Manage resumes</Link>
          </div>
          <div className="signal-grid">
            {(resumes.data?.[0]?.parsed?.skills ?? []).slice(0, 8).map((skill) => (
              <span className="signal-chip" key={skill}>
                {skill}
              </span>
            ))}
            {!resumes.data?.[0]?.parsed?.skills?.length ? (
              <EmptyState 
                message="No skills detected yet" 
                hint="Add a resume to see your skills"
              />
            ) : null}
          </div>
          {resumes.data?.[0]?.suggestions?.length ? (
            <div className="quicktips">
              <h3 className="quicktips-title">Quick Tips</h3>
              {resumes.data[0].suggestions.slice(0, 2).map((suggestion, idx) => (
                <p className="coaching-note" key={idx} style={{ marginBottom: '8px' }}>
                  {suggestion}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {interviews.data?.length === 0 && resumes.data?.length === 0 ? (
        <section className="panel cta-panel">
          <SparkleIcon className="cta-icon" />
          <h2 style={{ marginBottom: '8px' }}>Get Started with InterviewForge</h2>
          <p>
            Upload your resume to receive personalized interview questions and start practicing with our AI coach.
          </p>
          <div className="cta-actions">
            <Link className="primary-link" to="/resumes">
              <FileText size={18} />
              Upload Resume
            </Link>
            <Link className="secondary-button" to="/interview">
              <MessageSquareText size={18} />
              Start Practice
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Kpi({ icon, label, value, description }: { icon: ReactNode; label: string; value: number; description?: string }) {
  return (
    <div className="kpi-tile">
      <div className="kpi-row">
        {icon}
        <span className="kpi-label">{label}</span>
      </div>
      <strong>{value}</strong>
      {description && <span className="kpi-desc">{description}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { className: string; label: string }> = {
    draft: { className: "status-badge-draft", label: "Draft" },
    in_progress: { className: "status-badge-in_progress", label: "In Progress" },
    completed: { className: "status-badge-completed", label: "Completed" },
    abandoned: { className: "status-badge-abandoned", label: "Abandoned" }
  };

  const config = statusConfig[status] || { className: "status-badge-draft", label: status };

  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}

function ScoreBadge({ score, isNumeric }: { score: string | number; isNumeric: boolean }) {
  if (!isNumeric) {
    return <span className="score-text">{score}</span>;
  }

  const scoreNum = typeof score === 'number' ? score : parseInt(score);
  let color = 'var(--coral)';
  if (scoreNum >= 80) color = 'var(--green-strong)';
  else if (scoreNum >= 60) color = 'var(--amber)';
  else if (scoreNum >= 40) color = 'var(--blue)';

  return (
    <strong className="score-number" style={{ "--score-color": color } as CSSProperties}>
      {scoreNum}
    </strong>
  );
}

function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="48" 
      height="48" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="var(--gold)" 
      strokeWidth="2" 
      className={className}
    >
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}
