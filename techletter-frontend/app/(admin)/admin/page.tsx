'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminNavTabs from '@/components/admin/AdminNavTabs';

interface DashboardStats {
  totalUsers: number;
  activeSubscribers: number;
  totalNews: number;
  totalViews: number;
  todayViews: number;
  draftNews: number;
  reviewNews: number;
  scheduledNews: number;
  pendingNewsletter: number;
  pendingReporters: number;
  topNews: Array<{
    id: number;
    title: string;
    viewCount: number;
    likeCount: number;
    status: string;
    author?: { nickname?: string };
  }>;
}

const emptyStats: DashboardStats = {
  totalUsers: 0,
  activeSubscribers: 0,
  totalNews: 0,
  totalViews: 0,
  todayViews: 0,
  draftNews: 0,
  reviewNews: 0,
  scheduledNews: 0,
  pendingNewsletter: 0,
  pendingReporters: 0,
  topNews: [],
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/users/me'), api.get('/stats/dashboard')])
      .then(([userResponse, statsResponse]) => {
        if (userResponse.data?.role !== 'admin') {
          router.replace('/mypage');
          return;
        }
        setStats({ ...emptyStats, ...statsResponse.data });
      })
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-950 dark:bg-[#0f0f0f] dark:text-white">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-[#0f0f0f]/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <h1 className="text-lg font-bold">관리자 운영 대시보드</h1>
            <p className="text-xs text-gray-500">콘텐츠, 기자, 사용자와 구독 현황을 한곳에서 관리합니다.</p>
          </div>
          <Link href="/admin/news/create" className="bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            기사 작성
          </Link>
        </div>
        <AdminNavTabs />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-28 animate-pulse bg-gray-200 dark:bg-gray-800" />)}
          </div>
        ) : (
          <>
            <section>
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <h2 className="text-sm font-bold">핵심 운영 지표</h2>
                  <p className="mt-1 text-xs text-gray-500">실제 서비스 데이터 기준입니다.</p>
                </div>
                <Link href="/admin/stats" className="text-xs font-semibold text-blue-600">상세 통계</Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="전체 사용자" value={stats.totalUsers} />
                <Metric label="활성 구독자" value={stats.activeSubscribers} />
                <Metric label="발행 기사" value={stats.totalNews} />
                <Metric label="누적 조회" value={stats.totalViews} sub={`오늘 ${stats.todayViews.toLocaleString()}회`} />
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-sm font-bold">지금 처리할 일</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Action href="/admin/reporter-requests" label="기자 신청 검토" count={stats.pendingReporters} tone="border-amber-300" />
                <Action href="/admin/news" label="검토 대기 기사" count={stats.reviewNews} tone="border-blue-300" />
                <Action href="/admin/news" label="임시저장 기사" count={stats.draftNews} tone="border-gray-300" />
                <Action href="/admin/sends" label="예약 뉴스레터" count={stats.pendingNewsletter + stats.scheduledNews} tone="border-emerald-300" />
              </div>
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_320px]">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold">조회 상위 기사</h2>
                  <Link href="/admin/news" className="text-xs font-semibold text-blue-600">전체 기사 관리</Link>
                </div>
                <div className="overflow-hidden border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
                  {stats.topNews.length ? stats.topNews.map((news, index) => (
                    <Link key={news.id} href={`/admin/news/${news.id}/edit`} className="grid grid-cols-[32px_minmax(0,1fr)_90px] items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
                      <span className="text-sm font-bold text-gray-400">{index + 1}</span>
                      <span className="min-w-0">
                        <strong className="block truncate text-sm">{news.title}</strong>
                        <span className="text-xs text-gray-500">{news.author?.nickname || '작성자 미상'} · 좋아요 {news.likeCount.toLocaleString()}</span>
                      </span>
                      <span className="text-right text-sm font-semibold">{news.viewCount.toLocaleString()}회</span>
                    </Link>
                  )) : <div className="px-4 py-10 text-center text-sm text-gray-500">발행된 기사가 없습니다.</div>}
                </div>
              </div>

              <aside>
                <h2 className="mb-3 text-sm font-bold">빠른 업무</h2>
                <div className="grid gap-2">
                  <QuickLink href="/admin/news/create" title="새 기사 작성" description="기사 작성과 발행 준비" />
                  <QuickLink href="/admin/users" title="사용자 관리" description="역할과 가입 현황 확인" />
                  <QuickLink href="/admin/subscribers" title="구독자 관리" description="플랜과 참여도 확인" />
                  <QuickLink href="/admin/reporters" title="기자 관리" description="승인 기자와 활동 현황 확인" />
                </div>
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
      <p className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-2 text-xs font-medium text-gray-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-blue-600">{sub}</p>}
    </div>
  );
}

function Action({ href, label, count, tone }: { href: string; label: string; count: number; tone: string }) {
  return (
    <Link href={href} className={`border-l-4 ${tone} border-y border-r border-gray-200 bg-white p-4 transition hover:bg-gray-50 dark:border-y-gray-800 dark:border-r-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900`}>
      <p className="text-2xl font-bold">{count.toLocaleString()}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{label}</p>
    </Link>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="border border-gray-200 bg-white px-4 py-3 transition hover:border-blue-400 dark:border-gray-800 dark:bg-gray-950">
      <strong className="text-sm">{title}</strong>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </Link>
  );
}
