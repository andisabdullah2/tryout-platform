import midtransClient from "midtrans-client";
import crypto from "crypto";

const snap = new midtransClient.Snap({
  isProduction: process.env.NODE_ENV === "production",
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

export interface MidtransItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface MidtransCustomer {
  name: string;
  email: string;
  phone?: string;
}

export async function createSnapTransaction(params: {
  orderId: string;
  amount: number;
  customer: MidtransCustomer;
  items: MidtransItem[];
}) {
  return snap.createTransaction({
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    customer_details: {
      first_name: params.customer.name,
      email: params.customer.email,
      phone: params.customer.phone,
    },
    item_details: params.items,
    expiry: { duration: 24, unit: "hours" },
  });
}

/**
 * Verifikasi signature webhook Midtrans
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  receivedSignature: string
): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const hash = crypto
    .createHash("sha512")
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest("hex");
  return hash === receivedSignature;
}

export { snap };
