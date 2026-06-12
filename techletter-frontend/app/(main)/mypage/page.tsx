'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';
import ProfileAvatar from '@/components/common/ProfileAvatar';
import { useUserReport } from '@/hooks/useUserReport';

interface User {
  id: number;
  email: string;
  nickname: string;
  role: 'user' | 'reporter' | 'admin';
  profileImage?: string | null;
  bio?: string | null;
}

interface Subscription {
  status: 'NONE' | 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PAYMENT_FAILED';
  planType: 'daily' | 'weekly' | 'all' | 'premium' | null;
}

interface Bookmark {
  id: number;
  news?: {
    id: number;
    title: string;
    thumbnailUrl?: string | null;
    category?: { name: string } | null;
  } | null;
}

const roleLabel = { user: '일반 사용자', reporter: '기자', admin: '관리자' };
const planLabel: Record<string, string> = {
  daily: '데일리',
  weekly: '위클리',
  all: '통합',
  premium: '프리미엄',
};

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <strong className="block text-2xl font-bold tabular-nums">{value.toLocaleString()}</strong>
      <span className="mt-1 block text-xs text-gray-500">{label}</span>
    </div>
  );
}

export default function MyPage() {
  const router = useRouter();
  const { report, loading: reportLoading } = useUserReport();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users/me'),
      api.get('/subscriptions/me').catch(() => ({ data: null })),
      api.get('/users/me/bookmarks').catch(() => ({ data: [] })),
    ])
      .then(([userResponse, subscriptionResponse, bookmarkResponse]) => {
        setUser(userResponse.data);
        setSubscription(subscriptionResponse.data);
        setBookmarks(Array.isArray(bookmarkResponse.data) ? bookmarkResponse.data : []);
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || reportLoading) {
    return <main className="mx-auto min-h-screen max-w-5xl px-4 py-10"><div className="h-40 animate-pulse bg-gray-100 dark:bg-gray-900" /></main>;
  }
  if (!user) return null;

  const activeSubscription = subscription?.status === 'ACTIVE';
  const workspaceHref = user.role === 'admin' ? '/admin' : '/reporter/dashboard';

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <section className="flex flex-col gap-5 border-b border-gray-200 pb-8 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ProfileAvatar imageUrl={getImageUrl(user.profileImage)} nickname={user.nickname} size="lg" />
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-2xl font-bold">{user.nickname}</h1>
              <span className="border border-gray-300 px-2 py-0.5 text-xs text-gray-500 dark:border-gray-700">{roleLabel[user.role]}</span>
            </div>
            <p className="text-sm text-gray-500">{user.email}</p>
            {user.bio && <p className="mt-2 max-w-xl text-sm text-gray-600 dark:text-gray-400">{user.bio}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          {user.role !== 'user' && (
            <Link href={workspaceHref} className="bg-gray-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-gray-950">
              {user.role === 'admin' ? '관리자 업무로 이동' : '기자 업무로 이동'}
            </Link>
          )}
          <Link href="/mypage/profile" className="border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">프로필 수정</Link>
        </div>
      </section>

      <section className="py-8">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-600">My activity</p>
            <h2 className="mt-1 text-xl font-bold">이번 달 이용 리포트</h2>
          </div>
          <span className="text-xs text-gray-500">실제 계정 활동 기준</span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard value={report?.monthlyReadCount ?? 0} label="읽은 기사" />
          <StatCard value={report?.bookmarkCount ?? 0} label="저장한 기사" />
          <StatCard value={report?.likeCount ?? 0} label="좋아요" />
          <StatCard value={report?.commentCount ?? 0} label="작성한 댓글" />
        </div>
      </section>

      <div className="grid gap-8 border-t border-gray-200 pt-8 dark:border-gray-800 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">최근 저장한 기사</h2>
            <Link href="/mypage/bookmarks" className="text-sm font-semibold text-blue-600">전체 보기</Link>
          </div>
          <div className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {bookmarks.slice(0, 4).map((bookmark) => {
              if (!bookmark.news) return null;
              const image = getImageUrl(bookmark.news.thumbnailUrl);
              return (
                <Link key={bookmark.id} href={`/news/${bookmark.news.id}`} className="flex items-center gap-4 py-4">
                  {image ? <img src={image} alt="" className="h-16 w-24 object-cover" /> : (
                    <div className="flex h-16 w-24 items-center justify-center bg-gray-100 text-xs text-gray-400 dark:bg-gray-900">MINIME</div>
                  )}
                  <div className="min-w-0">
                    <span className="text-xs text-blue-600">{bookmark.news.category?.name ?? '테크 뉴스'}</span>
                    <p className="mt-1 line-clamp-2 font-semibold">{bookmark.news.title}</p>
                  </div>
                </Link>
              );
            })}
            {bookmarks.length === 0 && <p className="py-10 text-center text-sm text-gray-500">저장한 기사가 아직 없습니다.</p>}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="border border-gray-200 p-5 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase text-gray-500">Subscription</p>
            <div className="mt-3 flex items-center justify-between">
              <strong>{activeSubscription ? `${planLabel[subscription?.planType ?? ''] ?? '뉴스레터'} 구독 중` : '무료 이용 중'}</strong>
              <span className={`h-2 w-2 rounded-full ${activeSubscription ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {activeSubscription ? '선택한 일정에 맞춰 핵심 뉴스를 받아보고 있습니다.' : '원하는 주기로 핵심 기술 뉴스를 받아보세요.'}
            </p>
            <Link href="/subscriptions/plans" className="mt-4 block border border-gray-300 px-3 py-2 text-center text-sm font-semibold dark:border-gray-700">구독 관리</Link>
          </section>

          <section className="border border-gray-200 p-5 dark:border-gray-800">
            <p className="text-xs font-semibold uppercase text-gray-500">Interests</p>
            <h2 className="mt-1 font-bold">관심 카테고리</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(report?.topCategories ?? []).map(({ category }) => (
                <Link key={category.id} href={`/?category=${category.id}`} className="bg-gray-100 px-3 py-1.5 text-sm dark:bg-gray-800">{category.name}</Link>
              ))}
              {!report?.topCategories?.length && <span className="text-sm text-gray-500">기사를 읽으면 관심 분야가 표시됩니다.</span>}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
