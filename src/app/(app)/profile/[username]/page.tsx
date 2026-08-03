import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { MapPin, Pencil, Download, FileText, Eye } from "lucide-react";
import { getUserByUsername } from "@/data/users";
import { getPostsByUser } from "@/data/posts";
import { getCurrentUser } from "@/lib/session";
import { recordProfileView } from "@/server/actions/profile";
import { PostCard } from "@/components/feed/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { initials } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserByUsername(username);
  return { title: user ? `${user.name}` : "Profile" };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [user, viewer] = await Promise.all([
    getUserByUsername(username),
    getCurrentUser(),
  ]);

  if (!user) notFound();

  const isOwner = viewer?.id === user.id;
  if (!isOwner) await recordProfileView(username);

  const posts = await getPostsByUser(user.id, viewer?.id);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {/* Header card */}
      <Card className="overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-brand to-brand-700 sm:h-52">
          {user.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.coverUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <CardContent className="relative pt-0">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-sm sm:h-28 sm:w-28">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                <AvatarFallback className="text-2xl">{initials(user.name)}</AvatarFallback>
              </Avatar>
            </div>
            {isOwner && (
              <Button asChild variant="outline">
                <Link href="/settings">
                  <Pencil /> Edit profile
                </Link>
              </Button>
            )}
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-ink">{user.name}</h1>
            {user.headline && (
              <p className="mt-1 text-muted-foreground">{user.headline}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {user.location}
                </span>
              )}
              {isOwner && (
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" /> {user.profileViews} profile views
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {user.resumeUrl && (
                <Button asChild variant="secondary" size="sm">
                  <a href={user.resumeUrl} target="_blank" rel="noreferrer">
                    <FileText /> View resume
                  </a>
                </Button>
              )}
              {isOwner && (
                <Button asChild variant="outline" size="sm">
                  <Link href="/resume">
                    <Download /> Resume builder
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      {user.bio && (
        <Section title="About">
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">
            {user.bio}
          </p>
        </Section>
      )}

      {/* Skills */}
      {user.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {user.skills.map((skill) => (
              <Badge key={skill} variant="default">
                {skill}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {/* Experience */}
      {user.experience.length > 0 && (
        <Section title="Experience">
          <ol className="space-y-5">
            {user.experience.map((exp, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                <div>
                  <p className="font-semibold text-ink">{exp.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {exp.company}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="mt-1.5 text-sm text-ink/80">{exp.description}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Education */}
      {user.education.length > 0 && (
        <Section title="Education">
          <ol className="space-y-4">
            {user.education.map((edu, i) => (
              <li key={i}>
                <p className="font-semibold text-ink">{edu.school}</p>
                <p className="text-sm text-muted-foreground">
                  {[edu.degree, edu.field].filter(Boolean).join(", ")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {edu.startYear} — {edu.endYear}
                </p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* Posts */}
      {posts.length > 0 && viewer && (
        <div className="space-y-3">
          <h2 className="px-1 font-semibold text-ink">
            {isOwner ? "Your posts" : `Posts by ${user.name.split(" ")[0]}`}
          </h2>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} currentUser={viewer} />
          ))}
        </div>
      )}

      {isOwner &&
        !user.bio &&
        user.skills.length === 0 &&
        user.experience.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Your profile is looking a little empty.
              </p>
              <Button asChild className="mt-3">
                <Link href="/settings">Complete your profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="mb-3 font-semibold text-ink">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}
