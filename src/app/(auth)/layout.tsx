import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { getCurrentUser } from "@/lib/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // DB-backed check so it stays consistent with the (app) layout — a stale
  // JWT whose user no longer exists resolves to null here and simply shows the
  // login page instead of bouncing back to /feed.
  const user = await getCurrentUser();
  if (user) redirect("/feed");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Brand className="mb-8" />
          {children}
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-brand lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Brand href="/" className="[&_span]:text-white" />
          <div>
            <p className="text-3xl font-semibold leading-tight">
              Your career, all in one place.
            </p>
            <p className="mt-4 max-w-md text-white/80">
              Build a profile that stands out, apply to roles in a click, share
              your wins with the community, and track it all from one dashboard.
            </p>
          </div>
          <p className="text-sm text-white/70">
            Already have momentum?{" "}
            <Link href="/jobs" className="underline underline-offset-4">
              Browse open roles
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
