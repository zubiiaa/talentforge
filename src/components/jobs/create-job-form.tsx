"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { createJob } from "@/server/actions/jobs";
import { startTopLoader } from "@/components/top-loader";
import { jobSchema, type JobInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;

export function CreateJobForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobInput>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      salary: "",
      remote: false,
      type: "Full-time",
      description: "",
    },
  });

  async function onSubmit(values: JobInput) {
    setServerError(null);
    const res = await createJob(values);
    if (res.error) {
      setServerError(res.error);
      return;
    }
    if (res.jobId) {
      startTopLoader();
      router.push(`/jobs/${res.jobId}`);
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job title" error={errors.title?.message}>
              <Input placeholder="Senior Frontend Engineer" {...register("title")} />
            </Field>
            <Field label="Company" error={errors.company?.message}>
              <Input placeholder="Acme Inc." {...register("company")} />
            </Field>
            <Field label="Location" error={errors.location?.message}>
              <Input placeholder="Karachi, Pakistan" {...register("location")} />
            </Field>
            <Field label="Salary (optional)" error={errors.salary?.message}>
              <Input placeholder="$90k – $120k" {...register("salary")} />
            </Field>
            <Field label="Employment type" error={errors.type?.message}>
              <select
                className="flex h-10 w-full rounded-lg border border-input bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("type")}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-center gap-2 pt-7 text-sm text-ink">
              <input type="checkbox" {...register("remote")} /> This role is remote-friendly
            </label>
          </div>

          <Field label="Description" error={errors.description?.message}>
            <Textarea
              rows={7}
              placeholder="Describe the role, responsibilities, and requirements…"
              {...register("description")}
            />
          </Field>

          {serverError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Publish job
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
