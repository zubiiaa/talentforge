import { connectDB } from "@/lib/db";
import { Application } from "@/models/application";
import { Post } from "@/models/post";
import { User } from "@/models/user";
import { Job, type JobDoc } from "@/models/job";
import "@/models/job";

export type AppliedJob = {
  id: string;
  jobId: string;
  title: string;
  company: string;
  status: string;
  appliedAt: string;
};

export type SavedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
};

export type DashboardData = {
  postsCreated: number;
  jobsApplied: number;
  savedJobs: number;
  profileViews: number;
  applications: AppliedJob[];
  saved: SavedJob[];
  viewsSeries: { label: string; views: number }[];
  statusBreakdown: { status: string; count: number }[];
};

const STATUS_ORDER = ["applied", "reviewed", "interview", "offer", "rejected"];

/** Deterministic pseudo-random so the fake analytics chart is stable per user. */
function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  await connectDB();

  const user = await User.findById(userId).select("savedJobs profileViews").lean();
  const profileViews = user?.profileViews ?? 0;

  const [postsCreated, applicationDocs] = await Promise.all([
    Post.countDocuments({ author: userId }),
    Application.find({ applicant: userId })
      .sort({ createdAt: -1 })
      .populate("job", "title company")
      .lean(),
  ]);

  const savedIds = (user?.savedJobs ?? []).map((id) => id.toString());
  const savedDocs = savedIds.length
    ? await Job.find({ _id: { $in: savedIds } }).select("title company location").lean<JobDoc[]>()
    : [];

  const applications: AppliedJob[] = applicationDocs.map((a) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const job = a.job as any;
    return {
      id: a._id.toString(),
      jobId: job?._id?.toString() ?? "",
      title: job?.title ?? "Removed listing",
      company: job?.company ?? "",
      status: a.status,
      appliedAt: (a as { createdAt: Date }).createdAt.toISOString(),
    };
  });

  const statusCounts = new Map<string, number>();
  for (const a of applications) {
    statusCounts.set(a.status, (statusCounts.get(a.status) ?? 0) + 1);
  }
  const statusBreakdown = STATUS_ORDER.filter((s) => statusCounts.has(s)).map((status) => ({
    status,
    count: statusCounts.get(status) ?? 0,
  }));

  // Fake but stable profile-view analytics over the last 14 days.
  const rand = seeded(profileViews * 7 + postsCreated * 13 + 101);
  const base = Math.max(2, Math.round(profileViews / 14));
  const viewsSeries = Array.from({ length: 14 }, (_, i) => {
    const daysAgo = 13 - i;
    return {
      label: daysAgo === 0 ? "Today" : `${daysAgo}d`,
      views: Math.max(0, Math.round(base + rand() * (base + 4) - 2)),
    };
  });

  return {
    postsCreated,
    jobsApplied: applications.length,
    savedJobs: savedDocs.length,
    profileViews,
    applications,
    saved: savedDocs.map((j) => ({
      id: j._id.toString(),
      title: j.title,
      company: j.company,
      location: j.location,
    })),
    viewsSeries,
    statusBreakdown,
  };
}
