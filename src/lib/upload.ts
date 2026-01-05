import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

export const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

export function assertSafePathSegments(segments: string[]) {
  for (const seg of segments) {
    if (!seg || seg === "." || seg === ".." || seg.includes("..") || seg.includes("\\") || seg.includes("/")) {
      throw new Error("Invalid path segment");
    }
  }
}

export function safeJoinUnderUploads(relativePath: string) {
  const target = path.resolve(UPLOADS_ROOT, relativePath);
  const root = path.resolve(UPLOADS_ROOT);
  if (!target.startsWith(root + path.sep) && target !== root) {
    throw new Error("Path traversal blocked");
  }
  return target;
}

export function inferExtension(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  return ALLOWED_EXT.has(ext) ? ext : null;
}

export function safeBaseName(input: string) {
  const withoutExt = input.replace(/\.[^/.]+$/, "");
  const cleaned = withoutExt
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
  return cleaned || "upload";
}

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

export function contentTypeForExt(ext: string) {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export async function saveImageFiles(params: {
  files: File[];
  relativeDir: string; // relative to /uploads
  maxFiles: number;
}) {
  const { files, relativeDir, maxFiles } = params;

  if (files.length === 0) return [];
  if (files.length > maxFiles) throw new Error(`Too many files (max ${maxFiles})`);

  const dest = safeJoinUnderUploads(relativeDir);
  await ensureDir(dest);

  const saved: Array<{ filePath: string; originalName: string }> = [];

  for (const file of files) {
    if (file.size > MAX_BYTES) throw new Error(`File too large: ${file.name} (max 10MB)`);

    const ext = inferExtension(file.name);
    if (!ext) throw new Error(`Unsupported file type: ${file.name}`);

    const base = safeBaseName(file.name);
    const nonce = crypto.randomBytes(6).toString("hex");
    const filename = `${Date.now()}-${base}-${nonce}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(path.join(dest, filename), Buffer.from(arrayBuffer));

    saved.push({
      originalName: file.name,
      filePath: path.posix.join(relativeDir.replace(/\\/g, "/"), filename),
    });
  }

  return saved;
}
