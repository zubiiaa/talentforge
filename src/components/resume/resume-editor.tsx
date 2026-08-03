"use client";

import { forwardRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, useFieldArray, Controller, type Control, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Download, Loader2, Plus, Trash2 } from "lucide-react";
import { resumeSchema, type ResumeInput } from "@/lib/validations";
import { updateResume } from "@/server/actions/resumes";
import type { SafeResume } from "@/data/resumes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { SkillsInput } from "@/components/profile/skills-input";
import { ResumePreview } from "./resume-preview";

type FormControl = Control<ResumeInput>;
type FormRegister = UseFormRegister<ResumeInput>;

export function ResumeEditor({ resume }: { resume: SafeResume }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<ResumeInput>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      title: resume.title,
      bulletPoints: resume.bulletPoints,
      fullName: resume.fullName,
      headline: resume.headline,
      email: resume.email,
      phone: resume.phone,
      location: resume.location,
      website: resume.website,
      summary: resume.summary,
      skills: resume.skills,
      experience: resume.experience,
      education: resume.education,
      projects: resume.projects,
      certificates: resume.certificates,
      customSections: resume.customSections,
    },
  });

  const live = watch();

  async function onSubmit(values: ResumeInput) {
    setError(null);
    const res = await updateResume(resume.id, values);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Top bar */}
      <div className="sticky top-16 z-20 -mx-4 mb-4 flex flex-wrap items-center gap-3 border-b border-border/70 bg-secondary/40 px-4 py-3 backdrop-blur">
        <Button asChild variant="ghost" size="sm">
          <Link href="/resume">
            <ArrowLeft /> All resumes
          </Link>
        </Button>
        <Input
          {...register("title")}
          className="h-9 max-w-xs flex-1 font-medium"
          placeholder="Resume name"
        />
        <div className="ml-auto flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
          <Button asChild variant="outline" size="sm" type="button">
            <a href={`/api/resume?resumeId=${resume.id}`}>
              <Download /> PDF
            </a>
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form column */}
        <div className="space-y-4">
          <SectionCard title="Contact">
            <div className="grid gap-3 sm:grid-cols-2">
              <FieldInput label="Full name" {...register("fullName")} />
              <FieldInput label="Headline" {...register("headline")} />
              <FieldInput label="Email" {...register("email")} />
              <FieldInput label="Phone" {...register("phone")} />
              <FieldInput label="Location" {...register("location")} />
              <FieldInput label="Website" {...register("website")} />
            </div>
          </SectionCard>

          <SectionCard title="Summary">
            <Textarea rows={4} placeholder="A short professional summary…" {...register("summary")} />
          </SectionCard>

          <SectionCard title="Skills">
            <Controller
              control={control}
              name="skills"
              render={({ field }) => (
                <SkillsInput value={field.value ?? []} onChange={field.onChange} />
              )}
            />
          </SectionCard>

          <ExperienceSection control={control} register={register} />
          <ProjectsSection control={control} register={register} />
          <EducationSection control={control} register={register} />
          <CertificatesSection control={control} register={register} />
          <CustomSections control={control} register={register} />

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        {/* Preview column */}
        <div className="lg:sticky lg:top-32 lg:h-fit">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Live preview
          </p>
          <div className="max-h-[calc(100vh-10rem)] overflow-auto rounded-xl border border-border/70">
            <ResumePreview data={live} />
          </div>
        </div>
      </div>
    </form>
  );
}

/* ---------- Section wrappers ---------- */

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <h2 className="font-semibold text-ink">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function RepeaterCard({
  title,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">{title}</h2>
          <Button type="button" variant="outline" size="sm" onClick={onAdd}>
            <Plus /> {addLabel}
          </Button>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onClick}>
      <Trash2 /> Remove
    </Button>
  );
}

