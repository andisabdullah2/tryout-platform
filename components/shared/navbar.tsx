"use client";

import { NotificationBell } from "./notification-bell";
import { DarkModeToggle } from "./dark-mode-toggle";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title }: NavbarProps) {
  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 flex-shrink-0">
      {title && (
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
      )}
      <div className="ml-auto flex items-center gap-2">
        <DarkModeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
