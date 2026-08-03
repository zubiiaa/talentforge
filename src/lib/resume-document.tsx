import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { ResumeInput } from "@/lib/validations";

const fontDir = path.join(process.cwd(), "public", "fonts");

Font.register({
  family: "NeueHaas",
  fonts: [
    { src: path.join(fontDir, "NeueHaasDisplayRoman.ttf"), fontWeight: 400 },
    { src: path.join(fontDir, "NeueHaasDisplayMediu.ttf"), fontWeight: 500 },
    { src: path.join(fontDir, "NeueHaasDisplayBold.ttf"), fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 48, fontSize: 10, color: "#333333", fontFamily: "NeueHaas" },
  header: { alignItems: "center", textAlign: "center", borderBottom: "1 solid #E5E7EB", paddingBottom: 12, marginBottom: 4 },
  name: { fontSize: 26, fontWeight: 700, color: "#111111" },
  headline: { fontSize: 11, color: "#0154AA", marginTop: 5 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 8 },
  contactItem: { fontSize: 9, color: "#585D6E" },
  contactSep: { fontSize: 9, color: "#C7CBD4" },
  section: { marginTop: 18 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#0154AA",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderBottom: "2 solid #CFE0F4",
    paddingBottom: 4,
    marginBottom: 9,
  },
  bodyText: { fontSize: 10, lineHeight: 1.5, color: "#333333" },
  item: { marginBottom: 11 },
  itemHeaderRow: { flexDirection: "row", justifyContent: "space-between" },
  itemTitle: { fontSize: 11, fontWeight: 700, color: "#111111" },
  itemSub: { fontSize: 10, color: "#585D6E", marginTop: 1 },
  itemDate: { fontSize: 9, color: "#737A91" },
  itemDesc: { fontSize: 9.5, color: "#333333", marginTop: 3, lineHeight: 1.4 },
  bulletRow: { flexDirection: "row", marginTop: 2.5 },
  bulletDot: { fontSize: 9.5, color: "#0154AA", width: 10 },
  bulletText: { fontSize: 9.5, color: "#333333", lineHeight: 1.4, flex: 1 },
  link: { fontSize: 9, color: "#0154AA", marginTop: 1 },
  skillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  skill: {
    fontSize: 9,
    backgroundColor: "#EAF2FB",
    color: "#013F80",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});

function toLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}

function Description({ text, bullets }: { text: string; bullets: boolean }) {
  if (!text) return null;
  if (bullets) {
    return (
      <View>
        {toLines(text).map((line, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.bulletText}>{line}</Text>
          </View>
        ))}
      </View>
    );
  }
  return <Text style={styles.itemDesc}>{text}</Text>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function ResumeDocument({ data }: { data: ResumeInput }) {
  const contact = [data.email, data.phone, data.location, data.website].filter(Boolean);
  const bullets = data.bulletPoints;

  return (
    <Document title={`${data.fullName || data.title} — Resume`} author={data.fullName} creator="TalentForge">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.fullName || "Your Name"}</Text>
          {data.headline ? <Text style={styles.headline}>{data.headline}</Text> : null}
          {contact.length > 0 ? (
            <View style={styles.contactRow}>
              {contact.map((item, i) => (
                <View key={i} style={{ flexDirection: "row", gap: 10 }}>
                  {i > 0 ? <Text style={styles.contactSep}>|</Text> : null}
                  <Text style={styles.contactItem}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {data.summary ? (
          <Section title="Summary">
            <Text style={styles.bodyText}>{data.summary}</Text>
          </Section>
        ) : null}

        {data.experience.length > 0 ? (
          <Section title="Experience">
            {data.experience.map((exp, i) => (
              <View key={i} style={styles.item}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemTitle}>{exp.title}</Text>
                  <Text style={styles.itemDate}>
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                  </Text>
                </View>
                <Text style={styles.itemSub}>
                  {[exp.company, exp.location].filter(Boolean).join(" • ")}
                </Text>
                <Description text={exp.description} bullets={bullets} />
              </View>
            ))}
          </Section>
        ) : null}

        {data.projects.length > 0 ? (
          <Section title="Projects">
            {data.projects.map((p, i) => (
              <View key={i} style={styles.item}>
                <Text style={styles.itemTitle}>{p.name}</Text>
                {p.link ? <Text style={styles.link}>{p.link}</Text> : null}
                <Description text={p.description} bullets={bullets} />
              </View>
            ))}
          </Section>
        ) : null}

        {data.education.length > 0 ? (
          <Section title="Education">
            {data.education.map((edu, i) => (
              <View key={i} style={styles.item}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemTitle}>{edu.school}</Text>
                  <Text style={styles.itemDate}>
                    {edu.startYear} — {edu.endYear}
                  </Text>
                </View>
                <Text style={styles.itemSub}>
                  {[edu.degree, edu.field].filter(Boolean).join(", ")}
                </Text>
              </View>
            ))}
          </Section>
        ) : null}

        {data.certificates.length > 0 ? (
          <Section title="Certificates">
            {data.certificates.map((c, i) => (
              <View key={i} style={styles.item}>
                <View style={styles.itemHeaderRow}>
                  <Text style={styles.itemTitle}>{c.name}</Text>
                  <Text style={styles.itemDate}>{c.year}</Text>
                </View>
                {c.issuer ? <Text style={styles.itemSub}>{c.issuer}</Text> : null}
              </View>
            ))}
          </Section>
        ) : null}

        {data.skills.length > 0 ? (
          <Section title="Skills">
            <View style={styles.skillsRow}>
              {data.skills.map((skill) => (
                <Text key={skill} style={styles.skill}>
                  {skill}
                </Text>
              ))}
            </View>
          </Section>
        ) : null}

        {data.customSections.map((section, si) =>
          section.heading ? (
            <Section key={si} title={section.heading}>
              {section.items.map((item, i) => (
                <View key={i} style={styles.item}>
                  {item.title ? <Text style={styles.itemTitle}>{item.title}</Text> : null}
                  {item.subtitle ? <Text style={styles.itemSub}>{item.subtitle}</Text> : null}
                  <Description text={item.description} bullets={bullets} />
                </View>
              ))}
            </Section>
          ) : null,
        )}
      </Page>
    </Document>
  );
}
