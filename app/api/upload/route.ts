import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createUploadSignedUrl,
  generateFileKey,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
} from "@/lib/storage";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { filename, contentType, folder = "uploads" } = body as {
      filename: string;
      contentType: string;
      folder?: string;
    };

    if (!filename || !contentType) {
      return NextResponse.json(
        { success: false, error: "filename dan contentType diperlukan" },
        { status: 422 }
      );
    }

    // Validasi tipe file
    const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { success: false, error: `Tipe file tidak diizinkan: ${contentType}` },
        { status: 422 }
      );
    }

    // Validasi ukuran (dari header Content-Length jika ada)
    const contentLength = parseInt(request.headers.get("x-file-size") ?? "0");
    const maxSize = ALLOWED_IMAGE_TYPES.includes(contentType)
      ? MAX_IMAGE_SIZE
      : MAX_DOCUMENT_SIZE;

    if (contentLength > maxSize) {
      return NextResponse.json(
        { success: false, error: `Ukuran file melebihi batas (${maxSize / 1024 / 1024}MB)` },
        { status: 422 }
      );
    }

    const key = generateFileKey(folder, filename, session.user.id);
    const uploadUrl = await createUploadSignedUrl(key, contentType);
    const publicUrl = `${process.env.R2_PUBLIC_URL ?? ""}/${key}`;

    return NextResponse.json({
      success: true,
      data: { uploadUrl, key, publicUrl },
    });
  } catch (error) {
    console.error("Upload URL error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
