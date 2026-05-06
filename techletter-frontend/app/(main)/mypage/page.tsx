'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';

interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
}

interface Bookmark {
  id: number;
  createdAt: string;
  news: {
    id: number;
    title: string;
    thumbnailUrl?: string;
  };
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [userRes, bookmarkRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/users/me/bookmarks').catch(() => ({ data: [] })),
        ]);
        setUser(userRes.data);
        setBookmarks(Array.isArray(bookmarkRes.data) ? bookmarkRes.data : []);
      } catch {
        localStorage.removeItem('accessToken');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-800" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            홈
          </Link>
          <h1 className="text-base font-bold">마이페이지</h1>
          <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white">
            로그아웃
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6 pb-24">
        <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold">
              {user?.nickname?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-lg font-semibold">{user?.nickname}</h2>
                {user?.role === 'admin' && (
                  <span className="rounded bg-blue-600/20 px-2 py-0.5 text-xs font-semibold text-blue-300">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </section>

        {user?.role === 'admin' && (
          <section className="rounded-xl border border-blue-900/50 bg-blue-950/30 p-5">
            <h2 className="mb-3 text-sm font-semibold text-blue-300">관리자 메뉴</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <AdminLink href="/admin/news/create" label="뉴스 작성" />
              <AdminLink href="/admin/news" label="뉴스 관리" />
              <AdminLink href="/admin/stats" label="통계 대시보드" />
            </div>
          </section>
        )}

        <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">최근 저장한 뉴스</h2>
            <Link href="/mypage/bookmarks" className="text-xs text-blue-400 hover:underline">
              전체 보기
            </Link>
          </div>

          {bookmarks.length > 0 ? (
            <div className="flex flex-col">
              {bookmarks.slice(0, 5).map((bookmark) => (
                <Link
                  key={bookmark.id}
                  href={`/news/${bookmark.news.id}`}
                  className="flex gap-3 border-b border-gray-800 py-3 last:border-b-0 hover:bg-gray-800"
                >
                  {bookmark.news.thumbnailUrl ? (
                    <img
                      src={getImageUrl(bookmark.news.thumbnailUrl)}
                      alt={bookmark.news.title}
                      className="h-14 w-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-16 items-center justify-center rounded-lg bg-gray-800 text-xs text-gray-500">
                      없음
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm text-gray-100">{bookmark.news.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(bookmark.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">저장한 뉴스가 없습니다.</p>
          )}
        </section>

        <section className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex flex-col">
            <MenuLink href="/mypage/settings" label="계정 설정" />
            <MenuLink href="/mypage/bookmarks" label="북마크" />
          </div>
        </section>
      </main>
    </div>
  );
}

function AdminLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-blue-700"
    >
      {label}
    </Link>
  );
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-gray-800 py-3 text-sm text-gray-200 last:border-b-0 hover:text-white"
    >
      <span>{label}</span>
      <span className="text-gray-600">›</span>
    </Link>
  );
}
