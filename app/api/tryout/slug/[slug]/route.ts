import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ slug: string }> };

/**
 * GET /api/tryout/slug/[slug]
 * Ambil paket tryout berdasarkan slug (untuk halaman detail publik).
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const session = await auth();

  const paket = await prisma.paketTryout.findUnique({
    where: { slug },
    include: {
      soal: {
        include: {
          soal: {
            select: {
              id: true,
              konten: true,
              kategori: true,
              subtes: true,
              topik: true,
              tingkatKesulitan: true,
              tipe: true,
            },
          },
        },
        orderBy: { urutan: "asc" },
      },
      _count: { select: { sesi: true } },
    },
  });

  if (!paket) {
    return NextResponse.json(
      { success: false, error: "Paket tidak ditemukan" },
      { status: 404 }
    );
  }

  // Peserta hanya bisa lihat paket PUBLISHED
  const isAdminOrInstruktur =
    session?.user?.role === "ADMIN" || session?.user?.role === "INSTRUKTUR";

  if (!isAdminOrInstruktur && paket.status !== "PUBLISHED") {
    return NextResponse.json(
      { success: false, error: "Paket tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: paket });
}
