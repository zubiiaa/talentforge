import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Run on everything except Next internals, static assets, and the auth API.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|fonts|images).*)"],
};
