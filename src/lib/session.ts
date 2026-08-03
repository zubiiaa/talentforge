import { cache } from "react";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User, type UserDoc } from "@/models/user";

export type Experience = {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

export type Education = {
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
};

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  isGuest: boolean;
  headline: string;
  bio: string;
  location: string;
  avatarUrl: string;
  coverUrl: string;
  resumeUrl: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  savedJobs: string[];
  profileViews: number;
};

export function serializeUser(doc: UserDoc): SafeUser {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    username: doc.username,
    role: doc.role,
    isGuest: Boolean((doc as UserDoc & { isGuest?: boolean }).isGuest),
    headline: doc.headline,
    bio: doc.bio,
    location: doc.location,
    avatarUrl: doc.avatarUrl,
    coverUrl: doc.coverUrl,
    resumeUrl: doc.resumeUrl,
    skills: [...doc.skills],
    experience: (doc.experience ?? []).map((e) => ({
      title: e.title,
      company: e.company,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      current: e.current,
      description: e.description,
    })),
    education: (doc.education ?? []).map((e) => ({
      school: e.school,
      degree: e.degree,
      field: e.field,
      startYear: e.startYear,
      endYear: e.endYear,
    })),
    savedJobs: (doc.savedJobs ?? []).map((id) => id.toString()),
    profileViews: doc.profileViews,
  };
}

/** Returns the full DB-backed user for the current session, or null. */
export const getCurrentUser = cache(async (): Promise<SafeUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const doc = await User.findById(session.user.id).lean<UserDoc>();
  if (!doc) return null;

  return serializeUser(doc);
});
