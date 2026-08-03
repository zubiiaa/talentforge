"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, FileText, Check } from "lucide-react";
import { profileSchema, type ProfileInput } from "@/lib/validations";
import { updateProfile } from "@/server/actions/profile";
import type { SafeUser } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SkillsInput } from "./skills-input";
import { UploadButton } from "./upload-button";
import { startTopLoader } from "@/components/top-loader";
import { initials } from "@/lib/utils";

export function ProfileEditor({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [coverUrl, setCoverUrl] = useState(user.coverUrl);
  const [resumeUrl, setResumeUrl] = useState(user.resumeUrl);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      headline: user.headline,
      bio: user.bio,
      location: user.location,
      skills: user.skills,
      experience: user.experience.map((e) => ({ ...e })),
      education: user.education.map((e) => ({ ...e })),
    },
  });

  const experience = useFieldArray({ control, name: "experience" });
  const education = useFieldArray({ control, name: "education" });

  async function onSubmit(values: ProfileInput) {
    setServerError(null);
    setSaved(false);
    const res = await updateProfile(values);
    if (res?.error) {
      setServerError(res.error);
      return;
    }
    setSaved(true);
    startTopLoader();
    router.push(`/profile/${user.username}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Media */}
      <Card>
        <div className="relative h-32 rounded-t-xl bg-gradient-to-r from-brand to-brand-700">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-full w-full rounded-t-xl object-cover" />
          )}
          <div className="absolute right-3 top-3">
            <UploadButton
              target="cover"
              label="Change cover"
              accept="image/*"
              onUploaded={setCoverUrl}
            />
          </div>
        </div>
        <CardContent className="flex flex-wrap items-center gap-4 pt-0">
          <Avatar className="-mt-10 h-20 w-20 border-4 border-white shadow-sm">
            <AvatarImage src={avatarUrl || undefined} alt={user.name} />
            <AvatarFallback className="text-xl">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-wrap gap-2">
            <UploadButton
              target="avatar"
              label="Upload photo"
              accept="image/*"
              onUploaded={setAvatarUrl}
            />
            <UploadButton
              target="resume"
              label={resumeUrl ? "Replace resume" : "Upload resume (PDF)"}
              accept="application/pdf"
              onUploaded={setResumeUrl}
            />
          </div>
          {resumeUrl && (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-brand hover:underline"
            >
              <FileText className="h-4 w-4" /> Current resume
            </a>
          )}
        </CardContent>
      </Card>

      {/* Basics */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="font-semibold text-ink">Basic information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.name?.message}>
              <Input {...register("name")} />
            </Field>
            <Field label="Location" error={errors.location?.message}>
              <Input {...register("location")} placeholder="City, Country" />
            </Field>
          </div>
          <Field label="Headline" error={errors.headline?.message}>
            <Input {...register("headline")} placeholder="Senior Product Designer · UI/UX" />
          </Field>
          <Field label="About" error={errors.bio?.message}>
            <Textarea {...register("bio")} rows={5} placeholder="Tell people about yourself…" />
          </Field>
          <Field label="Skills" error={errors.skills?.message}>
            <Controller
              control={control}
              name="skills"
              render={({ field }) => (
                <SkillsInput value={field.value ?? []} onChange={field.onChange} />
              )}
            />
          </Field>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Experience</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                experience.append({
                  title: "",
                  company: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  current: false,
                  description: "",
                })
              }
            >
              <Plus /> Add
            </Button>
          </div>

          {experience.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">No experience added yet.</p>
          )}

          {experience.fields.map((field, i) => (
            <div key={field.id} className="space-y-3 rounded-lg border border-border/70 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Title" {...register(`experience.${i}.title`)} />
                <Input placeholder="Company" {...register(`experience.${i}.company`)} />
                <Input placeholder="Location" {...register(`experience.${i}.location`)} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Start (2021)" {...register(`experience.${i}.startDate`)} />
                  <Input placeholder="End (2023)" {...register(`experience.${i}.endDate`)} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input type="checkbox" {...register(`experience.${i}.current`)} /> I currently work here
              </label>
              <Textarea placeholder="What did you do?" rows={2} {...register(`experience.${i}.description`)} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => experience.remove(i)}
              >
                <Trash2 /> Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Education</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                education.append({ school: "", degree: "", field: "", startYear: "", endYear: "" })
              }
            >
              <Plus /> Add
            </Button>
          </div>

          {education.fields.length === 0 && (
            <p className="text-sm text-muted-foreground">No education added yet.</p>
          )}

          {education.fields.map((field, i) => (
            <div key={field.id} className="space-y-3 rounded-lg border border-border/70 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="School" {...register(`education.${i}.school`)} />
                <Input placeholder="Degree" {...register(`education.${i}.degree`)} />
                <Input placeholder="Field of study" {...register(`education.${i}.field`)} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Start year" {...register(`education.${i}.startYear`)} />
                  <Input placeholder="End year" {...register(`education.${i}.endYear`)} />
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => education.remove(i)}
              >
                <Trash2 /> Remove
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {serverError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-xl border border-border/70 bg-white/90 p-3 backdrop-blur">
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
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
