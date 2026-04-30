import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyMidtransSignature } from "@/lib/payment/midtrans";
import { sendInvoiceEmail } from "@/lib/email/resend";

interface MidtransWebhookPayload {
  order_id: string;
  transaction_status: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  payment_type?: string;
  transaction_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json() as MidtransWebhookPayload;

    // Verifikasi signature (keamanan)
    const isValid = verifyMidtransSignature(
      payload.order_id,
      payload.status_code,
      payload.gross_amount,
      payload.signature_key
    );

    if (!isValid) {
      console.error("Midtrans Webhook: Invalid Signature", {
        orderId: payload.order_id,
        received: payload.signature_key,
        serverKeyPrefix: process.env.MIDTRANS_SERVER_KEY?.substring(0, 7)
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Idempotency check — hindari proses duplikat
    const transaction = await prisma.transaction.findUnique({
      where: { orderId: payload.order_id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Jika sudah SUCCESS, skip
    if (transaction.status === "SUCCESS") {
      return NextResponse.json({ received: true, message: "Already processed" });
    }

    const { transaction_status } = payload;

    if (transaction_status === "settlement" || transaction_status === "capture") {
      // Pembayaran berhasil
      await prisma.$transaction(async (tx) => {
        // Update status transaksi
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "SUCCESS",
            metode: mapPaymentType(payload.payment_type),
            gatewayTxId: payload.transaction_id,
            paidAt: new Date(),
          },
        });

        // Aktifkan akses untuk setiap item
        for (const item of transaction.items) {
          if (item.tipe === "PAKET_TRYOUT" && item.paketId) {
            // Akses paket tryout sudah otomatis via cek transaksi
          } else if (item.tipe === "BUNDEL" && item.bundelId) {
            // Aktifkan akses ke semua paket dalam bundel
            // Akses bundel dicek via cek transaksi bundelId
            // Tidak perlu buat record terpisah — cukup transaksi SUCCESS
          } else if (item.tipe === "KELAS" && item.kelasId) {
            // Enroll ke kelas
            await tx.enrollment.upsert({
              where: { userId_kelasId: { userId: transaction.userId, kelasId: item.kelasId } },
              create: { userId: transaction.userId, kelasId: item.kelasId },
              update: {},
            });
          } else if (item.tipe === "LANGGANAN") {
            // Aktifkan langganan
            const tipe = item.nama.toLowerCase().includes("tahunan") ? "TAHUNAN" : "BULANAN";
            const durasi = tipe === "TAHUNAN" ? 365 : 30;
            await tx.subscription.create({
              data: {
                userId: transaction.userId,
                tipe,
                startDate: new Date(),
                endDate: new Date(Date.now() + durasi * 24 * 60 * 60 * 1000),
                isActive: true,
              },
            });
          }
        }

        // Update penggunaan promo
        if (transaction.promoId) {
          await tx.promoCode.update({
            where: { id: transaction.promoId },
            data: { totalUsed: { increment: 1 } },
          });
        }

        // Notifikasi in-app
        await tx.notification.create({
          data: {
            userId: transaction.userId,
            tipe: "PAYMENT_SUCCESS",
            judul: "Pembayaran Berhasil",
            pesan: `Pembayaran #${transaction.orderId} sebesar Rp ${Number(transaction.totalAmount).toLocaleString("id-ID")} berhasil`,
            data: { orderId: transaction.orderId },
          },
        });
      });

      // Kirim invoice email (async)
      sendInvoiceEmail({
        to: transaction.user.email,
        name: transaction.user.name,
        orderId: transaction.orderId,
        items: transaction.items.map((i) => ({ nama: i.nama, harga: Number(i.harga) })),
        total: Number(transaction.totalAmount),
      }).catch(console.error);

    } else if (transaction_status === "expire" || transaction_status === "cancel" || transaction_status === "deny") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: transaction_status === "expire" ? "EXPIRED" : "FAILED" },
      });

      // Notifikasi gagal
      await prisma.notification.create({
        data: {
          userId: transaction.userId,
          tipe: "PAYMENT_FAILED",
          judul: "Pembayaran Gagal",
          pesan: `Pembayaran #${transaction.orderId} gagal atau kedaluwarsa`,
          data: { orderId: transaction.orderId },
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Midtrans webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

function mapPaymentType(paymentType?: string) {
  const map: Record<string, string> = {
    "bank_transfer": "TRANSFER_BANK",
    "credit_card": "KARTU_KREDIT",
    "gopay": "GOPAY",
    "ovo": "OVO",
    "dana": "DANA",
    "qris": "QRIS",
    "echannel": "TRANSFER_BANK",
    "bca_klikbca": "TRANSFER_BANK",
    "bca_klikpay": "TRANSFER_BANK",
    "cimb_clicks": "TRANSFER_BANK",
    "danamon_online": "TRANSFER_BANK",
    "mandiri_clickpay": "TRANSFER_BANK",
    "bri_epay": "TRANSFER_BANK",
  };
  return (map[paymentType ?? ""] ?? "TRANSFER_BANK") as "TRANSFER_BANK" | "KARTU_KREDIT" | "GOPAY" | "OVO" | "DANA" | "QRIS" | "VIRTUAL_ACCOUNT";
}
