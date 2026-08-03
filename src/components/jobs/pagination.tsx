import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pages,
  searchParams,
}: {
  page: number;
  pages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  function href(p: number) {
    const sp = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") sp.set(key, value);
    }
    sp.set("page", String(p));
    return `/jobs?${sp.toString()}`;
  }

  return (
    <nav className="flex items-center justify-center gap-1 pt-2">
      <PageLink href={href(page - 1)} disabled={page <= 1}>
        <ChevronLeft className="h-4 w-4" />
      </PageLink>
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <PageLink key={p} href={href(p)} active={p === page}>
          {p}
        </PageLink>
      ))}
      <PageLink href={href(page + 1)} disabled={page >= pages}>
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  active,
  disabled,
  children,
}: {
  href: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const classes = cn(
    "grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-medium transition-colors",
    active
      ? "border-brand bg-brand text-white"
      : "border-input bg-white text-ink hover:bg-accent",
    disabled && "pointer-events-none opacity-40",
  );

  if (disabled) return <span className={classes}>{children}</span>;
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
