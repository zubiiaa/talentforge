"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleSaveJob } from "@/server/actions/jobs";
import { cn } from "@/lib/utils";

export function SaveJobButton({
  jobId,
  initialSaved,
}: {
  jobId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={saved ? "Unsave job" : "Save job"}
      disabled={pending}
      onClick={() => {
        setSaved((s) => !s);
        startTransition(async () => {
          const res = await toggleSaveJob(jobId);
          if (res?.saved !== undefined) setSaved(res.saved);
        });
      }}
      className={cn(
        "rounded-lg p-2 transition-colors hover:bg-accent",
        saved ? "text-brand" : "text-muted-foreground",
      )}
    >
      <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
    </button>
  );
}
