import { Metadata } from "next";
import { notices } from "@/data/notices";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return notices.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const notice = notices.find((n) => n.id === id);
  if (!notice) return { title: "공지사항 — DailySeed" };
  return {
    title: `${notice.title} — DailySeed 공지사항`,
    description: notice.subtitle,
    alternates: { canonical: `/notice/${id}` },
    openGraph: {
      title: `${notice.title} — DailySeed 공지사항`,
      description: notice.subtitle,
      url: `/notice/${id}`,
    },
  };
}

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notice = notices.find((n) => n.id === id);
  if (!notice) return notFound();

  const paragraphs = notice.content.split("\n\n");

  return (
    <div className="min-h-screen max-w-lg mx-auto px-5 py-8 pb-24">
      <a href="/notice" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">
        ← 공지사항
      </a>

      <div className="mb-6">
        <span className="text-3xl">{notice.icon}</span>
        <h1 className="text-xl font-bold mt-2 text-[var(--foreground)]">{notice.title}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{notice.subtitle}</p>
        <p className="text-[11px] text-gray-300 mt-2">{notice.date}</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-[var(--border-light)] space-y-4"
        style={{ boxShadow: "var(--shadow-sm)" }}>
        {paragraphs.map((p, i) => {
          if (p.startsWith("[") && p.includes("]")) {
            const title = p.match(/^\[(.+?)\]/)?.[1];
            const rest = p.replace(/^\[.+?\]\n?/, "");
            return (
              <div key={i}>
                <h3 className="text-sm font-bold text-[var(--foreground)] mb-2">{title}</h3>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{rest}</div>
              </div>
            );
          }
          return (
            <p key={i} className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{p}</p>
          );
        })}
      </div>

      {/* Navigation between notices */}
      <div className="flex justify-between mt-6">
        {notices.findIndex((n) => n.id === id) > 0 ? (
          <a href={`/notice/${notices[notices.findIndex((n) => n.id === id) - 1].id}`}
            className="text-xs text-gray-400 hover:text-gray-600">
            ← 이전 글
          </a>
        ) : <span />}
        {notices.findIndex((n) => n.id === id) < notices.length - 1 ? (
          <a href={`/notice/${notices[notices.findIndex((n) => n.id === id) + 1].id}`}
            className="text-xs text-gray-400 hover:text-gray-600">
            다음 글 →
          </a>
        ) : <span />}
      </div>
    </div>
  );
}
