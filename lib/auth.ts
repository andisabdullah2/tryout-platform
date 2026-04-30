import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  validatePassword,
  validateEmail,
  isAccountLocked,
  calculateLockUntil,
  MAX_LOGIN_ATTEMPTS,
} from "@/lib/auth/validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email dan password diperlukan");
        }

        const emailValidation = validateEmail(credentials.email as string);
        if (!emailValidation.valid) {
          throw new Error("Format email tidak valid");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          throw new Error("Email atau password salah");
        }

        // Cek apakah akun terkunci
        if (isAccountLocked(user.lockedUntil)) {
          const lockMinutes = Math.ceil(
            (user.lockedUntil!.getTime() - Date.now()) / 60000
          );
          throw new Error(
            `Akun terkunci. Coba lagi dalam ${lockMinutes} menit`
          );
        }

        // Cek apakah akun aktif
        if (!user.isActive) {
          throw new Error("Akun Anda telah dinonaktifkan");
        }

        // Cek apakah akun menggunakan OAuth (tidak punya password)
        if (!user.password) {
          throw new Error("Gunakan login Google untuk akun ini");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          // Tambah hitungan login gagal
          const newAttempts = user.loginAttempts + 1;
          const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              loginAttempts: newAttempts,
              lockedUntil: shouldLock ? calculateLockUntil() : null,
            },
          });

          if (shouldLock) {
            throw new Error(
              `Terlalu banyak percobaan login. Akun dikunci selama 15 menit`
            );
          }

          const remaining = MAX_LOGIN_ATTEMPTS - newAttempts;
          throw new Error(
            `Email atau password salah. ${remaining} percobaan tersisa`
          );
        }

        // Login berhasil — reset login attempts
        await prisma.user.update({
          where: { id: user.id },
          data: { loginAttempts: 0, lockedUntil: null },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Saat login pertama, simpan role ke token
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      // TIDAK query Prisma di sini — middleware berjalan di Edge Runtime
      // Role di-refresh hanya saat login ulang atau token expired
      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 hari
  },
  secret: process.env.NEXTAUTH_SECRET,
});
