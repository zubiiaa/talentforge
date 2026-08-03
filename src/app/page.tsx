import Link from "next/link";
import { ArrowRight, Briefcase, FileText, LineChart, Users } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Users,
    title: "Build your profile",
    body: "Showcase your headline, experience, education, and skills on a profile recruiters can actually read.",
  },
  {
    icon: Briefcase,
    title: "Discover jobs",
    body: "Search and filter live listings, then apply in one click. Employers post roles in seconds.",
  },
  {
    icon: FileText,
    title: "Export your resume",
    body: "Turn your profile into a polished PDF resume whenever you need it — no formatting required.",
  },
  {
    icon: LineChart,
    title: "Track everything",
    body: "A personal dashboard for posts, applications, saved jobs, and profile insights.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Brand />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            Where careers take shape
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-ink sm:text-6xl">
            Forge your career on a network built for{" "}
            <span className="text-brand">real opportunity</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            TalentForge brings your professional profile, a live job board, a
            community feed, and application tracking together in one clean place.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Create your account <ArrowRight className="ml-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/jobs">Browse jobs</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border/70 bg-secondary/30 p-5"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-brand shadow-sm">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-ink">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-muted-foreground sm:flex-row">
          <Brand />
          <p>© {new Date().getFullYear()} TalentForge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
