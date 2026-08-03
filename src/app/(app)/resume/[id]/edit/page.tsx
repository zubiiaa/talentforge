import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getResumeForOwner } from "@/data/resumes";
import { ResumeEditor } from "@/components/resume/resume-editor";

export const metadata: Metadata = { title: "Edit resume" };

export default async function ResumeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const resume = await getResumeForOwner(id, user.id);
  if (!resume) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <ResumeEditor resume={resume} />
    </div>
  );
}
