"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { resumeSchema, type ResumeInput } from "@/lib/validations";
import { Resume } from "@/models/resume";
import { User, type UserDoc } from "@/models/user";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

/** Creates a resume, pre-filled from the user's profile, and returns its id. */
export async function createResume(): Promise<{ id?: string; error?: string }> {
  const userId = await requireUserId();
  await connectDB();

  const user = await User.findById(userId).lean<UserDoc>();
  if (!user) return { error: "User not found" };

  const doc = await Resume.create({
    owner: userId,
    title: `${user.name}'s Resume`,
    fullName: user.name,
    headline: user.headline,
    email: user.email,
    location: user.location,
    summary: user.bio,
    skills: user.skills,
    experience: user.experience,
    education: user.education,
  });

  revalidatePath("/resume");
  return { id: doc._id.toString() };
}

export async function updateResume(
  id: string,
  values: ResumeInput,
): Promise<{ ok?: boolean; error?: string }> {
  const parsed = resumeSchema.safeParse(values);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid resume" };
  }

  const userId = await requireUserId();
  await connectDB();

  const result = await Resume.updateOne({ _id: id, owner: userId }, parsed.data);
  if (result.matchedCount === 0) return { error: "Resume not found" };

  revalidatePath("/resume");
  revalidatePath(`/resume/${id}/edit`);
  return { ok: true };
}

export async function deleteResume(id: string): Promise<{ ok?: boolean; error?: string }> {
  const userId = await requireUserId();
  await connectDB();

  const result = await Resume.deleteOne({ _id: id, owner: userId });
  if (result.deletedCount === 0) return { error: "Resume not found" };

  revalidatePath("/resume");
  return { ok: true };
}
