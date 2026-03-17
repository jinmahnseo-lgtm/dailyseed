"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const MENUS = [
  { href: "/", icon: "🏠", label: "홈" },
  { href: "/news", icon: "📰", label: "뉴스" },
  { href: "/classic", icon: "📖", label: "고전" },
  { href: "/art", icon: "🎨", label: "명화" },
  { href: "/world", icon: "🌍", label: "세계" },
  { href: "/why", icon: "🔬", label: "왜?" },
  { href: "/english", icon: "📝", label: "영어" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50">
      <div className="max-w-lg mx-auto flex justify-around py-2 px-0">
        {MENUS.map((menu) => {
          const isActive = pathname === menu.href;
          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl transition-all ${
                isActive
                  ? "text-[var(--accent)] scale-110"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className="text-lg">{menu.icon}</span>
              <span className={`text-[9px] font-semibold ${isActive ? "text-[var(--accent)]" : ""}`}>
                {menu.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
