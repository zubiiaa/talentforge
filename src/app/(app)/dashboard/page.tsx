import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { FileText, Briefcase, Bookmark, Eye } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getDashboardData } from "@/data/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileViewsChart, ApplicationStatusChart } from "@/components/dashboard/charts";

export const metadata: Metadata = { title: "Dashboard" };

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "outline"
> = {
  applied: "default",
  reviewed: "secondary",
  interview: "warning",
  offer: "success",
  rejected: "outline",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDashboardData(user.id);

  const stats = [
    { label: "Profile views", value: data.profileViews, icon: Eye },
    { label: "Posts created", value: data.postsCreated, icon: FileText },
    { label: "Jobs applied", value: data.jobsApplied, icon: Briefcase },
    { label: "Saved jobs", value: data.savedJobs, icon: Bookmark },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your activity at a glance, {user.name.split(" ")[0]}.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="h-4 w-4 text-brand" />
              </div>
              <p className="mt-2 text-3xl font-bold text-ink">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-1 font-semibold text-ink">Profile views</h2>
            <p className="mb-3 text-xs text-muted-foreground">Last 14 days</p>
            <ProfileViewsChart data={data.viewsSeries} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-1 font-semibold text-ink">Applications by status</h2>
            <p className="mb-3 text-xs text-muted-foreground">Where you stand</p>
            <ApplicationStatusChart data={data.statusBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Application history + saved */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 font-semibold text-ink">Application history</h2>
            {data.applications.length === 0 ? (
              <EmptyRow href="/jobs" label="Browse jobs to apply" />
            ) : (
              <ul className="divide-y divide-border/70">
                {data.applications.map((app) => (
                  <li key={app.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/jobs/${app.jobId}`}
                        className="truncate font-medium text-ink hover:underline"
                      >
                        {app.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {app.company} · {format(new Date(app.appliedAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[app.status] ?? "secondary"}>
                      {app.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 font-semibold text-ink">Saved jobs</h2>
            {data.saved.length === 0 ? (
              <EmptyRow href="/jobs" label="Save jobs to revisit later" />
            ) : (
              <ul className="divide-y divide-border/70">
                {data.saved.map((job) => (
                  <li key={job.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="truncate font-medium text-ink hover:underline"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {job.company} · {job.location}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmptyRow({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground hover:bg-accent"
    >
      {label}
    </Link>
  );
}
