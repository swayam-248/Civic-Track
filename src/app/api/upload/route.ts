import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_MIME_PREFIX = "image/";
const MAX_BYTES = 15 * 1024 * 1024; // 15MB

// POST /api/upload - multipart/form-data with a "file" field.
// Returns the public URL of the stored image.
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required. Please log in to upload photos." },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isImageMime = file.type && file.type.toLowerCase().startsWith(ALLOWED_MIME_PREFIX);
    const fileName = file.name || "";
    const hasImageExt = /\.(jpe?g|png|webp|jfif|gif|avif|heic|heif)$/i.test(fileName);

    if (!isImageMime && !hasImageExt) {
      return NextResponse.json(
        { error: "Only images (JPEG, PNG, WEBP, GIF, AVIF) are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image size exceeds 15MB limit. Please upload a smaller image." },
        { status: 400 }
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    
    // Determine extension
    let ext = "jpg";
    if (file.type === "image/png" || fileName.endsWith(".png")) ext = "png";
    else if (file.type === "image/webp" || fileName.endsWith(".webp")) ext = "webp";
    else if (file.type === "image/gif" || fileName.endsWith(".gif")) ext = "gif";
    else if (file.type === "image/avif" || fileName.endsWith(".avif")) ext = "avif";

    const filename = `${randomUUID()}.${ext}`;

    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadsDir, { recursive: true });
      await writeFile(path.join(uploadsDir, filename), bytes);
      return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
    } catch (fsError: any) {
      console.warn("Filesystem write failed, falling back to data URL:", fsError);
      // Fallback to base64 data URL if filesystem write is restricted
      const mime = file.type || `image/${ext}`;
      const dataUrl = `data:${mime};base64,${bytes.toString("base64")}`;
      return NextResponse.json({ url: dataUrl }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process image upload" },
      { status: 500 }
    );
  }
}
