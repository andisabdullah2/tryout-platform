import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createKontenSchema = z.object({
  tipe: z.enum(["TEKS", "PDF", "VIDEO", "LINK_EKSTERNAL"]),
  judul: z.string().min(3, "Judul minimal 3 karakter"),
  konten: z.string().optional().nullable(),
  fileUrl: z.string().url().optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
  durasi: z.number().int().optional().nullable(),
  urutan: z.number().int().min(1),
  muxAssetId: z.string().optional().nullable(),
  muxPlaybackId: z.string().optional().nullable(),
});

type RouteParams = { params: Promise<{ modulId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Tidak terautentikasi" },
      { status: 401 }
    );
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json(
      { success: false, error: "Akses ditolak" },
      { status: 403 }
    );
  }

  const { modulId } = await params;

  try {
    const body = await request.json();
    const validation = createKontenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const konten = await prisma.kontenModul.create({
      data: {
        modulId,
        ...validation.data,
      },
    });

    return NextResponse.json({ success: true, data: konten }, { status: 201 });
  } catch (error) {
    console.error("Create konten error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
