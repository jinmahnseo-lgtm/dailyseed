import { notices } from "@/data/notices";

export default function NoticePage() {
  return (
    <div className="min-h-screen max-w-lg mx-auto px-5 py-8 pb-24">
      <a href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        ← 홈으로
      </a>
      <h1 className="text-2xl font-bold mb-1">공지사항</h1>
      <p className="text-sm text-gray-400 mb-6">DailySeed 소식을 전해드려요</p>

      <div className="space-y-3">
        {notices.map((notice) => (
          <a key={notice.id} href={`/notice/${notice.id}`}>
            <div className="bg-white rounded-2xl p-5 border border-[var(--border-light)] hover:shadow-md transition-all active:scale-[0.98]"
              style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-start gap-3.5">
                <span className="text-2xl flex-shrink-0 mt-0.5">{notice.icon}</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-[var(--foreground)] leading-snug">
                    {notice.title}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {notice.subtitle}
                  </p>
                  <p className="text-[11px] text-gray-300 mt-1.5">{notice.date}</p>
                </div>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
