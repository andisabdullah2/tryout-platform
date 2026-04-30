/**
 * Integration Tests: Alur Pembayaran End-to-End
 *
 * Menguji logika webhook handler Midtrans secara terisolasi
 * tanpa memanggil API routes secara langsung (tidak perlu server).
 *
 * Fokus: verifikasi signature, idempotency, aktivasi akses
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { verifyMidtransSignature } from "@/lib/payment/midtrans";
import { applyPromoDiscount } from "@/lib/payment/promo";

// ============================================================
// Helper: buat signature Midtrans yang valid
// ============================================================
function buildMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string
): string {
  return crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
}

// ============================================================
// Simulasi logika webhook handler (tanpa Prisma/HTTP)
// ============================================================

type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED";

interface MockTransaction {
  id: string;
  orderId: string;
  status: TransactionStatus;
  userId: string;
  totalAmount: number;
  promoId: string | null;
  items: { tipe: string; paketId?: string; kelasId?: string }[];
}

interface WebhookPayload {
  order_id: string;
  transaction_status: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  payment_type?: string;
  transaction_id?: string;
}

/**
 * Simulasi logika webhook handler
 */
function processWebhook(
  payload: WebhookPayload,
  transaction: MockTransaction | null,
  serverKey: string
): {
  success: boolean;
  error?: string;
  statusCode: number;
  newStatus?: TransactionStatus;
  alreadyProcessed?: boolean;
} {
  // 1. Verifikasi signature
  const isValid = verifyMidtransSignature(
    payload.order_id,
    payload.status_code,
    payload.gross_amount,
    payload.signature_key
  );

  if (!isValid) {
    return { success: false, error: "Invalid signature", statusCode: 401 };
  }

  // 2. Cek transaksi ada
  if (!transaction) {
    return { success: false, error: "Transaction not found", statusCode: 404 };
  }

  // 3. Idempotency: jika sudah SUCCESS, skip
  if (transaction.status === "SUCCESS") {
    return { success: true, statusCode: 200, alreadyProcessed: true };
  }

  // 4. Proses berdasarkan status
  const { transaction_status } = payload;

  if (transaction_status === "settlement" || transaction_status === "capture") {
    return { success: true, statusCode: 200, newStatus: "SUCCESS" };
  }

  if (
    transaction_status === "expire" ||
    transaction_status === "cancel" ||
    transaction_status === "deny"
  ) {
    const newStatus: TransactionStatus =
      transaction_status === "expire" ? "EXPIRED" : "FAILED";
    return { success: true, statusCode: 200, newStatus };
  }

  return { success: true, statusCode: 200 };
}

// ============================================================
// Tests
// ============================================================

describe("Webhook Handler: Verifikasi Signature", () => {
  const SERVER_KEY = "test-server-key";

  beforeEach(() => {
    vi.stubEnv("MIDTRANS_SERVER_KEY", SERVER_KEY);
  });

  it("menolak webhook dengan signature tidak valid", () => {
    const payload: WebhookPayload = {
      order_id: "TRX-001",
      transaction_status: "settlement",
      status_code: "200",
      gross_amount: "100000.00",
      signature_key: "invalid-signature",
    };

    const result = processWebhook(payload, null, SERVER_KEY);
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(401);
    expect(result.error).toBe("Invalid signature");
  });

  it("menerima webhook dengan signature valid", () => {
    const orderId = "TRX-001";
    const statusCode = "200";
    const grossAmount = "100000.00";
    const signature = buildMidtransSignature(orderId, statusCode, grossAmount, SERVER_KEY);

    const payload: WebhookPayload = {
      order_id: orderId,
      transaction_status: "settlement",
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signature,
    };

    const transaction: MockTransaction = {
      id: "tx-1",
      orderId,
      status: "PENDING",
      userId: "user-1",
      totalAmount: 100000,
      promoId: null,
      items: [{ tipe: "PAKET_TRYOUT", paketId: "paket-1" }],
    };

    const result = processWebhook(payload, transaction, SERVER_KEY);
    expect(result.success).toBe(true);
    expect(result.newStatus).toBe("SUCCESS");
  });
});

describe("Webhook Handler: Idempotency", () => {
  const SERVER_KEY = "test-server-key";

  beforeEach(() => {
    vi.stubEnv("MIDTRANS_SERVER_KEY", SERVER_KEY);
  });

  it("tidak memproses ulang transaksi yang sudah SUCCESS", () => {
    const orderId = "TRX-002";
    const statusCode = "200";
    const grossAmount = "150000.00";
    const signature = buildMidtransSignature(orderId, statusCode, grossAmount, SERVER_KEY);

    const payload: WebhookPayload = {
      order_id: orderId,
      transaction_status: "settlement",
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signature,
    };

    const transaction: MockTransaction = {
      id: "tx-2",
      orderId,
      status: "SUCCESS", // sudah diproses sebelumnya
      userId: "user-1",
      totalAmount: 150000,
      promoId: null,
      items: [],
    };

    const result = processWebhook(payload, transaction, SERVER_KEY);
    expect(result.success).toBe(true);
    expect(result.alreadyProcessed).toBe(true);
    expect(result.newStatus).toBeUndefined(); // tidak ada perubahan status
  });

  it("memproses transaksi PENDING menjadi SUCCESS", () => {
    const orderId = "TRX-003";
    const statusCode = "200";
    const grossAmount = "200000.00";
    const signature = buildMidtransSignature(orderId, statusCode, grossAmount, SERVER_KEY);

    const payload: WebhookPayload = {
      order_id: orderId,
      transaction_status: "settlement",
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signature,
    };

    const transaction: MockTransaction = {
      id: "tx-3",
      orderId,
      status: "PENDING",
      userId: "user-2",
      totalAmount: 200000,
      promoId: null,
      items: [{ tipe: "KELAS", kelasId: "kelas-1" }],
    };

    const result = processWebhook(payload, transaction, SERVER_KEY);
    expect(result.success).toBe(true);
    expect(result.newStatus).toBe("SUCCESS");
    expect(result.alreadyProcessed).toBeUndefined();
  });
});

