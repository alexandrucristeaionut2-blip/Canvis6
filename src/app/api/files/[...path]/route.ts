import fs from "fs/promises";
import { NextResponse } from "next/server";
import { assertSafePathSegments, contentTypeForExt, safeJoinUnderUploads } from "@/lib/upload";
import path from "path";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  try {
    assertSafePathSegments(segments);
    const rel = segments.join("/");
    const abs = safeJoinUnderUploads(rel);

    const data = await fs.readFile(abs);
    const ext = path.extname(abs).toLowerCase();

    return new NextResponse(data, {
      headers: {
        "Content-Type": contentTypeForExt(ext),
        "Cache-Control": "private, max-age=0, must-revalidate",
        "Content-Disposition": "inline",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
