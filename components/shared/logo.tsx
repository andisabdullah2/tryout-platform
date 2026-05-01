import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  href?: string;
  showText?: boolean;
  iconSize?: number;
  className?: string;
  /** "dark" = light bg (sidebar), "light" = dark bg (footer/admin dark) */
  textColor?: "dark" | "light";
}

export function Logo({
  href = "/",
  showText = true,
  iconSize = 36,
  className = "",
  textColor = "dark",
}: LogoProps) {
  const isLight = textColor === "light";

  const content = (
    <span className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo-icon.svg"
        alt="TryoutLearning"
        width={iconSize}
        height={iconSize}
        priority
      />
      {showText && (
        <span className="flex flex-col leading-none gap-[3px]">
          <span className="flex items-baseline gap-0">
            <span
              className={`font-black text-[17px] tracking-tight leading-none ${
                isLight ? "text-white" : "text-[#0A1840] dark:text-white"
              }`}
            >
              Tryout
            </span>
            <span className="font-black text-[17px] tracking-tight leading-none text-[#3B6FDB]">
              Learning
            </span>
          </span>
          <span
            className={`text-[7.5px] font-semibold tracking-[0.14em] uppercase leading-none ${
              isLight ? "text-blue-300" : "text-gray-400 dark:text-gray-500"
            }`}
          >
            Latihan Hari Ini, Sukses Esok Hari
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
