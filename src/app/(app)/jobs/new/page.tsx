import type { Metadata } from "next";
import { CreateJobForm } from "@/components/jobs/create-job-form";

export const metadata: Metadata = { title: "Post a job" };

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-ink">Post a job</h1>
        <p className="text-sm text-muted-foreground">
          Reach candidates on TalentForge. Your listing goes live immediately.
        </p>
      </div>
      <CreateJobForm />
    </div>
  );
}
