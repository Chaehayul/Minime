'use client';

import { FormEvent, ReactNode, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';

interface News {
  id: number;
  title: string;
  content?: string;
  lead?: string;
  thumbnailUrl: string | null;
  viewCount: number;
  category?: { name: string };
  tags?: { name: string }[];
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-[#121212]" />}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTag = searchParams.get('tag') || '';
  const [query, setQuery] = useState(initialQuery || (initialTag ? `#${initialTag}` : ''));
  const [resultLabel, setResultLabel] = useState('');
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = async (value: string, mode: 'search' | 'tag' = 'search') => {
    const cleanValue = value.trim().replace(/^#/, '');
    if (!cleanValue) return;

    setLoading(true);
    setResultLabel(mode === 'tag' ? `#${cleanValue}` : cleanValue);
    try {
      const params = mode === 'tag' ? { tag: cleanValue, limit: 30 } : { search: cleanValue, limit: 30 };
      const res = await api.get('/news', { params });
      setNewsList(res.data.news || res.data || []);
    } catch (err) {
      console.error('검색 오류:', err);
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTag) {
      setQuery(`#${initialTag}`);
      runSearch(initialTag, 'tag');
      return;
    }
    if (initialQuery) {
      setQuery(initialQuery);
      runSearch(initialQuery);
    }
  }, [initialQuery, initialTag]);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const mode = query.trim().startsWith('#') ? 'tag' : 'search';
    await runSearch(query, mode);
  };

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-[#121212]">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-[#2E2E2E] dark:bg-[#121212]/80">
        <div className="mx-auto flex h-14 max-w-xl items-center justify-center px-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="뉴스, 태그, 키워드를 검색해보세요"
              className="w-full rounded-xl border border-transparent bg-gray-100 py-2.5 pl-10 pr-4 text-sm text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-[#3A3A3A] dark:bg-[#1E1E1E] dark:text-white"
            />
            <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-6 pb-32">
        {resultLabel && <p className="mb-4 text-sm font-semibold text-gray-700 dark:text-gray-200">검색 결과: {resultLabel}</p>}
        <LocalResults loading={loading} newsList={newsList} hasQuery={!!resultLabel} />
      </main>
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
        기사 제목, 본문, 카테고리, 태그를 검색할 수 있습니다. 태그는 #AI처럼 입력해도 됩니다.
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
          <article className="mb-3 flex gap-3 rounded-2xl border-b border-gray-100 bg-white px-3 py-4 transition hover:bg-gray-50 dark:border-[#2E2E2E] dark:bg-[#1E1E1E] dark:hover:bg-[#2A2A2A]">
            {getImageUrl(news.thumbnailUrl) ? (
              <img
                src={getImageUrl(news.thumbnailUrl)}
                alt={news.title}
                className="h-16 w-20 flex-shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 dark:bg-[#2A2A2A] dark:text-gray-500">
                이미지 없음
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {news.title}
              </p>
              <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                {news.lead || news.content?.replace(/<[^>]*>/g, '')}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
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
        <div key={item} className="h-24 animate-pulse rounded-2xl bg-gray-100 dark:bg-[#1E1E1E]" />
      ))}
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-12 text-center text-sm text-gray-500 dark:border-[#2E2E2E] dark:bg-[#1E1E1E] dark:text-gray-400">
      {children}
    </div>
  );
}
