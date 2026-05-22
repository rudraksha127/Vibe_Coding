import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileCheck2, RefreshCw, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ApiClientError } from "../../lib/api/client";
import { analyzeResume, createResume, listResumes } from "../../lib/api/resumes";

const resumeSchema = z.object({
  title: z.string().min(1).max(120),
  extractedText: z.string().min(20).max(50_000),
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
          <p className="eyebrow">Resume optimizer</p>
          <h1>Resume signals</h1>
        </div>
      </header>

      <section className="split-grid align-start">
        <form className="panel form-stack" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="panel-header">
            <h2>Add resume</h2>
            <FileCheck2 size={20} aria-hidden="true" />
          </div>
          <label>
            <span>Title</span>
            <input {...form.register("title")} />
          </label>
          <label>
            <span>Target role</span>
            <input {...form.register("targetRole")} />
          </label>
          <label>
            <span>Resume text</span>
            <textarea rows={12} {...form.register("extractedText")} />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" {...form.register("isPrimary")} />
            <span>Primary resume</span>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>
            <Save size={18} aria-hidden="true" />
            Save resume
          </button>
        </form>

        <div className="panel">
          <div className="panel-header">
            <h2>Saved resumes</h2>
            <span>{resumes.data?.length ?? 0}</span>
          </div>
          <div className="list-stack">
            {(resumes.data ?? []).map((resume) => (
              <article className="resume-item" key={resume._id}>
                <div className="resume-title-row">
                  <div>
                    <strong>{resume.title}</strong>
                    <span>ATS {resume.atsScore}/100</span>
                  </div>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => analyzeMutation.mutate(resume._id)}
                    aria-label="Analyze resume"
                  >
                    <RefreshCw size={17} aria-hidden="true" />
                  </button>
                </div>
                <div className="signal-grid">
                  {(resume.parsed?.skills ?? []).slice(0, 8).map((skill) => (
                    <span className="signal-chip" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
                {resume.suggestions.slice(0, 3).map((suggestion) => (
                  <p className="coaching-note" key={suggestion}>
                    {suggestion}
                  </p>
                ))}
              </article>
            ))}
            {resumes.data?.length === 0 ? <p className="empty-line">No resumes saved</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

