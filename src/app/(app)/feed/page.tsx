import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getFeed } from "@/data/posts";
import { PostComposer } from "@/components/feed/post-composer";
import { PostCard } from "@/components/feed/post-card";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileSummary } from "@/components/feed/profile-summary";

export const metadata: Metadata = { title: "Feed" };

export default async function FeedPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const posts = await getFeed(user.id);

  return (
    <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[280px_1fr]">
      <aside className="hidden lg:block">
        <ProfileSummary user={user} />
      </aside>

      <div className="mx-auto w-full max-w-2xl space-y-4">
        <PostComposer user={user} />

        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No posts yet. Be the first to share something.
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} currentUser={user} />)
        )}
      </div>
    </div>
  );
}
