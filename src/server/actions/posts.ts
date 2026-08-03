"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { saveUpload } from "@/lib/upload";
import { postSchema, commentSchema } from "@/lib/validations";
import { Post } from "@/models/post";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session.user.id;
}

export async function createPost(formData: FormData) {
  const userId = await requireUserId();

  let imageUrl = "";
  const file = formData.get("image") as File | null;
  if (file && file.size > 0) {
    try {
      imageUrl = await saveUpload(file, `posts/${userId}`, "image");
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Image upload failed" };
    }
  }

  const parsed = postSchema.safeParse({
    text: formData.get("text"),
    imageUrl,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid post" };
  }

  await connectDB();
  await Post.create({ author: userId, text: parsed.data.text, imageUrl });

  revalidatePath("/feed");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deletePost(postId: string) {
  const userId = await requireUserId();
  await connectDB();

  const post = await Post.findById(postId).select("author");
  if (!post) return { error: "Post not found" };
  if (post.author.toString() !== userId) return { error: "You can only delete your own posts" };

  await Post.deleteOne({ _id: postId });

  revalidatePath("/feed");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function toggleLike(postId: string) {
  const userId = await requireUserId();
  await connectDB();

  const post = await Post.findById(postId).select("likes");
  if (!post) return { error: "Post not found" };

  const liked = post.likes.some((id) => id.toString() === userId);
  await Post.updateOne(
    { _id: postId },
    liked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
  );

  revalidatePath("/feed");
  return { ok: true, liked: !liked };
}

export async function addComment(postId: string, text: string) {
  const parsed = commentSchema.safeParse({ postId, text });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid comment" };

  const userId = await requireUserId();
  await connectDB();

  await Post.updateOne(
    { _id: postId },
    { $push: { comments: { author: userId, text: parsed.data.text } } },
  );

  revalidatePath("/feed");
  return { ok: true };
}
