import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const jawabSchema = z.object({
  soalId: z.string().min(1),
  opsiId: z.string().nullable(), // null = hapus jawaban
  waktuJawab: z.number().int().min(0).optional(), // detik sejak mulai
});

const batchJawabSchema = z.object({
  answers: z.record(z.string().nullable()), // { soalId: opsiId | null }
  waktuSync: z.number().int().min(0).optional(),
});

type RouteParams = { params: Promise<{ sessionId: string }> };

// POST: simpan satu jawaban atau batch jawaban (auto-save)
export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { sessionId } = await params;

  // Validasi sesi (Property 11)
  const sesi = await prisma.tryoutSession.findFirst({
    where: { id: sessionId, userId: session.user.id, status: "ACTIVE" },
  });

  if (!sesi) {
    return NextResponse.json(
      { success: false, error: "Sesi tidak valid atau sudah berakhir", code: "INVALID_SESSION" },
      { status: 403 }
    );
  }

  // Cek expired
  if (sesi.expiresAt < new Date()) {
    await prisma.tryoutSession.update({
      where: { id: sessionId },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json(
      { success: false, error: "Waktu tryout telah habis", code: "SESSION_EXPIRED" },
      { status: 410 }
    );
  }

  try {
    const body = await request.json();

    // Cek apakah batch atau single
    if ("answers" in body) {
      // Batch auto-save
      const validation = batchJawabSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ success: false, error: "Data tidak valid" }, { status: 422 });
      }

      const { answers } = validation.data;
      const urutanSoal = sesi.urutanSoal as string[];

      // Validasi semua soalId ada dalam sesi
      const validSoalIds = new Set(urutanSoal);
      const filteredAnswers = Object.entries(answers).filter(([soalId]) => validSoalIds.has(soalId));

      // Upsert jawaban secara batch
      await Promise.all(
        filteredAnswers.map(([soalId, opsiId]) =>
          prisma.jawabanPeserta.upsert({
            where: { sessionId_soalId: { sessionId, soalId } },
            create: { sessionId, soalId, opsiId },
            update: { opsiId, answeredAt: new Date() },
          })
        )
      );

      // Update snapshot dan lastSyncedAt
      const currentSnapshot = sesi.snapshotJawaban as Record<string, string | null>;
      const newSnapshot = { ...currentSnapshot, ...Object.fromEntries(filteredAnswers) };

      await prisma.tryoutSession.update({
        where: { id: sessionId },
        data: {
          snapshotJawaban: newSnapshot,
          lastSyncedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: { saved: filteredAnswers.length, lastSyncedAt: new Date() },
      });

    } else {
      // Single jawaban
      const validation = jawabSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ success: false, error: "Data tidak valid" }, { status: 422 });
      }

      const { soalId, opsiId, waktuJawab } = validation.data;

      // Validasi soalId ada dalam sesi
      const urutanSoal = sesi.urutanSoal as string[];
      if (!urutanSoal.includes(soalId)) {
        return NextResponse.json(
          { success: false, error: "Soal tidak ada dalam sesi ini" },
          { status: 422 }
        );
      }

      await prisma.jawabanPeserta.upsert({
        where: { sessionId_soalId: { sessionId, soalId } },
        create: { sessionId, soalId, opsiId, waktuJawab },
        update: { opsiId, waktuJawab, answeredAt: new Date() },
      });

      // Update snapshot
      const currentSnapshot = sesi.snapshotJawaban as Record<string, string | null>;
      await prisma.tryoutSession.update({
        where: { id: sessionId },
        data: {
          snapshotJawaban: { ...currentSnapshot, [soalId]: opsiId },
          lastSyncedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: { saved: true, soalId, opsiId },
      });
    }
  } catch (error) {
    console.error("Jawab error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
