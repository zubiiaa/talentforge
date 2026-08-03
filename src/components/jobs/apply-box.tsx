"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { applyToJob } from "@/server/actions/jobs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ApplyBox({
  jobId,
  alreadyApplied,
}: {
  jobId: string;
  alreadyApplied: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(alreadyApplied);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (applied) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
        <CheckCircle2 className="h-5 w-5" /> Application submitted
      </div>
    );
  }

  if (!open) {
    return (
      <Button size="lg" onClick={() => setOpen(true)}>
        Apply now
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border/70 p-4">
      <p className="text-sm font-medium text-ink">Add a note to your application</p>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={4}
        placeholder="Why are you a great fit? (optional)"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const res = await applyToJob(jobId, note);
              if (res?.error) setError(res.error);
              else setApplied(true);
            });
          }}
        >
          {pending && <Loader2 className="animate-spin" />}
          Submit application
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
