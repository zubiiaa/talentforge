import { connectDB } from "@/lib/db";
import { Resume, type ResumeDoc } from "@/models/resume";
import type { ResumeInput } from "@/lib/validations";

export type SafeResume = ResumeInput & {
  id: string;
  updatedAt: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serialize(doc: any): SafeResume {
  return {
    id: doc._id.toString(),
    title: doc.title ?? "Untitled resume",
    bulletPoints: doc.bulletPoints ?? true,
    fullName: doc.fullName ?? "",
    headline: doc.headline ?? "",
    email: doc.email ?? "",
    phone: doc.phone ?? "",
    location: doc.location ?? "",
    website: doc.website ?? "",
    summary: doc.summary ?? "",
    skills: [...(doc.skills ?? [])],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    experience: (doc.experience ?? []).map((e: any) => ({
      title: e.title ?? "",
      company: e.company ?? "",
      location: e.location ?? "",
      startDate: e.startDate ?? "",
      endDate: e.endDate ?? "",
      current: Boolean(e.current),
      description: e.description ?? "",
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    education: (doc.education ?? []).map((e: any) => ({
      school: e.school ?? "",
      degree: e.degree ?? "",
      field: e.field ?? "",
      startYear: e.startYear ?? "",
      endYear: e.endYear ?? "",
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projects: (doc.projects ?? []).map((p: any) => ({
      name: p.name ?? "",
      link: p.link ?? "",
      description: p.description ?? "",
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    certificates: (doc.certificates ?? []).map((c: any) => ({
      name: c.name ?? "",
      issuer: c.issuer ?? "",
      year: c.year ?? "",
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    customSections: (doc.customSections ?? []).map((s: any) => ({
      heading: s.heading ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items: (s.items ?? []).map((i: any) => ({
        title: i.title ?? "",
        subtitle: i.subtitle ?? "",
        description: i.description ?? "",
      })),
    })),
    updatedAt: (doc.updatedAt ?? new Date()).toISOString(),
  };
}

export async function getResumesByUser(userId: string): Promise<SafeResume[]> {
  await connectDB();
  const docs = await Resume.find({ owner: userId }).sort({ updatedAt: -1 }).lean<ResumeDoc[]>();
  return docs.map(serialize);
}

export async function getResumeForOwner(
  id: string,
  userId: string,
): Promise<SafeResume | null> {
  await connectDB();
  if (!id.match(/^[a-f0-9]{24}$/i)) return null;
  const doc = await Resume.findOne({ _id: id, owner: userId }).lean<ResumeDoc>();
  return doc ? serialize(doc) : null;
}
