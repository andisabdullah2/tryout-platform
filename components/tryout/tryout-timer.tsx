"use client";

import { useEffect, useState, useCallback } from "react";

interface TryoutTimerProps {
  expiresAt: Date | string;
  onTimeUp: () => void;
}

export function TryoutTimer({ expiresAt, onTimeUp }: TryoutTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const exp = new Date(expiresAt);
    return Math.max(0, Math.floor((exp.getTime() - Date.now()) / 1000));
  });

  const handleTimeUp = useCallback(() => {
    onTimeUp();
  }, [onTimeUp]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      handleTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(interval);
          handleTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleTimeUp, secondsLeft]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const isWarning = secondsLeft <= 300; // 5 menit
  const isDanger = secondsLeft <= 60;   // 1 menit

  const colorClass = isDanger
    ? "text-red-600 dark:text-red-400 animate-pulse"
    : isWarning
    ? "text-yellow-600 dark:text-yellow-400"
    : "text-gray-900 dark:text-white";

  const bgClass = isDanger
    ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
    : isWarning
    ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700";

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${bgClass}`}>
      <svg className={`w-4 h-4 ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className={`font-mono font-bold text-lg tabular-nums ${colorClass}`}>
        {hours > 0 && `${String(hours).padStart(2, "0")}:`}
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
      {isWarning && !isDanger && (
        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Segera selesaikan!</span>
      )}
      {isDanger && (
        <span className="text-xs text-red-600 dark:text-red-400 font-medium">Waktu hampir habis!</span>
      )}
    </div>
  );
}
