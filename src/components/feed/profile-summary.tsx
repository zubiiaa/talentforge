import Link from "next/link";
import { Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { initials } from "@/lib/utils";
import type { SafeUser } from "@/lib/session";

export function ProfileSummary({ user }: { user: SafeUser }) {
  return (
    <Card className="sticky top-20 overflow-hidden">
      <div className="h-16 bg-gradient-to-r from-brand to-brand-700" />
      <CardContent className="pt-0">
        <Link href={`/profile/${user.username}`}>
          <Avatar className="-mt-8 h-16 w-16 border-4 border-white">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
            <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
          </Avatar>
        </Link>
        <Link
          href={`/profile/${user.username}`}
          className="mt-2 block font-semibold text-ink hover:underline"
        >
          {user.name}
        </Link>
        {user.headline && (
          <p className="mt-0.5 text-xs text-muted-foreground">{user.headline}</p>
        )}
        <div className="mt-3 flex items-center gap-2 border-t border-border/70 pt-3 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>Profile views</span>
          <span className="ml-auto font-semibold text-brand">{user.profileViews}</span>
        </div>
      </CardContent>
    </Card>
  );
}
