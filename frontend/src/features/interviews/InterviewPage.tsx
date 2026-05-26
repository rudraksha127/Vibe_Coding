import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Bot, CheckCircle2, Clock, MessageSquarePlus, Send, Sparkles, SquareCheckBig } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { MetricRing } from "../../components/MetricRing";
import {
  completeInterview,
  createInterview,
  generateQuestion,
  listInterviews,
  submitAnswer
} from "../../lib/api/interviews";
import { ROLE_PRESETS } from "../../lib/rolePresets";
import { listResumes } from "../../lib/api/resumes";
import type { InterviewQuestion, InterviewSession } from "../../types/api";

const sessionSchema = z.object({
  resumeId: z.string().optional(),
  targetRole: z.string().min(1, "Target role is required").max(120),
  targetCompanies: z.string().max(240),
  language: z.string().min(2).max(12),
  level: z.enum(["L1", "L2", "L3", "L4", "L5", "L6", "L7"]),
  mode: z.enum(["structured", "free_practice", "company_simulation"]),
  companyPack: z.string().max(80).optional()
});

const answerSchema = z.object({
  answer: z.string().min(10, "Answer must be at least 10 characters").max(10_000)
});

type SessionValues = z.infer<typeof sessionSchema>;
type AnswerValues = z.infer<typeof answerSchema>;

const LEVEL_NAMES: Record<string, string> = {
  L1: "Recruiter Screen",
  L2: "Technical Phone",
  L3: "Virtual / Onsite",
  L4: "Mid Rounds",
  L5: "Behavioral + Leadership",
  L6: "Hiring Manager",
  L7: "Team Match / VP"
};

