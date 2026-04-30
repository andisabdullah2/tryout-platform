import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email/resend";
import crypto from "crypto";
import { rateLimit } from "@/lib/security/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(8, "Kata sandi harus minimal 8 karakter"),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, "register");
  if (limited) return limited;
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Data tidak valid",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { name, email, password, phone } = validation.data;

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone ?? null,
        role: "PESERTA",
      },
    });

    // Buat token verifikasi email
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 jam

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Kirim email verifikasi
    await sendVerificationEmail(email, token);

    return NextResponse.json(
      {
        success: true,
        data: {
          message:
            "Akun berhasil dibuat. Silakan cek email Anda untuk verifikasi.",
          userId: user.id,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
