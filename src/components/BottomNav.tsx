"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const STORAGE_KEY = "dailyseed-selected-day";

const MENUS = [
  { href: "/", key: "home", icon: "🏠", label: "홈" },
  { href: "/news", key: "news", icon: "📰", label: "뉴스" },
  { href: "/classic", key: "classic", icon: "📖", label: "고전" },
  { href: "/art", key: "art", icon: "🎨", label: "예술" },
  { href: "/world", key: "world", icon: "🌍", label: "세계" },
  { href: "/why", key: "why", icon: "🔬", label: "과학" },
  { href: "/english", key: "english", icon: "📝", label: "영어" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [dayNumber, setDayNumber] = useState(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setDayNumber(parseInt(saved, 10) + 1);
    } catch { /* ignore */ }

    // localStorage 변경 감지 (다른 탭 or DayNavigator가 변경 시)
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setDayNumber(parseInt(e.newValue, 10) + 1);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // pathname에서 현재 Day 추출 (토픽 페이지 방문 시 동기화)
  useEffect(() => {
    const match = pathname.match(/^\/(news|classic|art|world|why|english)\/(\d+)$/);
    if (match) {
      setDayNumber(parseInt(match[2], 10));
    }
  }, [pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/90 backdrop-blur-xl border-t border-gray-100/80">
        <div className="max-w-lg mx-auto flex justify-around py-1.5 px-1">
          {MENUS.map((menu) => {
            const isActive = menu.key === "home"
              ? pathname === "/"
              : pathname.startsWith(menu.href);

            const href = menu.key === "home"
              ? "/"
              : `${menu.href}/${dayNumber}`;

            return (
              <Link
                key={menu.key}
                href={href}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 active:scale-90"
              >
                <span
                  className={`text-lg transition-transform ${
                    isActive ? "scale-110" : "grayscale opacity-40"
                  }`}
                >
                  {menu.icon}
                </span>
                <span
                  className={`text-[9px] font-semibold transition-colors ${
                    isActive
                      ? "text-[var(--accent)]"
                      : "text-gray-400"
                  }`}
                >
                  {menu.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-[var(--accent)] -mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
      {/* Safe area for notched devices */}
      <div className="bg-white/90 backdrop-blur-xl h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
