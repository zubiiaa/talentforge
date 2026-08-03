import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Plus, SearchX } from "lucide-react";
import { getJobs } from "@/data/jobs";
import { getCurrentUser } from "@/lib/session";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Pagination } from "@/components/jobs/pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Jobs" };

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();

  const result = await getJobs({
    q: sp.q,
    type: sp.type,
    remote: sp.remote === "true",
    page: sp.page ? Number(sp.page) : 1,
  });

  const savedSet = new Set(user?.savedJobs ?? []);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Find your next role</h1>
          <p className="text-sm text-muted-foreground">
            {result.total} open position{result.total === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus /> Post a job
          </Link>
        </Button>
      </div>

      <Suspense>
        <JobFilters />
      </Suspense>

      {result.jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <SearchX className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-ink">No jobs match your search</p>
            <p className="text-sm text-muted-foreground">
              Try clearing filters or posting the first role.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {result.jobs.map((job) => (
            <JobCard key={job.id} job={job} saved={savedSet.has(job.id)} />
          ))}
        </div>
      )}

      <Pagination page={result.page} pages={result.pages} searchParams={sp} />
    </div>
  );
}
