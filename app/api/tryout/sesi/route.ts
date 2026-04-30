import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { acakUrutanSoal } from "@/lib/tryout/shuffle";

const startSesiSchema = z.object({
  paketId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Tidak terautentikasi" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = startSesiSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "paketId diperlukan" },
        { status: 422 }
      );
    }

    const { paketId } = validation.data;
    const userId = session.user.id;

    // Ambil paket tryout
    const paket = await prisma.paketTryout.findUnique({
      where: { id: paketId, status: "PUBLISHED" },
      include: {
        soal: {
          include: {
            soal: {
              select: {
                id: true,
                konten: true,
                gambarUrl: true,
                tipe: true,
                subtes: true,
                opsi: {
                  select: { id: true, label: true, konten: true },
                  orderBy: { label: "asc" },
                },
              },
            },
          },
          orderBy: { urutan: "asc" },
        },
      },
    });

    if (!paket) {
      return NextResponse.json({ success: false, error: "Paket tidak ditemukan" }, { status: 404 });
    }

    // Validasi akses
    if (paket.modelAkses !== "GRATIS") {
      const [transaksiPaket, transaksiBundel, langganan] = await Promise.all([
        // Cek pembelian paket langsung
        prisma.transactionItem.findFirst({
          where: { paketId, transaction: { userId, status: "SUCCESS" } },
        }),
        // Cek pembelian bundel yang berisi paket ini
        prisma.transactionItem.findFirst({
          where: {
            transaction: { userId, status: "SUCCESS" },
            bundel: {
              paket: { some: { paketId } },
            },
          },
        }),
        prisma.subscription.findFirst({
          where: { userId, isActive: true, endDate: { gt: new Date() } },
        }),
      ]);

      const hasAccess = !!(transaksiPaket || transaksiBundel || (langganan && paket.modelAkses === "LANGGANAN"));
      if (!hasAccess) {
        return NextResponse.json(
          { success: false, error: "Anda tidak memiliki akses ke paket ini", code: "ACCESS_DENIED" },
          { status: 403 }
        );
      }
    }

    // Cek sesi aktif yang sudah ada (Property 11 — anti-cheat)
    const sesiAktif = await prisma.tryoutSession.findFirst({
      where: { userId, paketId, status: "ACTIVE" },
    });

    if (sesiAktif) {
      // Cek apakah sesi masih valid
      if (sesiAktif.expiresAt > new Date()) {
        return NextResponse.json({
          success: true,
          data: {
            sessionId: sesiAktif.id,
            resumed: true,
            message: "Melanjutkan sesi yang sudah ada",
          },
        });
      } else {
        // Sesi expired — tandai sebagai EXPIRED
        await prisma.tryoutSession.update({
          where: { id: sesiAktif.id },
          data: { status: "EXPIRED" },
        });
      }
    }

    // Acak urutan soal (Property 10)
    const soalIds = paket.soal.map((ps) => ps.soal.id);
    const urutanSoalAcak = acakUrutanSoal(soalIds);

    // Acak opsi jawaban per soal
    const soalDenganOpsiAcak = paket.soal.map((ps) => {
      const soal = ps.soal;
      const opsiAcak = [...soal.opsi].sort(() => Math.random() - 0.5);
      return {
        id: soal.id,
        konten: soal.konten,
        gambarUrl: soal.gambarUrl,
        tipe: soal.tipe,
        subtes: soal.subtes,
        opsi: opsiAcak,
      };
    });

    // Buat map soalId -> soal untuk pengiriman ke client
    const soalMap = Object.fromEntries(soalDenganOpsiAcak.map((s) => [s.id, s]));

    // Hitung waktu kedaluwarsa
    const expiresAt = new Date(Date.now() + paket.durasi * 60 * 1000);

    // Ambil IP dan User-Agent
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? request.headers.get("x-real-ip")
      ?? "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";

    // Buat sesi baru
    const sesi = await prisma.tryoutSession.create({
      data: {
        userId,
        paketId,
        expiresAt,
        urutanSoal: urutanSoalAcak,
        snapshotJawaban: {},
        activityLog: [],
        ipAddress,
        userAgent,
      },
    });

    // Kembalikan soal dalam urutan yang sudah diacak
    const soalTerurut = urutanSoalAcak.map((id) => soalMap[id]).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        sessionId: sesi.id,
        paket: {
          id: paket.id,
          judul: paket.judul,
          kategori: paket.kategori,
          durasi: paket.durasi,
          totalSoal: paket.totalSoal,
        },
        soal: soalTerurut,
        expiresAt: sesi.expiresAt,
        startedAt: sesi.startedAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Start sesi error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
