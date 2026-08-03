import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config: no database or Node-only imports here, so it can run
 * inside middleware. The Credentials provider (which needs Mongoose + bcrypt)
 * is added in auth.ts, which only runs in the Node.js runtime.
 */
const PROTECTED_PREFIXES = ["/feed", "/dashboard", "/profile", "/jobs/new", "/settings"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    // Middleware only guards protected routes with a quick JWT check. The
    // "already logged in, get off the login page" redirect lives in the (auth)
    // layout instead — it checks the DB, so it can't disagree with the feed
    // layout and send you into a redirect loop on a stale cookie.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;
      const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

      if (isProtected && !isLoggedIn) {
        const url = new URL("/login", nextUrl);
        url.searchParams.set("callbackUrl", pathname);
        return Response.redirect(url);
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.username = (user as { username?: string }).username ?? "";
        token.role = (user as { role?: string }).role ?? "seeker";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
