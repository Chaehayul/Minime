'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';

// News 타입 정의 (필요에 따라 확장 가능)
interface News {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  viewCount: number;
  category?: { name: string };
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchQuery(query);
    setLoading(true);
    try {
      // 백엔드 뉴스 검색 API 호출
      const res = await api.get('/news', { params: { search: query } });
      // 백엔드 응답 구조에 맞춰 배열 세팅 (res.data.news 또는 res.data)
      setNewsList(res.data.news || res.data || []);
    } catch (err) {
      console.error('검색 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 전체 배경 다크모드 대응
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors">
      {/* ── 검색바 헤더 ── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-100 dark:border-[#2E2E2E]">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-center">
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mini + Me에서 궁금한 뉴스를 검색해보세요"
              className="w-full bg-gray-100 dark:bg-[#1E1E1E] border border-transparent dark:border-[#3A3A3A]
                         text-gray-900 dark:text-white text-sm rounded-xl pl-10 pr-4 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <svg className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
        </div>
      </header>

      {/* ── 검색 결과 영역 ── */}
      <main className="max-w-xl mx-auto px-4 py-6 pb-32">
        <LocalResults loading={loading} newsList={newsList} hasQuery={!!searchQuery} />
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
        Mini + Me에 등록된 기사 제목, 본문, 카테고리를 검색할 수 있습니다.
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
          <article className="flex gap-3 rounded-2xl border-b border-gray-100 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] px-3 py-4 mb-3 transition hover:bg-gray-50 dark:hover:bg-[#2A2A2A]">
            {getImageUrl(news.thumbnailUrl) ? (
              <img
                src={getImageUrl(news.thumbnailUrl)}
                alt={news.title}
                className="h-16 w-20 flex-shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#2A2A2A] text-xs text-gray-400 dark:text-gray-500">
                이미지 없음
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {news.title}
              </p>
              <p className="line-clamp-1 text-xs text-gray-500 dark:text-gray-400">
                {news.content.replace(/<[^>]*>/g, '')}
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
    <div className="rounded-2xl border border-gray-100 dark:border-[#2E2E2E] bg-white dark:bg-[#1E1E1E] px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
      {children}
    </div>
  );
}