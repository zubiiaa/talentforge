"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { connectDB } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
} from "@/lib/validations";
import { User } from "@/models/user";

export type ActionState = { error?: string; ok?: boolean };

async function uniqueUsername(base: string) {
  const root =
    base
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 20) || "user";
  let candidate = root;
  let n = 0;
  // Collisions are rare; cap the loop defensively.
  while (await User.exists({ username: candidate })) {
    n += 1;
    candidate = `${root}${n}`;
    if (n > 9999) break;
  }
  return candidate;
}

export async function registerAction(values: RegisterInput): Promise<ActionState> {
  const parsed = registerSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  const { name, email, password, role } = parsed.data;

  await connectDB();

  if (await User.exists({ email })) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const username = await uniqueUsername(name);

  await User.create({ name, email, passwordHash, username, role });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch {
    // If auto sign-in fails for any reason, the account still exists.
    return { ok: true };
  }

  return { ok: true };
}

export async function loginAction(values: LoginInput): Promise<ActionState> {
  const parsed = loginSchema.safeParse(values);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid details" };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirect: false });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

const GUEST_TTL_MS = 24 * 60 * 60 * 1000; // guests expire after a day

// Every guest gets their own throwaway account, so one visitor never sees
// another's mess. Old guests get swept up whenever someone new drops in.
export async function loginAsGuest(
  role: "seeker" | "employer" = "seeker",
): Promise<ActionState> {
  await connectDB();

  // Lazy cleanup of expired guests and their content.
  const cutoff = new Date(Date.now() - GUEST_TTL_MS);
  const stale = await User.find({ isGuest: true, createdAt: { $lt: cutoff } })
    .select("_id")
    .lean();
  if (stale.length) {
    const ids = stale.map((u) => u._id);
    const { Post } = await import("@/models/post");
    const { Application } = await import("@/models/application");
    const { Resume } = await import("@/models/resume");
    const { Job } = await import("@/models/job");
    await Promise.all([
      Post.deleteMany({ author: { $in: ids } }),
      Application.deleteMany({ applicant: { $in: ids } }),
      Resume.deleteMany({ owner: { $in: ids } }),
      Job.deleteMany({ employer: { $in: ids } }),
      User.deleteMany({ _id: { $in: ids } }),
    ]);
  }

  const isEmployer = role === "employer";
  const token = crypto.randomUUID().slice(0, 8);
  const password = crypto.randomUUID();
  const email = `guest-${token}@demo.talentforge.app`;
  const username = `guest-${token}`;
  const passwordHash = await bcrypt.hash(password, 10);

  const profile = isEmployer
    ? {
        name: "Guest Recruiter",
        role: "employer",
        headline: "Hiring · Talent Acquisition",
        bio: "This is an isolated demo account for employers. Post a job, then open it to see applicants roll in — nothing here is visible to other visitors.",
        location: "Remote",
        skills: ["Hiring", "Recruiting", "Team Building"],
      }
    : {
        name: "Guest Explorer",
        role: "seeker",
        headline: "Exploring TalentForge",
        bio: "This is an isolated demo account. Feel free to try posting, applying, and editing — nothing here is visible to other visitors.",
        location: "Anywhere",
        skills: ["Product", "Design", "Engineering"],
        experience: [
          {
            title: "Product Explorer",
            company: "TalentForge Demo",
            location: "Remote",
            startDate: "2024",
            endDate: "",
            current: true,
            description: "Kicking the tires on every feature.",
          },
        ],
      };

  const user = await User.create({
    email,
    username,
    passwordHash,
    isGuest: true,
    ...profile,
  });

  // Give employer guests a starter listing so the hiring view isn't empty.
  if (isEmployer) {
    const { Job } = await import("@/models/job");
    await Job.create({
      title: "Product Designer",
      company: "Acme (Demo)",
      location: "Remote",
      salary: "$90k – $120k",
      remote: true,
      type: "Full-time",
      description:
        "A sample listing on your demo account. Edit or post new roles, then open a job to review applicants.",
      employer: user._id,
    });
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) return { error: "Could not start demo session." };
    throw error;
  }
}
