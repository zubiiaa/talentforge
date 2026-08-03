import { connectDB } from "@/lib/db";
import { Post } from "@/models/post";
import "@/models/user";

export type SafeComment = {
  id: string;
  text: string;
  createdAt: string;
  author: { name: string; username: string; avatarUrl: string };
};

export type SafePost = {
  id: string;
  text: string;
  imageUrl: string;
  createdAt: string;
  author: { name: string; username: string; avatarUrl: string; headline: string };
  likeCount: number;
  likedByMe: boolean;
  comments: SafeComment[];
};

type PopulatedAuthor = {
  _id: unknown;
  name: string;
  username: string;
  avatarUrl: string;
  headline?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializePost(doc: any, currentUserId?: string): SafePost {
  const author = doc.author as PopulatedAuthor;
  const likes: unknown[] = doc.likes ?? [];
  return {
    id: doc._id.toString(),
    text: doc.text,
    imageUrl: doc.imageUrl ?? "",
    createdAt: doc.createdAt.toISOString(),
    author: {
      name: author?.name ?? "Unknown",
      username: author?.username ?? "",
      avatarUrl: author?.avatarUrl ?? "",
      headline: author?.headline ?? "",
    },
    likeCount: likes.length,
    likedByMe: currentUserId ? likes.some((id) => id?.toString() === currentUserId) : false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    comments: (doc.comments ?? []).map((c: any) => ({
      id: c._id.toString(),
      text: c.text,
      createdAt: (c.createdAt ?? new Date()).toISOString(),
      author: {
        name: (c.author as PopulatedAuthor)?.name ?? "Unknown",
        username: (c.author as PopulatedAuthor)?.username ?? "",
        avatarUrl: (c.author as PopulatedAuthor)?.avatarUrl ?? "",
      },
    })),
  };
}

export async function getFeed(currentUserId?: string): Promise<SafePost[]> {
  await connectDB();
  const docs = await Post.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate("author", "name username avatarUrl headline")
    .populate("comments.author", "name username avatarUrl")
    .lean();

  return docs.map((d) => serializePost(d, currentUserId));
}

export async function countPostsByUser(userId: string): Promise<number> {
  await connectDB();
  return Post.countDocuments({ author: userId });
}

export async function getPostsByUser(
  userId: string,
  currentUserId?: string,
): Promise<SafePost[]> {
  await connectDB();
  const docs = await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .limit(30)
    .populate("author", "name username avatarUrl headline")
    .populate("comments.author", "name username avatarUrl")
    .lean();

  return docs.map((d) => serializePost(d, currentUserId));
}
