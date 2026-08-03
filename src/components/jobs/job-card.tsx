import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, Users, Building2 } from "lucide-react";
import type { SafeJob } from "@/data/jobs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SaveJobButton } from "./save-job-button";

export function JobCard({ job, saved }: { job: SafeJob; saved: boolean }) {
  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand-700">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <Link href={`/jobs/${job.id}`} className="font-semibold text-ink hover:underline">
              {job.title}
            </Link>
            <p className="text-sm text-muted-foreground">{job.company}</p>
          </div>
        </div>
        <SaveJobButton jobId={job.id} initialSaved={saved} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {job.location}
          {job.remote ? " · Remote" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </span>
        <span className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          {job.applicantCount} applicant{job.applicantCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{job.type}</Badge>
        {job.remote && <Badge variant="success">Remote</Badge>}
        {job.salary && <Badge variant="outline">{job.salary}</Badge>}
      </div>

      <p className="mt-3 line-clamp-2 text-sm text-ink/70">{job.description}</p>

      <div className="mt-4">
        <Link
          href={`/jobs/${job.id}`}
          className="text-sm font-medium text-brand hover:underline"
        >
          View & apply →
        </Link>
      </div>
    </Card>
  );
}
