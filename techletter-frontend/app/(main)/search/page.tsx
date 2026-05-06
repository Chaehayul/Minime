'use client';

import { useEffect, useMemo, useState } from 'react';
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
    <div className="min-h-screen transition-colors duration-200">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white">
            ←
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

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 rounded-xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : filteredNews.length > 0 ? (
          <div className="flex flex-col">
            {filteredNews.map((news) => (
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
        ) : (
          <div className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-8 text-center text-sm text-gray-400">
            검색 결과가 없습니다.
          </div>
        )}
      </main>
    </div>
  );
}