export function InterviewPage() {
  const queryClient = useQueryClient();
  const resumes = useQuery({ queryKey: ["resumes"], queryFn: listResumes });
  const interviews = useQuery({ queryKey: ["interviews"], queryFn: listInterviews });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  const activeSession = useMemo(
    () => interviews.data?.find((session) => session._id === activeSessionId) ?? interviews.data?.[0] ?? null,
    [activeSessionId, interviews.data]
  );

  useEffect(() => {
    if (!activeSessionId && activeSession?._id) {
      setActiveSessionId(activeSession._id);
    }
  }, [activeSession?._id, activeSessionId]);

  const sessionForm = useForm<SessionValues>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      resumeId: "",
      targetRole: "",
      targetCompanies: "",
      language: "en",
      level: "L1",
      mode: "structured",
      companyPack: ""
    }
  });
  const answerForm = useForm<AnswerValues>({
    resolver: zodResolver(answerSchema),
    defaultValues: { answer: "" }
  });
  const selectedRole = sessionForm.watch("targetRole");

  const createSessionMutation = useMutation({
    mutationFn: createInterview,
    onSuccess: async (session) => {
      setActiveSessionId(session._id);
      sessionForm.reset({
        resumeId: "",
        targetRole: "",
        targetCompanies: "",
        language: "en",
        level: "L1",
        mode: "structured",
        companyPack: ""
      });
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      setShowSuccessToast("Session created successfully!");
      setTimeout(() => setShowSuccessToast(null), 3000);
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (session: InterviewSession) => generateQuestion(session._id, session.currentDifficulty),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      setShowSuccessToast("Question generated!");
      setTimeout(() => setShowSuccessToast(null), 3000);
    }
  });

  const submitMutation = useMutation({
    mutationFn: async ({ session, question, answer }: { session: InterviewSession; question: InterviewQuestion; answer: string }) =>
      submitAnswer(session._id, question._id, answer),
    onSuccess: async () => {
      answerForm.reset({ answer: "" });
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      setShowSuccessToast("Answer submitted!");
      setTimeout(() => setShowSuccessToast(null), 3000);
    }
  });

  const completeMutation = useMutation({
    mutationFn: completeInterview,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
      setShowSuccessToast("Interview completed! Check your scorecard.");
      setTimeout(() => setShowSuccessToast(null), 4000);
    }
  });

  const latestQuestion = activeSession?.questions.at(-1) ?? null;
  const latestAttempt = latestQuestion?.attempts.at(-1) ?? null;

  async function createSession(values: SessionValues): Promise<void> {
    await createSessionMutation.mutateAsync({
      resumeId: values.resumeId || undefined,
      targetRole: values.targetRole,
      targetCompanies: values.targetCompanies
        .split(",")
        .map((company) => company.trim())
        .filter(Boolean),
      language: values.language,
      level: values.level,
      mode: values.mode,
      companyPack: values.companyPack || undefined
    });
  }

  async function submit(values: AnswerValues): Promise<void> {
    if (!activeSession || !latestQuestion) {
      return;
    }

    await submitMutation.mutateAsync({
      session: activeSession,
      question: latestQuestion,
      answer: values.answer
    });
  }

  return (
    <main className="workspace interview-workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Mock Interview Room</p>
          <h1>{activeSession?.targetRole ?? "Start a new session"}</h1>
        </div>
        {activeSession && (activeSession.status as string) !== "completed" ? (
          <button
            className="secondary-button"
            type="button"
            onClick={() => completeMutation.mutate(activeSession._id)}
            disabled={completeMutation.isPending || activeSession.status === "completed"}
          >
            <SquareCheckBig size={18} aria-hidden="true" />
            {completeMutation.isPending ? "Completing..." : "Complete Interview"}
          </button>
        ) : null}
      </header>

      {showSuccessToast && (
        <div className="toast" role="status">
          <CheckCircle2 size={18} className="toast-icon" />
          {showSuccessToast}
        </div>
      )}

      <section className="interview-grid">
        {/* Left Panel - Session Setup */}
        <div className="panel">
          <div className="panel-header">
            <h2>Session Setup</h2>
            <MessageSquarePlus size={20} aria-hidden="true" />
          </div>
          <form className="form-stack" onSubmit={sessionForm.handleSubmit(createSession)}>
            <label>
              <span>Resume (optional)</span>
              <select {...sessionForm.register("resumeId")}>
                <option value="">No resume selected</option>
                {(resumes.data ?? []).map((resume) => (
                  <option value={resume._id} key={resume._id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Target role *</span>
              <input 
                placeholder="e.g., Site Reliability Engineer (SRE)"
                {...sessionForm.register("targetRole")} 
              />
            </label>
            <div className="role-picker" aria-label="Role presets">
              {ROLE_PRESETS.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  className={`role-chip${selectedRole === role.value ? " role-chip-active" : ""}`}
                  aria-pressed={selectedRole === role.value}
                  onClick={() => sessionForm.setValue("targetRole", role.value, { shouldDirty: true, shouldValidate: true })}
                >
                  {role.label}
                </button>
              ))}
            </div>
            <label>
              <span>Target companies</span>
              <input 
                placeholder="e.g., Google, Meta, Amazon"
                {...sessionForm.register("targetCompanies")} 
              />
            </label>
            <div className="form-duo">
              <label>
                <span>Interview Level</span>
                <select {...sessionForm.register("level")}>
                  {(["L1", "L2", "L3", "L4", "L5", "L6", "L7"] as const).map((level) => (
                    <option value={level} key={level}>
                      {level} - {LEVEL_NAMES[level]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Practice Mode</span>
                <select {...sessionForm.register("mode")}>
                  <option value="structured">Structured</option>
                  <option value="free_practice">Free Practice</option>
                  <option value="company_simulation">Company Sim</option>
                </select>
              </label>
            </div>
            <label>
              <span>Company pack (optional)</span>
              <input 
                placeholder="e.g., google, amazon"
                {...sessionForm.register("companyPack")} 
              />
            </label>
            <button className="primary-button" type="submit" disabled={createSessionMutation.isPending}>
              <Sparkles size={18} aria-hidden="true" />
              {createSessionMutation.isPending ? "Creating..." : "Create Session"}
            </button>
          </form>

          {interviews.data && interviews.data.length > 0 && (
            <div className="section-spacer">
              <h3 className="session-heading">Recent Sessions</h3>
              <div className="session-tabs" aria-label="Sessions">
                {(interviews.data ?? []).slice(0, 5).map((session) => (
                  <button
                    type="button"
                    className={session._id === activeSession?._id ? "active" : ""}
                    key={session._id}
                    onClick={() => setActiveSessionId(session._id)}
                  >
                    <span className="session-level">{session.level}</span>
                    <span className="session-title">{session.targetRole}</span>
                    <StatusDot status={session.status} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Panel - Interview Room */}
        <div className="panel interview-room">
          {/* Interviewer Band */}
          <div className="interviewer-band">
            <div className="interviewer-visual">
              <Bot size={34} aria-hidden="true" />
              <div className="voice-bars">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
            <div>
              <span className="interviewer-meta">{LEVEL_NAMES[activeSession?.level ?? "L1"] ?? "L1"}</span>
              <strong>{latestQuestion?.roundName ?? "Ready to start"}</strong>
            </div>
            <b className="difficulty-pill" style={getDifficultyPillStyle(activeSession?.currentDifficulty)}>
              {activeSession?.currentDifficulty ?? "ready"}
            </b>
          </div>

          {/* Question Display */}
          <article className="question-surface">
            {latestQuestion ? (
              <>
                <p>{latestQuestion.prompt}</p>
                {latestQuestion.anchor && (
                  <div className="anchor-note">
                    <AlertCircle size={14} aria-hidden="true" />
                    Anchored to your resume: {latestQuestion.anchor}
                  </div>
                )}
                <div className="signal-grid">
                  {latestQuestion.expectedSignals.slice(0, 7).map((signal) => (
                    <span className="signal-chip" key={signal}>
                      {signal}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <div className="center-stack">
                <Bot size={48} className="icon" aria-hidden="true" />
                <p>Create a session and generate a question</p>
                <small>Your AI interviewer is ready to begin</small>
              </div>
            )}
          </article>

          {/* Action Row */}
          <div className="action-row">
            <button
              type="button"
              className="secondary-button"
              disabled={!activeSession || generateMutation.isPending}
              onClick={() => activeSession && generateMutation.mutate(activeSession)}
            >
              <Sparkles size={18} aria-hidden="true" />
              {generateMutation.isPending ? "Generating..." : "Generate Question"}
            </button>
            {latestAttempt ? (
              <span className={`pill-row ${latestAttempt.feedback.passThresholdMet ? "pass-pill" : "retry-pill"}`}>
                {latestAttempt.feedback.passThresholdMet ? (
                  <><CheckCircle2 size={14} /> Pass</>
                ) : (
                  <><Clock size={14} /> Retry Recommended</>
                )}
              </span>
            ) : null}
          </div>

          {/* Answer Input */}
          <form className="answer-box" onSubmit={answerForm.handleSubmit(submit)}>
            <textarea 
              rows={8} 
              placeholder="Type your answer here... (minimum 10 characters)"
              {...answerForm.register("answer")} 
            />
            <div className="answer-meta">
              <span className="answer-count">
                {answerForm.watch("answer").length} / 10000 characters
              </span>
              <button 
                className="primary-button" 
                type="submit" 
                disabled={!latestQuestion || submitMutation.isPending}
              >
                <Send size={18} aria-hidden="true" />
                {submitMutation.isPending ? "Submitting..." : "Submit Answer"}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel - Feedback */}
        <div className="panel feedback-panel">
          <div className="panel-header">
            <h2>Feedback & Scores</h2>
            <CheckCircle2 size={20} aria-hidden="true" />
          </div>
          {latestAttempt ? (
            <>
              <MetricRing value={latestAttempt.scores.overall} label="Overall" />
              <div className="score-grid">
                <ScoreLine label="Communication" value={latestAttempt.scores.communication} />
                <ScoreLine label="Technical" value={latestAttempt.scores.technicalDepth} />
                <ScoreLine label="Relevance" value={latestAttempt.scores.relevance} />
                <ScoreLine label="Confidence" value={latestAttempt.scores.confidence} />
              </div>
              {latestAttempt.feedback.strong.length > 0 && (
                <div className="feedback-section">
                  <h4 className="feedback-title feedback-title-strong">Strong Points</h4>
                  {latestAttempt.feedback.strong.slice(0, 2).map((point, idx) => (
                    <p key={idx} className="coaching-note note-compact">
                      {point}
                    </p>
                  ))}
                </div>
              )}
              {latestAttempt.feedback.weak.length > 0 && (
                <div className="feedback-section">
                  <h4 className="feedback-title feedback-title-weak">Areas to Improve</h4>
                  {latestAttempt.feedback.weak.slice(0, 2).map((point, idx) => (
                    <p key={idx} className="model-answer note-compact">
                      {point}
                    </p>
                  ))}
                </div>
              )}
              <p className="coaching-note">
                <strong>Tip:</strong> {latestAttempt.feedback.improvementTip}
              </p>
              <p className="model-answer">
                <strong className="model-answer-title">Model Answer</strong>
                {latestAttempt.feedback.modelAnswer}
              </p>
            </>
          ) : activeSession?.scorecard ? (
            <>
              <MetricRing value={activeSession.scorecard.interviewReadinessScore} label="IRS" />
              <div className="scorecard-block">
                <div className="score-line">
                  <span>Strongest Area</span>
                  <strong className="scorecard-strong">{activeSession.scorecard.strongestArea}</strong>
                </div>
                <div className="score-line">
                  <span>Weakest Area</span>
                  <strong className="scorecard-weak">{activeSession.scorecard.weakestArea}</strong>
                </div>
              </div>
              <div className="scorecard-next">
                <h4 className="scorecard-next-title">Next Steps</h4>
                {activeSession.scorecard.nextSteps.map((step, idx) => (
                  <p className="coaching-note note-compact" key={idx}>
                    {step}
                  </p>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state panel-loading">
              <Sparkles size={32} className="resume-empty-icon" />
              <p>No feedback yet</p>
              <small>Submit an answer to receive AI feedback</small>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ScoreLine({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return 'var(--green-strong)';
    if (v >= 60) return 'var(--amber)';
    return 'var(--coral)';
  };

  return (
    <div className="score-line">
      <span>{label}</span>
      <strong className="score-value" style={{ "--score-color": getColor(value) } as CSSProperties}>
        {value}/100
      </strong>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'completed' ? 'var(--green)' : status === 'in_progress' ? 'var(--blue)' : 'var(--muted)';
  return (
    <span className="status-dot" style={{ "--dot-color": color } as CSSProperties} />
  );
}

function getDifficultyPillStyle(difficulty: string | undefined): CSSProperties {
  const config: Partial<Record<string, { bg: string; color: string }>> = {
    easy: { bg: "rgba(14, 165, 233, 0.22)", color: "var(--green-strong)" },
    medium: { bg: "rgba(245, 158, 11, 0.18)", color: "var(--amber)" },
    hard: { bg: "rgba(239, 68, 68, 0.18)", color: "var(--coral)" },
    ready: { bg: "rgba(245, 158, 11, 0.14)", color: "var(--gold)" }
  };

  const fallback = { bg: "rgba(245, 158, 11, 0.14)", color: "var(--gold)" };
  const selected = config[difficulty ?? "ready"] ?? fallback;

  return {
    "--difficulty-bg": selected.bg,
    "--difficulty-color": selected.color
  } as CSSProperties;
}
