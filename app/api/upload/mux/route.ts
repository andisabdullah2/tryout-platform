import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createMuxUploadUrl } from "@/lib/mux";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  try {
    const corsOrigin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const { uploadUrl, uploadId } = await createMuxUploadUrl(corsOrigin);

    return NextResponse.json({
      success: true,
      data: { uploadUrl, uploadId },
    });
  } catch (error) {
    console.error("Mux upload URL error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat upload URL" },
      { status: 500 }
    );
  }
}
