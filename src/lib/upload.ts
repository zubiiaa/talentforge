import "server-only";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const DOC_TYPES = ["application/pdf"];

export type UploadKind = "image" | "resume";

function safeName(name: string) {
  const ext = path.extname(name).toLowerCase();
  const base = path
    .basename(name, ext)
    .replace(/[^a-z0-9]/gi, "-")
    .slice(0, 40);
  const stamp = Math.floor(performance.now()).toString(36);
  return `${base || "file"}-${stamp}${ext}`;
}

// Saves an upload and hands back its public URL. Uses Vercel Blob when the
// token is present; otherwise writes to public/uploads so local dev just works.
export async function saveUpload(
  file: File,
  folder: string,
  kind: UploadKind = "image",
): Promise<string> {
  if (file.size === 0) throw new Error("File is empty");
  if (file.size > MAX_BYTES) throw new Error("File must be under 5 MB");

  const allowed = kind === "image" ? IMAGE_TYPES : DOC_TYPES;
  if (!allowed.includes(file.type)) {
    throw new Error(
      kind === "image" ? "Please upload a PNG, JPG, or WEBP image" : "Please upload a PDF",
    );
  }

  const filename = `${folder}/${safeName(file.name)}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(filename, file, { access: "public", addRandomSuffix: true });
    return blob.url;
  }

  // Local dev fallback: write to public/uploads (gitignored).
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(dir, { recursive: true });
  const diskName = safeName(file.name);
  await writeFile(path.join(dir, diskName), bytes);
  return `/uploads/${folder}/${diskName}`;
}
