import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, Loader2, MessageSquareText, Trophy } from "lucide-react";
import type { ReactNode } from "react";
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
      <main className="workspace" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="spin" size={40} aria-hidden="true" style={{ marginBottom: '16px' }} />
          <p style={{ color: 'var(--muted)' }}>Loading your dashboard...</p>
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
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px', color: 'var(--ink)' }}>
                Quick Tips
              </h3>
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
        <section className="panel" style={{ marginTop: '20px', textAlign: 'center', padding: '40px' }}>
          <SparkleIcon style={{ marginBottom: '16px' }} />
          <h2 style={{ marginBottom: '8px' }}>Get Started with InterviewForge</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}>
            Upload your resume to receive personalized interview questions and start practicing with our AI coach.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <span style={{ fontSize: '13px', fontWeight: '600' }}>{label}</span>
      </div>
      <strong>{value}</strong>
      {description && <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{description}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; label: string }> = {
    draft: { color: 'var(--muted)', label: 'Draft' },
    in_progress: { color: 'var(--blue)', label: 'In Progress' },
    completed: { color: 'var(--green-strong)', label: 'Completed' },
    abandoned: { color: 'var(--coral)', label: 'Abandoned' }
  };

  const config = statusConfig[status] || { color: 'var(--muted)', label: status };

  return (
    <span style={{ 
      color: config.color, 
      fontWeight: '600',
      fontSize: '12px'
    }}>
      {config.label}
    </span>
  );
}

function ScoreBadge({ score, isNumeric }: { score: string | number; isNumeric: boolean }) {
  if (!isNumeric) {
    return (
      <span style={{ 
        fontSize: '14px', 
        fontWeight: '700',
        textTransform: 'capitalize',
        color: 'var(--ink)'
      }}>
        {score}
      </span>
    );
  }

  const scoreNum = typeof score === 'number' ? score : parseInt(score);
  let color = 'var(--coral)';
  if (scoreNum >= 80) color = 'var(--green-strong)';
  else if (scoreNum >= 60) color = 'var(--amber)';
  else if (scoreNum >= 40) color = 'var(--blue)';

  return (
    <strong style={{ fontSize: '20px', fontWeight: '800', color }}>
      {scoreNum}
    </strong>
  );
}

function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '24px', 
      color: 'var(--muted)' 
    }}>
      <p style={{ fontWeight: '600', marginBottom: '4px' }}>{message}</p>
      {hint && <small>{hint}</small>}
    </div>
  );
}

function SparkleIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg 
      width="48" 
      height="48" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="var(--gold)" 
      strokeWidth="2" 
      style={style}
    >
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  );
}