describe("Webhook Handler: Status Mapping", () => {
  const SERVER_KEY = "test-server-key";

  beforeEach(() => {
    vi.stubEnv("MIDTRANS_SERVER_KEY", SERVER_KEY);
  });

  const buildValidPayload = (
    orderId: string,
    transactionStatus: string
  ): WebhookPayload => {
    const statusCode = "200";
    const grossAmount = "100000.00";
    return {
      order_id: orderId,
      transaction_status: transactionStatus,
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: buildMidtransSignature(orderId, statusCode, grossAmount, SERVER_KEY),
    };
  };

  const pendingTx = (orderId: string): MockTransaction => ({
    id: "tx-x",
    orderId,
    status: "PENDING",
    userId: "user-1",
    totalAmount: 100000,
    promoId: null,
    items: [],
  });

  it("settlement → SUCCESS", () => {
    const result = processWebhook(
      buildValidPayload("TRX-S1", "settlement"),
      pendingTx("TRX-S1"),
      SERVER_KEY
    );
    expect(result.newStatus).toBe("SUCCESS");
  });

  it("capture → SUCCESS", () => {
    const result = processWebhook(
      buildValidPayload("TRX-S2", "capture"),
      pendingTx("TRX-S2"),
      SERVER_KEY
    );
    expect(result.newStatus).toBe("SUCCESS");
  });

  it("expire → EXPIRED", () => {
    const result = processWebhook(
      buildValidPayload("TRX-S3", "expire"),
      pendingTx("TRX-S3"),
      SERVER_KEY
    );
    expect(result.newStatus).toBe("EXPIRED");
  });

  it("cancel → FAILED", () => {
    const result = processWebhook(
      buildValidPayload("TRX-S4", "cancel"),
      pendingTx("TRX-S4"),
      SERVER_KEY
    );
    expect(result.newStatus).toBe("FAILED");
  });

  it("deny → FAILED", () => {
    const result = processWebhook(
      buildValidPayload("TRX-S5", "deny"),
      pendingTx("TRX-S5"),
      SERVER_KEY
    );
    expect(result.newStatus).toBe("FAILED");
  });
});

describe("Webhook Handler: Transaksi Tidak Ditemukan", () => {
  const SERVER_KEY = "test-server-key";

  beforeEach(() => {
    vi.stubEnv("MIDTRANS_SERVER_KEY", SERVER_KEY);
  });

  it("mengembalikan 404 jika transaksi tidak ditemukan", () => {
    const orderId = "TRX-NOTFOUND";
    const statusCode = "200";
    const grossAmount = "100000.00";
    const signature = buildMidtransSignature(orderId, statusCode, grossAmount, SERVER_KEY);

    const payload: WebhookPayload = {
      order_id: orderId,
      transaction_status: "settlement",
      status_code: statusCode,
      gross_amount: grossAmount,
      signature_key: signature,
    };

    const result = processWebhook(payload, null, SERVER_KEY);
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(404);
  });
});

// ============================================================
// Kalkulasi Diskon dalam Konteks Pembayaran
// ============================================================
describe("Kalkulasi Diskon dalam Alur Checkout", () => {
  it("diskon diterapkan sebelum pembayaran dibuat", () => {
    const hargaAsli = 299000;
    const promo = { tipe: "PERSEN" as const, nilai: 20 };
    const result = applyPromoDiscount(hargaAsli, promo);

    // Verifikasi total yang akan dibayar
    expect(result.finalAmount).toBeLessThan(hargaAsli);
    expect(result.finalAmount + result.diskonDiterapkan).toBe(hargaAsli);
  });

  it("total pembayaran tidak pernah negatif", () => {
    const cases = [
      { harga: 100000, diskon: { tipe: "NOMINAL" as const, nilai: 200000 } },
      { harga: 50000, diskon: { tipe: "PERSEN" as const, nilai: 100 } },
      { harga: 0, diskon: { tipe: "NOMINAL" as const, nilai: 50000 } },
    ];

    for (const { harga, diskon } of cases) {
      const result = applyPromoDiscount(harga, diskon);
      expect(result.finalAmount).toBeGreaterThanOrEqual(0);
    }
  });
});
