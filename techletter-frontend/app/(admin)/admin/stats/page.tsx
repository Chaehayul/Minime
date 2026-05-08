'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';

interface Stats {
  totalNews: number;
  totalComments: number;
  topNews: {
    id: number;
    title: string;
    viewCount: number;
    likeCount: number;
    thumbnailUrl: string;
    createdAt: string;
    author: { nickname: string };
  }[];
}

export default function AdminStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats/dashboard');
        setStats(res.data);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-500">로딩 중...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-10">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.push('/mypage')} className="text-gray-400 hover:text-white transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="font-bold text-base flex-1">통계 대시보드</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* 핵심 지표 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">핵심 지표</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">{stats?.totalNews.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">게시된 뉴스</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400">{stats?.totalComments.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">전체 댓글</div>
            </div>
          </div>
        </section>

        {/* 인기 뉴스 TOP 5 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">인기 뉴스 TOP 5</h2>
          <div className="flex flex-col gap-2">
            {stats?.topNews.map((news, index) => (
              <Link key={news.id} href={`/news/${news.id}`}>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:border-gray-500 transition cursor-pointer">
                  {/* 순위 */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>

                  {/* 썸네일 */}
                  {getImageUrl(news.thumbnailUrl) ? (
                    <img src={getImageUrl(news.thumbnailUrl)} alt={news.title}
                      className="w-14 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-10 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-500 text-xs">없음</div>
                  )}

                  {/* 제목 + 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-100 line-clamp-1">{news.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{news.author?.nickname}</span>
                      <span>{new Date(news.createdAt).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>

                  {/* 조회수/좋아요 */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {news.viewCount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      {news.likeCount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {(!stats?.topNews || stats.topNews.length === 0) && (
              <div className="text-center py-10 text-gray-500 text-sm">아직 게시된 뉴스가 없어요</div>
            )}
          </div>
        </section>

        {/* 빠른 링크 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">빠른 링크</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/news/create">
              <div className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 flex items-center gap-3 transition cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span className="text-sm font-medium">뉴스 작성</span>
              </div>
            </Link>
            <Link href="/admin/news">
              <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-4 flex items-center gap-3 transition cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                <span className="text-sm font-medium">뉴스 관리</span>
              </div>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}