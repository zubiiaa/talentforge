import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getResumesByUser } from "@/data/resumes";
import { ResumeList } from "@/components/resume/resume-list";

export const metadata: Metadata = { title: "Resume builder" };

export default async function ResumePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resumes = await getResumesByUser(user.id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-ink">Resume builder</h1>
        <p className="text-sm text-muted-foreground">
          Build and manage multiple resumes, then export any of them as a polished PDF.
        </p>
      </div>
      <ResumeList resumes={resumes} />
    </div>
  );
}
