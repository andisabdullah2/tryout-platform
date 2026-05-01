import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "TryoutLearning",
    template: "%s | TryoutLearning",
  },
  description:
    "Platform tryout online dan pembelajaran untuk persiapan CPNS, Sekdin, dan UTBK/SNBT",
  keywords: ["tryout", "CPNS", "UTBK", "SNBT", "Sekdin", "belajar online", "SKD"],
  authors: [{ name: "TryoutLearning" }],

  openGraph: {
    type: "website",
    locale: "id_ID",
    title: "TryoutLearning",
    description:
      "Platform tryout online dan pembelajaran untuk persiapan CPNS, Sekdin, dan UTBK/SNBT",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 19.1: lang="id" untuk screen readers, suppressHydrationWarning untuk dark mode
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* 19.1: Viewport meta untuk responsivitas */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        {/* 19.1: Skip to main content link untuk keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
        >
          Lewati ke konten utama
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
