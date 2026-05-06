'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface News {
  id: number;
  title: string;
  status: string;
  viewCount: number;
  createdAt: string;
  author: { nickname: string };
  category?: { name: string };
}

export default function AdminNewsPage() {
  const router = useRouter();
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const statusLabel: Record<string, { label: string; color: string }> = {
    draft: { label: '임시저장', color: 'text-gray-400' },
    review: { label: '검토중', color: 'text-yellow-400' },
    approved: { label: '승인됨', color: 'text-green-400' },
    published: { label: '게시됨', color: 'text-blue-400' },
    scheduled: { label: '예약됨', color: 'text-purple-400' },
  };

  useEffect(() => {
    fetchNews();
  }, [page]);

  const fetchNews = async () => {
    try {
      const res = await api.get(`/news/admin?page=${page}&limit=20`);
      setNewsList(res.data.news);
      setTotal(res.data.total);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠어요?')) return;
    try {
      await api.delete(`/news/${id}`);
      fetchNews();
    } catch {
      alert('삭제 실패');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await api.put(`/news/${id}`, { status });
      fetchNews();
    } catch {
      alert('상태 변경 실패');
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-200 pb-10">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/mypage')} className="text-gray-400 hover:text-white transition">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="font-bold text-base">뉴스 관리</span>
            <span className="text-xs text-gray-500">총 {total}개</span>
          </div>
          <Link href="/admin/news/create"
            className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
            + 새 뉴스
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-gray-800 rounded-xl h-16 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left py-3 px-2">제목</th>
                    <th className="text-left py-3 px-2 w-20">카테고리</th>
                    <th className="text-left py-3 px-2 w-20">상태</th>
                    <th className="text-left py-3 px-2 w-16">조회수</th>
                    <th className="text-left py-3 px-2 w-28">작성일</th>
                    <th className="text-left py-3 px-2 w-32">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {newsList.map((news) => (
                    <tr key={news.id} className="border-b border-gray-800 hover:bg-gray-900 transition">
                      <td className="py-3 px-2">
                        <Link href={`/news/${news.id}`} className="hover:text-blue-400 transition line-clamp-1">
                          {news.title}
                        </Link>
                        <div className="text-xs text-gray-500 mt-0.5">{news.author?.nickname}</div>
                      </td>
                      <td className="py-3 px-2 text-gray-400 text-xs">
                        {news.category?.name || '-'}
                      </td>
                      <td className="py-3 px-2">
                        <select
                          value={news.status}
                          onChange={(e) => handleStatusChange(news.id, e.target.value)}
                          className={`bg-transparent text-xs outline-none cursor-pointer ${statusLabel[news.status]?.color || 'text-gray-400'}`}
                        >
                          {Object.entries(statusLabel).map(([value, { label }]) => (
                            <option key={value} value={value} className="bg-gray-800 text-white">{label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-2 text-gray-400 text-xs">
                        {news.viewCount.toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-gray-500 text-xs">
                        {new Date(news.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/news/${news.id}/edit`}
                            className="text-xs text-blue-400 hover:text-blue-300 transition">
                            수정
                          </Link>
                          <button
                            onClick={() => handleDelete(news.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition">
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-30 transition"
              >이전</button>
              <span className="text-xs text-gray-500">{page} / {Math.ceil(total / 20)}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg disabled:opacity-30 transition"
              >다음</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}