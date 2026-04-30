import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "noreply@tryout-platform.com";
const APP_NAME = "Platform Tryout & Belajar";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Verifikasi Email - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Verifikasi Email Anda</h2>
        <p>Terima kasih telah mendaftar di <strong>${APP_NAME}</strong>.</p>
        <p>Klik tombol di bawah untuk memverifikasi email Anda:</p>
        <a href="${verifyUrl}" 
           style="display: inline-block; background-color: #1a56db; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                  margin: 16px 0;">
          Verifikasi Email
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          Tautan ini berlaku selama 24 jam. Jika Anda tidak mendaftar, abaikan email ini.
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          Atau salin tautan ini: <a href="${verifyUrl}">${verifyUrl}</a>
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Reset Kata Sandi - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Reset Kata Sandi</h2>
        <p>Kami menerima permintaan untuk mereset kata sandi akun Anda.</p>
        <p>Klik tombol di bawah untuk membuat kata sandi baru:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; background-color: #1a56db; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; 
                  margin: 16px 0;">
          Reset Kata Sandi
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          Tautan ini berlaku selama 1 jam. Jika Anda tidak meminta reset kata sandi, abaikan email ini.
        </p>
      </div>
    `,
  });
}

export async function sendInvoiceEmail(params: {
  to: string;
  name: string;
  orderId: string;
  items: { nama: string; harga: number }[];
  total: number;
}) {
  const itemsHtml = params.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.nama}</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            Rp ${item.harga.toLocaleString("id-ID")}
          </td>
        </tr>`
    )
    .join("");

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Invoice Pembayaran #${params.orderId} - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Invoice Pembayaran</h2>
        <p>Halo <strong>${params.name}</strong>,</p>
        <p>Pembayaran Anda telah berhasil diproses.</p>
        <p><strong>No. Order:</strong> ${params.orderId}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: right;">Harga</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Total</td>
              <td style="padding: 8px; font-weight: bold; text-align: right;">
                Rp ${params.total.toLocaleString("id-ID")}
              </td>
            </tr>
          </tfoot>
        </table>
        <p style="color: #6b7280; font-size: 14px;">
          Terima kasih telah menggunakan ${APP_NAME}. Selamat belajar!
        </p>
      </div>
    `,
  });
}

export async function sendLiveClassReminderEmail(params: {
  to: string;
  name: string;
  judulLiveClass: string;
  jadwalMulai: Date;
  kelasJudul: string;
}) {
  const jadwalFormatted = params.jadwalMulai.toLocaleString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Pengingat Live Class: ${params.judulLiveClass} - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a56db;">Pengingat Live Class</h2>
        <p>Halo <strong>${params.name}</strong>,</p>
        <p>Live class yang Anda daftarkan akan segera dimulai:</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Judul:</strong> ${params.judulLiveClass}</p>
          <p><strong>Kelas:</strong> ${params.kelasJudul}</p>
          <p><strong>Jadwal:</strong> ${jadwalFormatted} WIB</p>
        </div>
        <a href="${APP_URL}/live-class" 
           style="display: inline-block; background-color: #1a56db; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Lihat Jadwal Live Class
        </a>
      </div>
    `,
  });
}

export async function sendSubscriptionExpiringEmail(params: {
  to: string;
  name: string;
  endDate: Date;
  daysLeft: number;
}) {
  const endDateFormatted = params.endDate.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: `Langganan Anda akan berakhir dalam ${params.daysLeft} hari - ${APP_NAME}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Langganan Akan Berakhir</h2>
        <p>Halo <strong>${params.name}</strong>,</p>
        <p>Langganan Anda akan berakhir pada <strong>${endDateFormatted}</strong> 
           (${params.daysLeft} hari lagi).</p>
        <p>Perpanjang sekarang untuk tetap mengakses semua konten premium.</p>
        <a href="${APP_URL}/langganan" 
           style="display: inline-block; background-color: #1a56db; color: white; 
                  padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Perpanjang Langganan
        </a>
      </div>
    `,
  });
}
