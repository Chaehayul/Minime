'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';

interface News {
  id: number;
  title: string;
  lead: string;
  content: string;
  thumbnailUrl: string;
  viewCount: number;
  createdAt: string;
  category?: { id: number; name: string };
}

interface SearchResult {
  items: News[];
  total: number;
  page: number;
  totalPages: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // ✅ 실제 검색 API 호출
  const fetchSearch = useCallback(async (q: string, p = 1) => {
    if (!q.trim()) {
      setResult(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/search', { params: { q, page: p, limit: 10 } });
      if (p === 1) {
        setResult(res.data);
      } else {
        // 더보기 시 기존 결과에 추가
        setResult(prev => prev ? {
          ...res.data,
          items: [...prev.items, ...res.data.items],
        } : res.data);
      }
      setPage(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 디바운스 처리 (입력 후 500ms 뒤에 검색)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearch(query, 1);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, fetchSearch]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link href="/" className="text-gray-400 hover:text-white transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div className="flex-1 flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              placeholder="검색어를 입력하세요"
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-500 hover:text-white transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-24">

        {/* 검색 전 초기 화면 */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="text-gray-500 text-sm">검색어를 입력해주세요</p>
          </div>
        )}

        {/* 로딩 */}
        {loading && query && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        )}

        {/* 검색 결과 */}
        {!loading && result && query && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                <span className="text-white font-medium">"{query}"</span> 검색 결과
              </span>
              <span className="text-xs text-gray-500">총 {result.total}개</span>
            </div>

            {result.items.length === 0 ? (
              <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-12 text-center">
                <div className="text-gray-500 text-sm mb-1">검색 결과가 없어요</div>
                <div className="text-gray-600 text-xs">다른 키워드로 검색해보세요</div>
              </div>
            ) : (
              <div className="flex flex-col">
                {result.items.map((news) => (
                  <Link key={news.id} href={`/news/${news.id}`}>
                    <article className="flex gap-3 border-b border-gray-800 px-2 py-4 transition hover:bg-gray-900 rounded-lg">
                      {getImageUrl(news.thumbnailUrl) ? (
                        <img
                          src={getImageUrl(news.thumbnailUrl)}
                          alt={news.title}
                          className="h-16 w-20 flex-shrink-0 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-gray-700 text-xs text-gray-500">
                          없음
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 line-clamp-2 text-sm font-medium text-gray-100">
                          {news.title}
                        </p>
                        <p className="line-clamp-1 text-xs text-gray-500">
                          {news.lead || news.content.replace(/<[^>]*>/g, '').slice(0, 80)}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                          {news.category && <span>{news.category.name}</span>}
                          <span>조회 {news.viewCount}</span>
                          <span>{formatDate(news.createdAt)}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}

                {/* 더보기 버튼 */}
                {result.page < result.totalPages && (
                  <button
                    onClick={() => fetchSearch(query, page + 1)}
                    disabled={loading}
                    className="mt-4 w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                  >
                    더보기
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-gray-950">
        <div className="mx-auto flex max-w-5xl">
          <Link href="/" className="flex flex-1 flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs text-gray-500">홈</span>
          </Link>
          <Link href="/search" className="flex flex-1 flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="text-xs text-blue-500">검색</span>
          </Link>
          <Link href="/mypage/bookmarks" className="flex flex-1 flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-xs text-gray-500">저장</span>
          </Link>
          <Link href="/mypage" className="flex flex-1 flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="text-xs text-gray-500">마이</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}