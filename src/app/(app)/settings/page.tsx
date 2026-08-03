import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/session";
import { ProfileEditor } from "@/components/profile/profile-editor";

export const metadata: Metadata = { title: "Edit profile" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-ink">Edit profile</h1>
        <p className="text-sm text-muted-foreground">
          Keep your profile current — it powers your resume and how recruiters see you.
        </p>
      </div>
      <ProfileEditor user={user} />
    </div>
  );
}
