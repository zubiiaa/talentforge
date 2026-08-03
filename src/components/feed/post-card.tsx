"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Send, MoreHorizontal, Trash2 } from "lucide-react";
import { toggleLike, addComment, deletePost } from "@/server/actions/posts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, initials } from "@/lib/utils";
import type { SafePost } from "@/data/posts";
import type { SafeUser } from "@/lib/session";

export function PostCard({ post, currentUser }: { post: SafePost; currentUser: SafeUser }) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [, startLike] = useTransition();
  const [commentPending, startComment] = useTransition();
  const [deleted, setDeleted] = useState(false);

  const canDelete = post.author.username === currentUser.username;

  function onDelete() {
    setDeleted(true);
    startLike(async () => {
      await deletePost(post.id);
      router.refresh();
    });
  }

  if (deleted) return null;

  function onLike() {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    startLike(async () => {
      await toggleLike(post.id);
    });
  }

  function onComment() {
    if (!comment.trim()) return;
    const text = comment;
    setComment("");
    startComment(async () => {
      await addComment(post.id, text);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.username}`}>
            <Avatar>
              <AvatarImage src={post.author.avatarUrl || undefined} alt={post.author.name} />
              <AvatarFallback>{initials(post.author.name)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/profile/${post.author.username}`}
              className="font-semibold text-ink hover:underline"
            >
              {post.author.name}
            </Link>
            {post.author.headline && (
              <p className="truncate text-xs text-muted-foreground">{post.author.headline}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-lg p-1.5 text-muted-foreground outline-none hover:bg-accent">
                <MoreHorizontal className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 /> Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="mt-3 whitespace-pre-line text-sm text-ink/90">{post.text}</p>

        {post.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageUrl} alt="" className="mt-3 max-h-96 w-full rounded-lg object-cover" />
        )}

        <div className="mt-3 flex items-center gap-1 border-t border-border/70 pt-2">
          <Button variant="ghost" size="sm" onClick={onLike} className={cn(liked && "text-brand")}>
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            {likeCount > 0 && likeCount}
            <span className="sr-only">Like</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowComments((s) => !s)}>
            <MessageCircle className="h-4 w-4" />
            {post.comments.length > 0 && post.comments.length}
            <span className="ml-1">Comment</span>
          </Button>
        </div>

        {showComments && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatarUrl || undefined} alt={currentUser.name} />
                <AvatarFallback className="text-xs">{initials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onComment()}
                placeholder="Write a comment…"
              />
              <Button size="icon" onClick={onComment} disabled={commentPending || !comment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {post.comments.map((c) => (
              <div key={c.id} className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={c.author.avatarUrl || undefined} alt={c.author.name} />
                  <AvatarFallback className="text-xs">{initials(c.author.name)}</AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-secondary/60 px-3 py-2">
                  <Link
                    href={`/profile/${c.author.username}`}
                    className="text-sm font-medium text-ink hover:underline"
                  >
                    {c.author.name}
                  </Link>
                  <p className="text-sm text-ink/80">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
