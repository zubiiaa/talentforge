"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { saveUpload } from "@/lib/upload";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { User } from "@/models/user";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function updateProfile(input: ProfileInput) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid profile" };
  }

  const userId = await requireUserId();
  await connectDB();
  const user = await User.findByIdAndUpdate(userId, parsed.data, { new: true });
  if (!user) return { error: "User not found" };

  revalidatePath(`/profile/${user.username}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

type UploadTarget = "avatar" | "cover" | "resume";

export async function uploadProfileFile(formData: FormData) {
  const target = formData.get("target") as UploadTarget;
  const file = formData.get("file") as File | null;
  if (!file || !target) return { error: "No file provided" };

  const userId = await requireUserId();

  try {
    const url = await saveUpload(
      file,
      `users/${userId}`,
      target === "resume" ? "resume" : "image",
    );

    const field =
      target === "avatar" ? "avatarUrl" : target === "cover" ? "coverUrl" : "resumeUrl";

    await connectDB();
    const user = await User.findByIdAndUpdate(userId, { [field]: url }, { new: true });
    if (user) revalidatePath(`/profile/${user.username}`);

    return { ok: true, url };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed" };
  }
}

export async function recordProfileView(username: string) {
  const session = await auth();
  await connectDB();
  const owner = await User.findOne({ username }).select("_id").lean();
  if (!owner) return;
  // Don't count the owner viewing their own profile.
  if (session?.user?.id === owner._id.toString()) return;
  await User.updateOne({ _id: owner._id }, { $inc: { profileViews: 1 } });
}
