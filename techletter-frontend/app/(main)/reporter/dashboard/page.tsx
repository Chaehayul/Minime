'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';
import ProfileAvatar from '@/components/common/ProfileAvatar';
import AdminNavTabs from '@/components/admin/AdminNavTabs';

interface ReporterDashboard {
  profile: { slug: string; displayName: string; headline?: string | null; profileImage?: string | null };
  stats: {
    subscriberCount: number; publishedCount: number; draftCount: number;
    totalViews: number; totalLikes: number; conversionRate: number;
  };
  news: Array<{ id: number; title: string; status: string; viewCount: number; likeCount: number }>;
}

const statusLabel: Record<string, string> = {
  draft: '초안', review: '검토 요청', approved: '승인',
  published: '발행', scheduled: '예약',
};

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <strong className="text-2xl tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</strong>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}

export default function ReporterDashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<ReporterDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reporters/me/dashboard')
      .then((response) => setDashboard(response.data))
      .catch(() => router.replace('/mypage'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !dashboard) {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950"><div className="h-10 w-10 animate-pulse bg-gray-200 dark:bg-gray-800" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 dark:bg-gray-950">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div><h1 className="text-lg font-bold">기자 워크스페이스</h1><p className="text-xs text-gray-500">기사 성과와 독자 반응을 확인합니다.</p></div>
          <Link href="/reporter/news/create" className="bg-blue-600 px-4 py-2 text-sm font-semibold text-white">기사 작성</Link>
        </div>
        <AdminNavTabs />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <section className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center gap-3">
              <ProfileAvatar nickname={dashboard.profile.displayName} imageUrl={getImageUrl(dashboard.profile.profileImage)} size="lg" />
              <div className="min-w-0"><strong className="block truncate text-sm">{dashboard.profile.displayName}</strong><p className="mt-1 line-clamp-2 text-xs text-gray-500">{dashboard.profile.headline || 'MINIME 인증 기자'}</p></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link href={`/reporters/${dashboard.profile.slug}`} className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold dark:border-gray-700">공개 프로필</Link>
              <Link href="/reporter/profile/edit" className="bg-blue-600 px-3 py-2 text-center text-xs font-semibold text-white">프로필 편집</Link>
            </div>
          </aside>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="구독자" value={dashboard.stats.subscriberCount} />
            <Metric label="발행 기사" value={dashboard.stats.publishedCount} />
            <Metric label="총 조회" value={dashboard.stats.totalViews} />
            <Metric label="구독 전환율" value={`${dashboard.stats.conversionRate || 0}%`} />
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-bold">콘텐츠 진행 흐름</h2>
          <div className="mt-3 grid grid-cols-2 border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 sm:grid-cols-4">
            {['초안 작성', '검토 요청', '관리자 승인', '발행 및 분석'].map((step, index) => (
              <div key={step} className="border-r border-gray-200 px-3 py-4 text-center last:border-0 dark:border-gray-800">
                <span className="text-xs font-bold text-blue-600">{index + 1}</span><p className="mt-1 text-xs">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_320px]">
          <div>
            <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">최근 기사</h2><Link href="/reporter/news" className="text-xs font-semibold text-blue-600">전체 기사</Link></div>
            <div className="border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
              {dashboard.news.slice(0, 5).map((news) => (
                <Link key={news.id} href={`/reporter/news/${news.id}/edit`} className="grid grid-cols-[1fr_auto] gap-4 border-b border-gray-100 p-4 last:border-0 dark:border-gray-800">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold">{news.title}</p><span className="mt-1 block text-xs text-blue-600">{statusLabel[news.status] || news.status}</span></div>
                  <div className="text-right text-xs text-gray-500"><p>조회 {news.viewCount.toLocaleString()}</p><p className="mt-1">좋아요 {news.likeCount.toLocaleString()}</p></div>
                </Link>
              ))}
              {!dashboard.news.length && <p className="p-10 text-center text-sm text-gray-500">첫 기사를 작성해보세요.</p>}
            </div>
          </div>
          <aside className="border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p className="text-xs font-semibold uppercase text-blue-600">Reader response</p><h2 className="mt-1 font-bold">독자 반응 요약</h2>
            <div className="mt-5 space-y-4"><Metric label="전체 좋아요" value={dashboard.stats.totalLikes} /><Metric label="작성 중인 초안" value={dashboard.stats.draftCount} /></div>
          </aside>
        </section>
      </main>
    </div>
  );
}
