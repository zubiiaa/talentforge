import type { ResumeInput } from "@/lib/validations";
import { Badge } from "@/components/ui/badge";

function lines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function Description({ text, bullets }: { text: string; bullets: boolean }) {
  if (!text) return null;
  if (bullets) {
    return (
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink/75 marker:text-brand">
        {lines(text).map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    );
  }
  return <p className="mt-1 whitespace-pre-line text-sm text-ink/75">{text}</p>;
}

export function ResumePreview({ data }: { data: ResumeInput }) {
  const contact = [data.email, data.phone, data.location, data.website].filter(Boolean);
  const bullets = data.bulletPoints;

  return (
    <div className="min-h-[900px] bg-white p-8 text-[13px] leading-relaxed text-ink shadow-sm sm:p-12">
      {/* Centered header (ATS-friendly) */}
      <div className="border-b border-border pb-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-ink">{data.fullName || "Your Name"}</h2>
        {data.headline && <p className="mt-1.5 text-brand">{data.headline}</p>}
        {contact.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {contact.map((item, i) => (
              <span key={i} className="flex items-center gap-x-4">
                {i > 0 && <span className="text-border">|</span>}
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {data.summary && (
        <Section title="Summary">
          <p className="text-sm text-ink/80">{data.summary}</p>
        </Section>
      )}

      {data.experience.some((e) => e.title || e.company) && (
        <Section title="Experience">
          <div className="space-y-3.5">
            {data.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-ink">{exp.title || "Role"}</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {[exp.company, exp.location].filter(Boolean).join(" • ")}
                </p>
                <Description text={exp.description} bullets={bullets} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.projects.some((p) => p.name) && (
        <Section title="Projects">
          <div className="space-y-3.5">
            {data.projects.map((p, i) => (
              <div key={i}>
                <p className="font-semibold text-ink">{p.name}</p>
                {p.link && <p className="text-xs text-brand">{p.link}</p>}
                <Description text={p.description} bullets={bullets} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.education.some((e) => e.school) && (
        <Section title="Education">
          <div className="space-y-3">
            {data.education.map((edu, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-ink">{edu.school}</p>
                  <p className="text-xs text-muted-foreground">
                    {edu.startYear} — {edu.endYear}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {[edu.degree, edu.field].filter(Boolean).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.certificates.some((c) => c.name) && (
        <Section title="Certificates">
          <div className="space-y-2">
            {data.certificates.map((c, i) => (
              <div key={i} className="flex items-baseline justify-between gap-2">
                <p className="font-semibold text-ink">
                  {c.name}
                  {c.issuer && <span className="font-normal text-muted-foreground"> · {c.issuer}</span>}
                </p>
                <p className="text-xs text-muted-foreground">{c.year}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </Section>
      )}

      {data.customSections.map((section, si) =>
        section.heading ? (
          <Section key={si} title={section.heading}>
            <div className="space-y-3">
              {section.items.map((item, i) => (
                <div key={i}>
                  {item.title && <p className="font-semibold text-ink">{item.title}</p>}
                  {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
                  <Description text={item.description} bullets={bullets} />
                </div>
              ))}
            </div>
          </Section>
        ) : null,
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2.5 border-b-2 border-brand/20 pb-1 text-sm font-bold uppercase tracking-wide text-brand">
        {title}
      </h3>
      {children}
    </div>
  );
}
