"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { jobSchema, applicationSchema, type JobInput } from "@/lib/validations";
import { Job } from "@/models/job";
import { Application } from "@/models/application";
import { User } from "@/models/user";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function createJob(
  values: JobInput,
): Promise<{ error?: string; jobId?: string }> {
  const parsed = jobSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid job details" };
  }

  const userId = await requireUserId();
  await connectDB();
  const job = await Job.create({ ...parsed.data, employer: userId });

  revalidatePath("/jobs");
  return { jobId: job._id.toString() };
}

export async function applyToJob(jobId: string, coverNote: string) {
  const parsed = applicationSchema.safeParse({ jobId, coverNote });
  if (!parsed.success) return { error: "Invalid application" };

  const userId = await requireUserId();
  await connectDB();

  const job = await Job.findById(jobId).select("_id");
  if (!job) return { error: "Job not found" };

  try {
    await Application.create({
      job: jobId,
      applicant: userId,
      coverNote: parsed.data.coverNote,
    });
    await Job.updateOne({ _id: jobId }, { $inc: { applicantCount: 1 } });
  } catch {
    return { error: "You have already applied to this role." };
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function toggleSaveJob(jobId: string) {
  const userId = await requireUserId();
  await connectDB();

  const user = await User.findById(userId).select("savedJobs");
  if (!user) return { error: "User not found" };

  const saved = user.savedJobs.some((id) => id.toString() === jobId);
  await User.updateOne(
    { _id: userId },
    saved ? { $pull: { savedJobs: jobId } } : { $addToSet: { savedJobs: jobId } },
  );

  revalidatePath("/jobs");
  revalidatePath("/dashboard");
  return { ok: true, saved: !saved };
}
