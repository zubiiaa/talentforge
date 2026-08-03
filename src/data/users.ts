import { connectDB } from "@/lib/db";
import { serializeUser, type SafeUser } from "@/lib/session";
import { User, type UserDoc } from "@/models/user";

export async function getUserByUsername(username: string): Promise<SafeUser | null> {
  await connectDB();
  const doc = await User.findOne({ username: username.toLowerCase() }).lean<UserDoc>();
  return doc ? serializeUser(doc) : null;
}
