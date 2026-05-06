'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';

interface News {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string;
  viewCount: number;
  createdAt: string;
  author?: { nickname: string };
  category?: {
    id: number;
    name: string;
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get('/news');
        setNewsList(res.data.news || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];

    return newsList.filter((news) => {
      const target = [
        news.title,
        news.content,
        news.author?.nickname,
        news.category?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return target.includes(keyword);
    });
  }, [newsList, query]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            뒤로
          </Link>
          <div className="flex-1 rounded-full bg-gray-800 px-4 py-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="검색어를 입력하세요"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">검색</h1>
          <span className="text-xs text-gray-500">{filteredNews.length}개</span>
        </div>

        <LocalResults loading={loading} newsList={filteredNews} hasQuery={Boolean(query.trim())} />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-950">
        <div className="mx-auto flex max-w-5xl">
          <Link href="/" className="flex flex-1 flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <path d="M3 10.5 12 3l9 7.5" />
              <path d="M5 10v10h14V10" />
              <path d="M9 20v-6h6v6" />
            </svg>
            <span className="text-xs text-gray-500">홈</span>
          </Link>
          <Link href="/search" className="flex flex-1 flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-xs text-blue-500">검색</span>
          </Link>
          <Link href="/mypage/bookmarks" className="flex flex-1 flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-xs text-gray-500">저장</span>
          </Link>
          <Link href="/mypage" className="flex flex-1 flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-xs text-gray-500">마이</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

function LocalResults({
  loading,
  newsList,
  hasQuery,
}: {
  loading: boolean;
  newsList: News[];
  hasQuery: boolean;
}) {
  if (loading) return <LoadingList />;

  if (!hasQuery) {
    return (
      <EmptyState>
        TechLetter에 등록된 기사 제목, 본문, 카테고리를 검색할 수 있습니다.
      </EmptyState>
    );
  }

  if (newsList.length === 0) {
    return <EmptyState>검색 결과가 없습니다.</EmptyState>;
  }

  return (
    <div className="flex flex-col">
      {newsList.map((news) => (
        <Link key={news.id} href={`/news/${news.id}`}>
          <article className="flex gap-3 rounded-lg border-b border-gray-800 px-2 py-4 transition hover:bg-gray-900">
            {getImageUrl(news.thumbnailUrl) ? (
              <img
                src={getImageUrl(news.thumbnailUrl)}
                alt={news.title}
                className="h-16 w-20 flex-shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-700 text-xs text-gray-500">
                이미지 없음
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="mb-1 line-clamp-2 text-sm font-medium text-gray-100">
                {news.title}
              </p>
              <p className="line-clamp-1 text-xs text-gray-500">
                {news.content.replace(/<[^>]*>/g, '')}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                <span>{news.category?.name || '뉴스'}</span>
                <span>조회 {news.viewCount}</span>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}

function LoadingList() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-24 animate-pulse rounded-xl bg-gray-800" />
      ))}
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-8 text-center text-sm text-gray-400">
      {children}
    </div>
  );
}