function ItemBox({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 rounded-lg border border-border/70 p-4">{children}</div>;
}

// Bound to the resume-wide `bulletPoints` flag. Registering it above each
// description keeps the control next to the text it affects; every instance
// stays in sync since they share the same field.
function BulletToggle({ register }: { register: FormRegister }) {
  return (
    <label className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-input bg-secondary/40 px-2.5 py-1.5 font-sans text-xs font-medium text-ink">
      <input type="checkbox" className="h-3.5 w-3.5 accent-brand" {...register("bulletPoints")} />
      Show as bullet points
    </label>
  );
}

/* ---------- Individual sections ---------- */

function ExperienceSection({ control, register }: { control: FormControl; register: FormRegister }) {
  const fa = useFieldArray({ control, name: "experience" });
  return (
    <RepeaterCard
      title="Experience"
      addLabel="Add"
      onAdd={() =>
        fa.append({
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
      {fa.fields.map((f, i) => (
        <ItemBox key={f.id}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Title" {...register(`experience.${i}.title`)} />
            <Input placeholder="Company" {...register(`experience.${i}.company`)} />
            <Input placeholder="Location" {...register(`experience.${i}.location`)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Start" {...register(`experience.${i}.startDate`)} />
              <Input placeholder="End" {...register(`experience.${i}.endDate`)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" {...register(`experience.${i}.current`)} /> Currently here
          </label>
          <div className="space-y-1.5">
            <BulletToggle register={register} />
            <Textarea
              rows={3}
              placeholder="Description — one point per line"
              {...register(`experience.${i}.description`)}
            />
          </div>
          <RemoveButton onClick={() => fa.remove(i)} />
        </ItemBox>
      ))}
    </RepeaterCard>
  );
}

function ProjectsSection({ control, register }: { control: FormControl; register: FormRegister }) {
  const fa = useFieldArray({ control, name: "projects" });
  return (
    <RepeaterCard
      title="Projects"
      addLabel="Add"
      onAdd={() => fa.append({ name: "", link: "", description: "" })}
    >
      {fa.fields.map((f, i) => (
        <ItemBox key={f.id}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="Project name" {...register(`projects.${i}.name`)} />
            <Input placeholder="Link" {...register(`projects.${i}.link`)} />
          </div>
          <div className="space-y-1.5">
            <BulletToggle register={register} />
            <Textarea
              rows={3}
              placeholder="Description — one point per line"
              {...register(`projects.${i}.description`)}
            />
          </div>
          <RemoveButton onClick={() => fa.remove(i)} />
        </ItemBox>
      ))}
    </RepeaterCard>
  );
}

function EducationSection({ control, register }: { control: FormControl; register: FormRegister }) {
  const fa = useFieldArray({ control, name: "education" });
  return (
    <RepeaterCard
      title="Education"
      addLabel="Add"
      onAdd={() => fa.append({ school: "", degree: "", field: "", startYear: "", endYear: "" })}
    >
      {fa.fields.map((f, i) => (
        <ItemBox key={f.id}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="School" {...register(`education.${i}.school`)} />
            <Input placeholder="Degree" {...register(`education.${i}.degree`)} />
            <Input placeholder="Field" {...register(`education.${i}.field`)} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Start year" {...register(`education.${i}.startYear`)} />
              <Input placeholder="End year" {...register(`education.${i}.endYear`)} />
            </div>
          </div>
          <RemoveButton onClick={() => fa.remove(i)} />
        </ItemBox>
      ))}
    </RepeaterCard>
  );
}

function CertificatesSection({ control, register }: { control: FormControl; register: FormRegister }) {
  const fa = useFieldArray({ control, name: "certificates" });
  return (
    <RepeaterCard
      title="Certificates"
      addLabel="Add"
      onAdd={() => fa.append({ name: "", issuer: "", year: "" })}
    >
      {fa.fields.map((f, i) => (
        <ItemBox key={f.id}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input placeholder="Name" {...register(`certificates.${i}.name`)} />
            <Input placeholder="Issuer" {...register(`certificates.${i}.issuer`)} />
            <Input placeholder="Year" {...register(`certificates.${i}.year`)} />
          </div>
          <RemoveButton onClick={() => fa.remove(i)} />
        </ItemBox>
      ))}
    </RepeaterCard>
  );
}

function CustomSections({ control, register }: { control: FormControl; register: FormRegister }) {
  const fa = useFieldArray({ control, name: "customSections" });
  return (
    <RepeaterCard
      title="Custom sections"
      addLabel="Add section"
      onAdd={() => fa.append({ heading: "", items: [{ title: "", subtitle: "", description: "" }] })}
    >
      {fa.fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add a section for anything else — awards, publications, volunteering.
        </p>
      )}
      {fa.fields.map((f, i) => (
        <ItemBox key={f.id}>
          <Input
            placeholder="Section heading (e.g. Awards)"
            className="font-medium"
            {...register(`customSections.${i}.heading`)}
          />
          <CustomSectionItems control={control} register={register} sectionIndex={i} />
          <RemoveButton onClick={() => fa.remove(i)} />
        </ItemBox>
      ))}
    </RepeaterCard>
  );
}

function CustomSectionItems({
  control,
  register,
  sectionIndex,
}: {
  control: FormControl;
  register: FormRegister;
  sectionIndex: number;
}) {
  const fa = useFieldArray({ control, name: `customSections.${sectionIndex}.items` });
  return (
    <div className="space-y-3">
      {fa.fields.map((f, i) => (
        <div key={f.id} className="space-y-2 rounded-md bg-secondary/40 p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              placeholder="Title"
              {...register(`customSections.${sectionIndex}.items.${i}.title`)}
            />
            <Input
              placeholder="Subtitle"
              {...register(`customSections.${sectionIndex}.items.${i}.subtitle`)}
            />
          </div>
          <Textarea
            rows={2}
            placeholder="Description"
            {...register(`customSections.${sectionIndex}.items.${i}.description`)}
          />
          <button
            type="button"
            onClick={() => fa.remove(i)}
            className="text-xs text-destructive hover:underline"
          >
            Remove item
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => fa.append({ title: "", subtitle: "", description: "" })}
      >
        <Plus /> Add item
      </Button>
    </div>
  );
}

/* ---------- Small field ---------- */

const FieldInput = forwardRef<
  HTMLInputElement,
  { label: string } & React.ComponentProps<typeof Input>
>(function FieldInput({ label, ...props }, ref) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input ref={ref} {...props} />
    </div>
  );
});
