import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { CheckoutForm } from "@/components/payment/checkout-form";
import type { CheckoutItem } from "@/components/payment/checkout-form";

export const metadata = { title: "Checkout" };

interface SearchParams {
  paket?: string;
  kelas?: string;
  langganan?: string;
  bundel?: string;
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const params = await searchParams;
  const items: CheckoutItem[] = [];

  // Paket tryout
  if (params.paket) {
    const paket = await prisma.paketTryout.findUnique({
      where: { id: params.paket, status: "PUBLISHED" },
      select: { id: true, judul: true, harga: true, modelAkses: true },
    });
    if (!paket) notFound();

    if (paket.modelAkses === "GRATIS") {
      redirect(`/tryout`);
    }

    // Cek apakah sudah punya akses
    const sudahBeli = await prisma.transactionItem.findFirst({
      where: {
        paketId: paket.id,
        transaction: { userId: session.user.id, status: "SUCCESS" },
      },
    });
    if (sudahBeli) {
      redirect(`/tryout`);
    }

    items.push({
      tipe: "PAKET_TRYOUT",
      id: paket.id,
      nama: paket.judul,
      harga: Number(paket.harga),
    });
  }

  // Kelas
  if (params.kelas) {
    const kelas = await prisma.kelas.findUnique({
      where: { id: params.kelas, status: "PUBLISHED" },
      select: { id: true, judul: true, harga: true, modelAkses: true },
    });
    if (!kelas) notFound();

    if (kelas.modelAkses === "GRATIS") {
      redirect(`/kelas`);
    }

    // Cek apakah sudah enrolled
    const sudahEnroll = await prisma.enrollment.findUnique({
      where: { userId_kelasId: { userId: session.user.id, kelasId: kelas.id } },
    });
    if (sudahEnroll) {
      redirect(`/kelas`);
    }

    items.push({
      tipe: "KELAS",
      id: kelas.id,
      nama: kelas.judul,
      harga: Number(kelas.harga),
    });
  }

  // Langganan
  if (params.langganan === "BULANAN" || params.langganan === "TAHUNAN") {
    const isTahunan = params.langganan === "TAHUNAN";
    items.push({
      tipe: "LANGGANAN",
      id: params.langganan,
      nama: isTahunan ? "Langganan Tahunan" : "Langganan Bulanan",
      harga: isTahunan ? 299000 : 49000,
    });
  }

  // Bundel tryout
  if (params.bundel) {
    const bundel = await prisma.bundelTryout.findUnique({
      where: { id: params.bundel, status: "PUBLISHED" },
      select: { id: true, judul: true, harga: true },
    });
    if (!bundel) notFound();

    const sudahBeli = await prisma.transactionItem.findFirst({
      where: {
        bundelId: bundel.id,
        transaction: { userId: session.user.id, status: "SUCCESS" },
      },
    });
    if (sudahBeli) redirect("/tryout");

    items.push({
      tipe: "BUNDEL",
      id: bundel.id,
      nama: bundel.judul,
      harga: Number(bundel.harga),
    });
  }

  if (items.length === 0) {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Checkout</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Selesaikan pembayaran untuk mengakses konten
        </p>
      </div>

      <CheckoutForm items={items} />
    </div>
  );
}
