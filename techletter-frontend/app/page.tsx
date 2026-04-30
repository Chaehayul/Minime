'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';

interface News {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string;
  viewCount: number;
  createdAt: string;
  author: { nickname: string };
}

interface Category {
  id: number;
  name: string;
}

interface User {
  nickname: string;
}

export default function HomePage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [topNews, setTopNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [newsLoading, setNewsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      api.get('/users/me').then(res => setUser(res.data)).catch(() => {});
    }

    const fetchInitial = async () => {
      try {
        const [newsRes, topRes, catRes] = await Promise.all([
          api.get('/news'),
          api.get('/stats/top-news'),
          api.get('/categories'),
        ]);
        setNewsList(newsRes.data.news || []);
        setTopNews(topRes.data.slice(0, 4));
        setCategories(catRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  useEffect(() => {
    if (loading) return;
    const fetchByCategory = async () => {
      setNewsLoading(true);
      try {
        const params: any = {};
        if (activeCategoryId !== null) params.categoryId = activeCategoryId;
        const res = await api.get('/news', { params });
        setNewsList(res.data.news || []);
      } catch (err) {
        console.error(err);
      } finally {
        setNewsLoading(false);
      }
    };
    fetchByCategory();
  }, [activeCategoryId]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-lg font-bold text-white">TechLetter</Link>
          <Link href="/search" className="flex-1 bg-gray-800 rounded-full px-4 py-2 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span className="text-sm text-gray-500">검색</span>
          </Link>
          {isLoggedIn ? (
            <Link href="/mypage">
              <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center text-blue-300 font-bold text-sm cursor-pointer">
                {user?.nickname?.[0]?.toUpperCase() || 'U'}
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-gray-400 hover:text-white transition">로그인</Link>
              <Link href="/signup" className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition">회원가입</Link>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-8 pb-24">
        {/* 배너 */}
        <div className="w-full h-36 bg-gray-800 rounded-2xl flex items-center justify-center text-gray-500 text-sm border border-gray-700">
          이번 주 핫뉴스 배너
        </div>

        {/* 지금 핫한 뉴스 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">⚡</span>
              <h2 className="font-bold text-base">지금 핫한 뉴스</h2>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="bg-gray-800 rounded-xl h-40 animate-pulse" />)}
            </div>
          ) : topNews.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {topNews.map((news) => (
                <Link key={news.id} href={`/news/${news.id}`}>
                  <div className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-500 transition cursor-pointer h-40 flex flex-col overflow-hidden">
                    {getImageUrl(news.thumbnailUrl) ? (
                      <img src={getImageUrl(news.thumbnailUrl)} alt={news.title} className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-gray-700 flex items-center justify-center text-gray-500 text-xs">이미지 없음</div>
                    )}
                    <div className="p-2 flex flex-col justify-between flex-1">
                      <p className="text-xs font-medium line-clamp-2 text-gray-200">{news.title}</p>
                      <span className="text-xs text-gray-500">👁 {news.viewCount}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">아직 뉴스가 없어요</p>
          )}
        </section>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategoryId(null)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
              activeCategoryId === null ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >전체</button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeCategoryId === cat.id ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >{cat.name}</button>
          ))}
        </div>

        {/* 최신 뉴스 목록 */}
        <section>
          <h2 className="font-bold text-base mb-4">
            {activeCategoryId === null ? '최신 뉴스' : `${categories.find(c => c.id === activeCategoryId)?.name} 뉴스`}
          </h2>
          {loading || newsLoading ? (
            <div className="flex flex-col gap-3">
              {[1,2,3].map(i => <div key={i} className="bg-gray-800 rounded-xl h-24 animate-pulse" />)}
            </div>
          ) : newsList.length > 0 ? (
            <div className="flex flex-col gap-0">
              {newsList.map((news) => (
                <Link key={news.id} href={`/news/${news.id}`}>
                  <div className="flex gap-3 py-4 border-b border-gray-800 hover:bg-gray-900 transition px-2 rounded-lg cursor-pointer">
                    {getImageUrl(news.thumbnailUrl) ? (
                      <img src={getImageUrl(news.thumbnailUrl)} alt={news.title}
                        className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="bg-gray-700 rounded-lg w-20 h-16 flex-shrink-0 flex items-center justify-center text-gray-500 text-xs">이미지 없음</div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2 text-gray-100 mb-1">{news.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{news.content.replace(/<[^>]*>/g, '')}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span>👁 {news.viewCount}</span>
                        <span>{new Date(news.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">해당 카테고리의 뉴스가 없어요</p>
          )}
        </section>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800">
        <div className="max-w-5xl mx-auto flex">
          <Link href="/" className="flex-1 flex flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563EB"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-xs text-blue-500">홈</span>
          </Link>
          <Link href="/search" className="flex-1 flex flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span className="text-xs text-gray-500">검색</span>
          </Link>
          <Link href="/mypage/bookmarks" className="flex-1 flex flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <span className="text-xs text-gray-500">저장</span>
          </Link>
          <Link href="/mypage" className="flex-1 flex flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="text-xs text-gray-500">마이</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
