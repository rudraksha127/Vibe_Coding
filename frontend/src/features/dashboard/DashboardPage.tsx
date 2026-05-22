import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileText, MessageSquareText, Trophy } from "lucide-react";
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

  return (
    <main className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">{user?.profile.targetRole || "Interview prep"}</p>
          <h1>{user?.profile.name ? `${user.profile.name}'s readiness` : "Readiness dashboard"}</h1>
        </div>
        <Link className="primary-link" to="/interview">
          Start round
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </header>

      <section className="kpi-grid" aria-label="Progress">
        <MetricRing value={latestScore} label="IRS" />
        <Kpi icon={<FileText size={20} />} label="Resumes" value={resumes.data?.length ?? 0} />
        <Kpi icon={<MessageSquareText size={20} />} label="Active" value={inProgress} />
        <Kpi icon={<Trophy size={20} />} label="Completed" value={completed} />
      </section>

      <section className="split-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Recent sessions</h2>
            <Link to="/interview">Open</Link>
          </div>
          <div className="list-stack">
            {(interviews.data ?? []).slice(0, 5).map((session) => (
              <article className="list-item" key={session._id}>
                <div>
                  <strong>{session.targetRole}</strong>
                  <span>
                    {session.level} · {session.status.replace("_", " ")}
                  </span>
                </div>
                <b>{session.scorecard?.interviewReadinessScore ?? session.currentDifficulty}</b>
              </article>
            ))}
            {interviews.data?.length === 0 ? <EmptyLine text="No sessions yet" /> : null}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Resume signals</h2>
            <Link to="/resumes">Manage</Link>
          </div>
          <div className="signal-grid">
            {(resumes.data?.[0]?.parsed?.skills ?? []).slice(0, 8).map((skill) => (
              <span className="signal-chip" key={skill}>
                {skill}
              </span>
            ))}
            {!resumes.data?.[0]?.parsed?.skills?.length ? <EmptyLine text="No resume signals yet" /> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function Kpi({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="kpi-tile">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="empty-line">{text}</p>;
}
