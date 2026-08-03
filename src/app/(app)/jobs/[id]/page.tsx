import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, Users, Building2 } from "lucide-react";
import { getJobById, hasApplied } from "@/data/jobs";
import { getCurrentUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ApplyBox } from "@/components/jobs/apply-box";
import { SaveJobButton } from "@/components/jobs/save-job-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await getJobById(id);
  return { title: job ? `${job.title} at ${job.company}` : "Job" };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [job, user] = await Promise.all([getJobById(id), getCurrentUser()]);
  if (!job) notFound();

  const applied = user ? await hasApplied(job.id, user.id) : false;
  const isEmployer = user?.id === job.employerId;
  const saved = user?.savedJobs.includes(job.id) ?? false;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Building2 className="h-7 w-7" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-ink">{job.title}</h1>
                <p className="text-muted-foreground">{job.company}</p>
              </div>
            </div>
            <SaveJobButton jobId={job.id} initialSaved={saved} />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> {job.location}
              {job.remote ? " · Remote" : ""}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {job.applicantCount} applicant
              {job.applicantCount === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{job.type}</Badge>
            {job.remote && <Badge variant="success">Remote</Badge>}
            {job.salary && <Badge variant="outline">{job.salary}</Badge>}
          </div>

          <div className="mt-6">
            {isEmployer ? (
              <p className="rounded-lg bg-secondary px-4 py-3 text-sm text-muted-foreground">
                This is your listing. You&apos;ve received {job.applicantCount} application
                {job.applicantCount === 1 ? "" : "s"}.
              </p>
            ) : (
              <ApplyBox jobId={job.id} alreadyApplied={applied} />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-3 font-semibold text-ink">About the role</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">
            {job.description}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
