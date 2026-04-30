import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createModulSchema = z.object({
  judul: z.string().min(3),
  deskripsi: z.string().optional().nullable(),
  urutan: z.number().int().min(1),
  isLocked: z.boolean().default(false),
  isKuisAktif: z.boolean().default(false),
});

type RouteParams = { params: Promise<{ kelasId: string }> };

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }
  if (session.user.role === "PESERTA") {
    return NextResponse.json({ success: false, error: "Akses ditolak" }, { status: 403 });
  }

  const { kelasId } = await params;

  try {
    const body = await request.json();
    const validation = createModulSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Data tidak valid", details: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const modul = await prisma.modul.create({
      data: { ...validation.data, kelasId },
    });

    return NextResponse.json({ success: true, data: modul }, { status: 201 });
  } catch (error) {
    console.error("Create modul error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
