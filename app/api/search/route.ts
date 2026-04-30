import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().min(1).max(100),
  tipe: z.enum(["all", "tryout", "kelas", "modul"]).optional().default("all"),
  limit: z.coerce.number().int().min(1).max(20).optional().default(8),
});

export interface SearchResult {
  id: string;
  tipe: "tryout" | "kelas" | "modul";
  judul: string;
  deskripsi: string;
  kategori?: string;
  harga?: number;
  modelAkses?: string;
  slug?: string;
  kelasSlug?: string; // untuk modul: slug kelas induknya
}

/**
 * GET /api/search?q=...&tipe=all|tryout|kelas|modul&limit=8
 * Pencarian global untuk paket tryout, kelas, dan modul.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const validation = searchSchema.safeParse({
    q: searchParams.get("q") ?? "",
    tipe: searchParams.get("tipe") ?? "all",
    limit: searchParams.get("limit") ?? "8",
  });

  if (!validation.success) {
    return NextResponse.json(
      { success: false, error: "Parameter tidak valid" },
      { status: 422 }
    );
  }

  const { q, tipe, limit } = validation.data;
  const results: SearchResult[] = [];

  const searchFilter = { contains: q, mode: "insensitive" as const };
  const perType = Math.ceil(limit / (tipe === "all" ? 3 : 1));

  await Promise.all([
    // Paket Tryout
    (tipe === "all" || tipe === "tryout") &&
      prisma.paketTryout
        .findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { judul: searchFilter },
              { deskripsi: searchFilter },
              { subKategori: searchFilter },
            ],
          },
          select: {
            id: true,
            slug: true,
            judul: true,
            deskripsi: true,
            kategori: true,
            harga: true,
            modelAkses: true,
          },
          take: perType,
        })
        .then((items) => {
          results.push(
            ...items.map((p) => ({
              id: p.id,
              tipe: "tryout" as const,
              judul: p.judul,
              deskripsi: p.deskripsi.slice(0, 100),
              kategori: p.kategori,
              harga: Number(p.harga),
              modelAkses: p.modelAkses,
              slug: p.slug,
            }))
          );
        }),

    // Kelas
    (tipe === "all" || tipe === "kelas") &&
      prisma.kelas
        .findMany({
          where: {
            status: "PUBLISHED",
            OR: [{ judul: searchFilter }, { deskripsi: searchFilter }],
          },
          select: {
            id: true,
            slug: true,
            judul: true,
            deskripsi: true,
            kategori: true,
            harga: true,
            modelAkses: true,
          },
          take: perType,
        })
        .then((items) => {
          results.push(
            ...items.map((k) => ({
              id: k.id,
              tipe: "kelas" as const,
              judul: k.judul,
              deskripsi: k.deskripsi.slice(0, 100),
              kategori: k.kategori,
              harga: Number(k.harga),
              modelAkses: k.modelAkses,
              slug: k.slug,
            }))
          );
        }),

    // Modul
    (tipe === "all" || tipe === "modul") &&
      prisma.modul
        .findMany({
          where: {
            kelas: { status: "PUBLISHED" },
            OR: [{ judul: searchFilter }, { deskripsi: searchFilter }],
          },
          select: {
            id: true,
            judul: true,
            deskripsi: true,
            kelas: { select: { slug: true, kategori: true } },
          },
          take: perType,
        })
        .then((items) => {
          results.push(
            ...items.map((m) => ({
              id: m.id,
              tipe: "modul" as const,
              judul: m.judul,
              deskripsi: m.deskripsi ?? "",
              kategori: m.kelas.kategori,
              kelasSlug: m.kelas.slug,
            }))
          );
        }),
  ]);

  return NextResponse.json({
    success: true,
    data: { results, query: q, total: results.length },
  });
}
