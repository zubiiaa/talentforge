"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { FileText, Plus, Pencil, Download, Trash2, Loader2 } from "lucide-react";
import { createResume, deleteResume } from "@/server/actions/resumes";
import { startTopLoader } from "@/components/top-loader";
import type { SafeResume } from "@/data/resumes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ResumeList({ resumes }: { resumes: SafeResume[] }) {
  const router = useRouter();
  const [creating, startCreate] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function onCreate() {
    startCreate(async () => {
      const res = await createResume();
      if (res.id) {
        startTopLoader();
        router.push(`/resume/${res.id}/edit`);
      }
    });
  }

  function onDelete(id: string) {
    setDeletingId(id);
    startCreate(async () => {
      await deleteResume(id);
      setDeletingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Button onClick={onCreate} disabled={creating}>
        {creating ? <Loader2 className="animate-spin" /> : <Plus />}
        New resume
      </Button>

      {resumes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <p className="font-medium text-ink">No resumes yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first resume — it&apos;ll be pre-filled from your profile.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {resumes.map((resume) => (
            <Card key={resume.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{resume.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {format(new Date(resume.updatedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/resume/${resume.id}/edit`}>
                      <Pencil /> Edit
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <a href={`/api/resume?resumeId=${resume.id}`}>
                      <Download /> PDF
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    disabled={deletingId === resume.id}
                    onClick={() => onDelete(resume.id)}
                  >
                    {deletingId === resume.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Trash2 />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
