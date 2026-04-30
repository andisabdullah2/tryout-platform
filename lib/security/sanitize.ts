/**
 * Sanitasi input untuk mencegah XSS.
 * Digunakan untuk konten soal, pembahasan, dan input teks bebas lainnya.
 *
 * Strategi:
 * - Escape karakter HTML berbahaya
 * - Izinkan Markdown dan LaTeX (tidak di-escape, dirender di sisi client dengan library aman)
 * - Hapus tag script dan event handler inline
 */

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi, // onclick=, onload=, dll
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<link\s+rel\s*=\s*["']?stylesheet/gi,
  /data:text\/html/gi,
];

/**
 * Sanitasi string dari potensi XSS.
 * Aman untuk konten Markdown + LaTeX.
 */
export function sanitizeText(input: string): string {
  let sanitized = input;
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }
  return sanitized.trim();
}

/**
 * Sanitasi objek secara rekursif — semua nilai string akan di-sanitasi.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeText(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeText(item)
          : typeof item === "object" && item !== null
            ? sanitizeObject(item as Record<string, unknown>)
            : item
      );
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/**
 * Escape HTML entities untuk output yang ditampilkan sebagai teks biasa.
 * Gunakan ini untuk nama, email, dan data yang tidak perlu Markdown.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
