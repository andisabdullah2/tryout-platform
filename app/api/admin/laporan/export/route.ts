import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/laporan/export?format=csv&dari=YYYY-MM-DD&sampai=YYYY-MM-DD
 * Ekspor laporan keuangan ke CSV.
 * Hanya dapat diakses oleh Admin.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const dari = searchParams.get("dari");
  const sampai = searchParams.get("sampai");

  const dateFilter = {
    ...(dari && { gte: new Date(dari) }),
    ...(sampai && { lte: new Date(sampai + "T23:59:59.999Z") }),
  };

  const transactions = await prisma.transaction.findMany({
    where: {
      status: "SUCCESS",
      ...(Object.keys(dateFilter).length > 0 && { paidAt: dateFilter }),
    },
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { nama: true, harga: true, tipe: true } },
    },
    orderBy: { paidAt: "desc" },
    take: 10000, // batas 10k baris
  });

  // Buat CSV
  const headers = [
    "Order ID",
    "Tanggal Bayar",
    "Nama Pengguna",
    "Email",
    "Item",
    "Tipe",
    "Subtotal",
    "Diskon",
    "Total",
    "Metode",
  ];

  const rows = transactions.flatMap((trx) => {
    const tanggal = trx.paidAt
      ? new Date(trx.paidAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

    return trx.items.map((item) => [
      trx.orderId,
      tanggal,
      trx.user.name,
      trx.user.email,
      item.nama,
      item.tipe,
      Number(item.harga).toFixed(0),
      Number(trx.diskon).toFixed(0),
      Number(trx.totalAmount).toFixed(0),
      trx.metode ?? "",
    ]);
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const filename = `laporan-keuangan-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
