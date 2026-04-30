"use client";

import { NotificationBell } from "./notification-bell";
import { DarkModeToggle } from "./dark-mode-toggle";

interface NavbarProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Navbar({ title, onMenuClick }: NavbarProps) {
  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <DarkModeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
