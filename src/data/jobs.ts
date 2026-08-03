import { FilterQuery } from "mongoose";
import { connectDB } from "@/lib/db";
import { Job, type JobDoc } from "@/models/job";
import { Application } from "@/models/application";

export type SafeJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  remote: boolean;
  type: string;
  description: string;
  applicantCount: number;
  createdAt: string;
  employerId: string;
};

function serializeJob(doc: JobDoc): SafeJob {
  return {
    id: doc._id.toString(),
    title: doc.title,
    company: doc.company,
    location: doc.location,
    salary: doc.salary,
    remote: doc.remote,
    type: doc.type,
    description: doc.description,
    applicantCount: doc.applicantCount,
    createdAt: (doc as JobDoc & { createdAt: Date }).createdAt.toISOString(),
    employerId: doc.employer.toString(),
  };
}

export type JobQuery = {
  q?: string;
  type?: string;
  remote?: boolean;
  page?: number;
  pageSize?: number;
};

export type JobListResult = {
  jobs: SafeJob[];
  total: number;
  page: number;
  pages: number;
};

export async function getJobs(query: JobQuery = {}): Promise<JobListResult> {
  const { q, type, remote, page = 1, pageSize = 8 } = query;
  await connectDB();

  const filter: FilterQuery<JobDoc> = {};
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { company: rx }, { location: rx }];
  }
  if (type) filter.type = type;
  if (remote) filter.remote = true;

  const safePage = Math.max(1, page);
  const [docs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * pageSize)
      .limit(pageSize)
      .lean<JobDoc[]>(),
    Job.countDocuments(filter),
  ]);

  return {
    jobs: docs.map(serializeJob),
    total,
    page: safePage,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getJobById(id: string): Promise<SafeJob | null> {
  await connectDB();
  if (!id.match(/^[a-f0-9]{24}$/i)) return null;
  const doc = await Job.findById(id).lean<JobDoc>();
  return doc ? serializeJob(doc) : null;
}

export async function hasApplied(jobId: string, userId: string): Promise<boolean> {
  await connectDB();
  const exists = await Application.exists({ job: jobId, applicant: userId });
  return !!exists;
}
