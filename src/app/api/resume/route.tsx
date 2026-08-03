import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentUser } from "@/lib/session";
import { getResumeForOwner } from "@/data/resumes";
import { ResumeDocument } from "@/lib/resume-document";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const resumeId = searchParams.get("resumeId");

  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!resumeId) return new Response("Missing resumeId", { status: 400 });

  const resume = await getResumeForOwner(resumeId, user.id);
  if (!resume) return new Response("Resume not found", { status: 404 });

  const buffer = await renderToBuffer(<ResumeDocument data={resume} />);
  const filename = `${(resume.fullName || resume.title).replace(/[^a-z0-9]+/gi, "-")}-Resume.pdf`;

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
