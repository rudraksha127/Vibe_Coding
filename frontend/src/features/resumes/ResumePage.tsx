import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileCheck2, Loader2, RefreshCw, Save, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiClientError } from "../../lib/api/client";
import { analyzeResume, createResume, listResumes } from "../../lib/api/resumes";

const resumeSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  extractedText: z.string().min(20, "Please paste at least 20 characters of your resume").max(50_000),
  targetRole: z.string().max(120).optional(),
  isPrimary: z.boolean()
});

type ResumeValues = z.infer<typeof resumeSchema>;

export function ResumePage() {
  const queryClient = useQueryClient();
  const resumes = useQuery({ queryKey: ["resumes"], queryFn: listResumes });
  const form = useForm<ResumeValues>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      title: "Primary resume",
      extractedText: "",
      targetRole: "",
      isPrimary: true
    }
  });
  const createMutation = useMutation({
    mutationFn: createResume,
    onSuccess: async () => {
      form.reset({ title: "Primary resume", extractedText: "", targetRole: "", isPrimary: true });
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
    }
  });
  const analyzeMutation = useMutation({
    mutationFn: analyzeResume,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["resumes"] });
    }
  });

  async function onSubmit(values: ResumeValues): Promise<void> {
    await createMutation.mutateAsync(values);
  }

  const error = createMutation.error instanceof ApiClientError ? createMutation.error.message : null;

  return (
    <main className="workspace">
      <header className="workspace-header">
        <div>
          <p className="eyebrow">Resume Optimizer</p>
          <h1>Resume Analysis & Signals</h1>
        </div>
      </header>

      <section className="split-grid align-start">
        {/* Left Panel - Add Resume Form */}
        <form className="panel form-stack" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="panel-header">
            <h2>Add New Resume</h2>
            <FileCheck2 size={20} aria-hidden="true" />
          </div>
          
          <div style={{ 
            background: 'var(--mint)', 
            padding: '12px', 
            borderRadius: '6px', 
            fontSize: '13px',
            color: 'var(--green-strong)',
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start'
          }}>
            <Sparkles size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ margin: 0 }}>
              Paste your resume text below. Our AI will extract skills, experience, and provide actionable improvement suggestions.
            </p>
          </div>

          <label>
            <span>Resume Title</span>
            <input 
              placeholder="e.g., Software Engineer Resume 2026"
              {...form.register("title")} 
            />
          </label>
          <label>
            <span>Target Role (optional)</span>
            <input 
              placeholder="e.g., Senior Frontend Engineer"
              {...form.register("targetRole")} 
            />
          </label>
          <label>
            <span>Resume Text *</span>
            <textarea 
              rows={14} 
              placeholder="Paste your full resume text here...&#10;&#10;Include:&#10;• Work experience&#10;• Education&#10;• Skills&#10;• Projects&#10;• Certifications"
              {...form.register("extractedText")} 
            />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" {...form.register("isPrimary")} />
            <span>Set as primary resume for interview questions</span>
          </label>
          {error ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: 'var(--coral)',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          ) : null}
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? (
              <><Loader2 className="spin" size={18} /> Saving...</>
            ) : (
              <><Save size={18} /> Save Resume</>
            )}
          </button>
        </form>

        {/* Right Panel - Saved Resumes */}
        <div className="panel">
          <div className="panel-header">
            <h2>Saved Resumes</h2>
            <span style={{ 
              background: 'var(--green-strong)', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '12px',
              fontWeight: '700'
            }}>
              {resumes.data?.length ?? 0}
            </span>
          </div>
          <div className="list-stack">
            {resumes.isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                <Loader2 className="spin" size={24} style={{ marginBottom: '8px' }} />
                <p>Loading resumes...</p>
              </div>
            ) : (resumes.data ?? []).map((resume) => (
              <article className="resume-item" key={resume._id} style={{ 
                borderLeft: resume.isPrimary ? '4px solid var(--green)' : 'none',
                paddingLeft: resume.isPrimary ? '10px' : '14px'
              }}>
                <div className="resume-title-row">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <strong>{resume.title}</strong>
                      {resume.isPrimary && (
                        <span style={{ 
                          fontSize: '11px', 
                          background: 'var(--mint)', 
                          color: 'var(--green-strong)', 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontWeight: '700'
                        }}>
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                      <span>
                        <ATSScore score={resume.atsScore} />
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => analyzeMutation.mutate(resume._id)}
                    disabled={analyzeMutation.isPending}
                    aria-label="Analyze resume"
                    title="Re-analyze resume"
                  >
                    <RefreshCw size={17} className={analyzeMutation.isPending ? 'spin' : ''} aria-hidden="true" />
                  </button>
                </div>

                {/* Skills */}
                <div className="signal-grid" style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', width: '100%', marginBottom: '4px' }}>
                    Detected Skills
                  </span>
                  {(resume.parsed?.skills ?? []).slice(0, 8).map((skill) => (
                    <span className="signal-chip" key={skill}>
                      {skill}
                    </span>
                  ))}
                  {(resume.parsed?.skills ?? []).length === 0 && (
                    <span style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic' }}>
                      No skills detected yet
                    </span>
                  )}
                </div>

                {/* Suggestions */}
                {resume.suggestions.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                      Improvement Suggestions
                    </span>
                    {resume.suggestions.slice(0, 2).map((suggestion, idx) => (
                      <p className="coaching-note" key={idx} style={{ marginBottom: '6px', fontSize: '13px' }}>
                        <TrendingUp size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        {suggestion}
                      </p>
                    ))}
                  </div>
                )}
              </article>
            ))}
            {!resumes.isLoading && resumes.data?.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px', 
                color: 'var(--muted)' 
              }}>
                <FileCheck2 size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p style={{ fontWeight: '600' }}>No resumes saved</p>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  Add your first resume to get started
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

function ATSScore({ score }: { score: number }) {
  let color = 'var(--coral)';
  let label = 'Needs Work';
  
  if (score >= 80) {
    color = 'var(--green-strong)';
    label = 'Excellent';
  } else if (score >= 60) {
    color = 'var(--amber)';
    label = 'Good';
  } else if (score >= 40) {
    color = 'var(--blue)';
    label = 'Fair';
  }

  return (
    <span style={{ 
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '13px',
      fontWeight: '700',
      color
    }}>
      <CheckCircle2 size={14} />
      ATS Score: {score}/100 ({label})
    </span>
  );
}