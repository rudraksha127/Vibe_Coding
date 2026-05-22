import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, CheckCircle2, MessageSquarePlus, Send, SquareCheckBig } from "lucide-react";
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
import { listResumes } from "../../lib/api/resumes";
import type { InterviewQuestion, InterviewSession } from "../../types/api";

const sessionSchema = z.object({
  resumeId: z.string().optional(),
  targetRole: z.string().min(1).max(120),
  targetCompanies: z.string().max(240),
  language: z.string().min(2).max(12),
  level: z.enum(["L1", "L2", "L3", "L4", "L5", "L6", "L7"]),
  mode: z.enum(["structured", "free_practice", "company_simulation"]),
  companyPack: z.string().max(80).optional()
});

const answerSchema = z.object({
  answer: z.string().min(10).max(10_000)
});

type SessionValues = z.infer<typeof sessionSchema>;
type AnswerValues = z.infer<typeof answerSchema>;

export function InterviewPage() {
  const queryClient = useQueryClient();
  const resumes = useQuery({ queryKey: ["resumes"], queryFn: listResumes });
  const interviews = useQuery({ queryKey: ["interviews"], queryFn: listInterviews });
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

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
    }
  });

  const generateMutation = useMutation({
    mutationFn: async (session: InterviewSession) => generateQuestion(session._id, session.currentDifficulty),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
    }
  });

  const submitMutation = useMutation({
    mutationFn: async ({ session, question, answer }: { session: InterviewSession; question: InterviewQuestion; answer: string }) =>
      submitAnswer(session._id, question._id, answer),
    onSuccess: async () => {
      answerForm.reset({ answer: "" });
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
    }
  });

  const completeMutation = useMutation({
    mutationFn: completeInterview,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["interviews"] });
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
          <p className="eyebrow">Mock interview</p>
          <h1>{activeSession?.targetRole ?? "Interview room"}</h1>
        </div>
        {activeSession ? (
          <button
            className="secondary-button"
            type="button"
            onClick={() => completeMutation.mutate(activeSession._id)}
            disabled={completeMutation.isPending || activeSession.status === "completed"}
          >
            <SquareCheckBig size={18} aria-hidden="true" />
            Complete
          </button>
        ) : null}
      </header>

      <section className="interview-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Session setup</h2>
            <MessageSquarePlus size={20} aria-hidden="true" />
          </div>
          <form className="form-stack" onSubmit={sessionForm.handleSubmit(createSession)}>
            <label>
              <span>Resume</span>
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
              <span>Target role</span>
              <input {...sessionForm.register("targetRole")} />
            </label>
            <label>
              <span>Companies</span>
              <input {...sessionForm.register("targetCompanies")} />
            </label>
            <div className="form-duo">
              <label>
                <span>Level</span>
                <select {...sessionForm.register("level")}>
                  {(["L1", "L2", "L3", "L4", "L5", "L6", "L7"] as const).map((level) => (
                    <option value={level} key={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Mode</span>
                <select {...sessionForm.register("mode")}>
                  <option value="structured">Structured</option>
                  <option value="free_practice">Free practice</option>
                  <option value="company_simulation">Company</option>
                </select>
              </label>
            </div>
            <label>
              <span>Company pack</span>
              <input {...sessionForm.register("companyPack")} />
            </label>
            <button className="primary-button" type="submit" disabled={createSessionMutation.isPending}>
              <MessageSquarePlus size={18} aria-hidden="true" />
              Create session
            </button>
          </form>

          <div className="session-tabs" aria-label="Sessions">
            {(interviews.data ?? []).slice(0, 5).map((session) => (
              <button
                type="button"
                className={session._id === activeSession?._id ? "active" : ""}
                key={session._id}
                onClick={() => setActiveSessionId(session._id)}
              >
                {session.level} · {session.targetRole}
              </button>
            ))}
          </div>
        </div>

        <div className="panel interview-room">
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
              <span>{activeSession?.level ?? "L1"}</span>
              <strong>{latestQuestion?.roundName ?? "Ready"}</strong>
            </div>
            <b>{activeSession?.currentDifficulty ?? "medium"}</b>
          </div>

          <article className="question-surface">
            <p>{latestQuestion?.prompt ?? "Create a session, then generate a question."}</p>
            {latestQuestion ? (
              <div className="signal-grid">
                {latestQuestion.expectedSignals.slice(0, 7).map((signal) => (
                  <span className="signal-chip" key={signal}>
                    {signal}
                  </span>
                ))}
              </div>
            ) : null}
          </article>

          <div className="action-row">
            <button
              type="button"
              className="secondary-button"
              disabled={!activeSession || generateMutation.isPending}
              onClick={() => activeSession && generateMutation.mutate(activeSession)}
            >
              <MessageSquarePlus size={18} aria-hidden="true" />
              Generate
            </button>
            {latestAttempt ? (
              <span className={latestAttempt.feedback.passThresholdMet ? "pass-pill" : "retry-pill"}>
                {latestAttempt.feedback.passThresholdMet ? "Pass" : "Retry"}
              </span>
            ) : null}
          </div>

          <form className="answer-box" onSubmit={answerForm.handleSubmit(submit)}>
            <textarea rows={8} {...answerForm.register("answer")} />
            <button className="primary-button" type="submit" disabled={!latestQuestion || submitMutation.isPending}>
              <Send size={18} aria-hidden="true" />
              Submit answer
            </button>
          </form>
        </div>

        <div className="panel feedback-panel">
          <div className="panel-header">
            <h2>Feedback</h2>
            <CheckCircle2 size={20} aria-hidden="true" />
          </div>
          {latestAttempt ? (
            <>
              <MetricRing value={latestAttempt.scores.overall} label="Overall" />
              <div className="score-grid">
                <Score label="Communication" value={latestAttempt.scores.communication} />
                <Score label="Technical" value={latestAttempt.scores.technicalDepth} />
                <Score label="Relevance" value={latestAttempt.scores.relevance} />
                <Score label="Confidence" value={latestAttempt.scores.confidence} />
              </div>
              <p className="coaching-note">{latestAttempt.feedback.improvementTip}</p>
              <p className="model-answer">{latestAttempt.feedback.modelAnswer}</p>
            </>
          ) : activeSession?.scorecard ? (
            <>
              <MetricRing value={activeSession.scorecard.interviewReadinessScore} label="IRS" />
              {activeSession.scorecard.nextSteps.map((step) => (
                <p className="coaching-note" key={step}>
                  {step}
                </p>
              ))}
            </>
          ) : (
            <p className="empty-line">No feedback yet</p>
          )}
        </div>
      </section>
    </main>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="score-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
