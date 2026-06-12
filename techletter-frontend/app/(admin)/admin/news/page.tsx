'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminNavTabs from '@/components/admin/AdminNavTabs';

interface News {
  id: number;
  title: string;
  status: string;
  viewCount: number;
  homeMain: boolean;
  homeRecommended: boolean;
  homeUrgent: boolean;
  createdAt: string;
  author?: { nickname: string };
  category?: { name: string };
}

const statusLabel: Record<string, string> = {
  draft: '임시 저장',
  review: '검토 대기',
  approved: '승인',
  published: '게시',
  scheduled: '예약',
};

export default function AdminNewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<News[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const [meResponse, newsResponse] = await Promise.all([
        api.get('/users/me'),
        api.get('/news/admin', { params: { page, limit: 20 } }),
      ]);
      if (meResponse.data?.role !== 'admin') {
        router.replace('/mypage');
        return;
      }
      setNews(Array.isArray(newsResponse.data?.news) ? newsResponse.data.news : []);
      setTotal(Number(newsResponse.data?.total) || 0);
    } catch {
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [page, router]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const visibleNews = useMemo(
    () => filter === 'all' ? news : news.filter((item) => item.status === filter),
    [filter, news],
  );

  const updateNews = async (id: number, payload: Partial<News>) => {
    await api.put(`/news/${id}`, payload);
    setNews((items) => items.map((item) => item.id === id ? { ...item, ...payload } : item));
  };

  const removeNews = async (id: number) => {
    if (!window.confirm('이 기사를 삭제할까요?')) return;
    await api.delete(`/news/${id}`);
    await loadNews();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-400">Editorial operations</p>
            <h1 className="text-lg font-bold">기사 검수 및 편성</h1>
          </div>
          <Link href="/admin/news/create" className="bg-white px-4 py-2 text-sm font-semibold text-gray-950">새 기사 작성</Link>
        </div>
        <AdminNavTabs />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['전체 기사', total],
            ['검토 대기', news.filter((item) => item.status === 'review').length],
            ['게시 중', news.filter((item) => item.status === 'published').length],
            ['메인 노출', news.filter((item) => item.homeMain || item.homeRecommended || item.homeUrgent).length],
          ].map(([label, value]) => (
            <div key={String(label)} className="border border-gray-800 p-4">
              <strong className="text-2xl">{value}</strong>
              <p className="mt-1 text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {[['all', '전체'], ...Object.entries(statusLabel)].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-2 text-sm ${filter === value ? 'bg-white text-gray-950' : 'bg-gray-900 text-gray-400'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto border border-gray-800">
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-gray-900 text-left text-xs text-gray-500">
              <tr>
                <th className="px-4 py-3">기사</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">조회</th>
                <th className="px-4 py-3">홈 편성</th>
                <th className="px-4 py-3">작성일</th>
                <th className="px-4 py-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {visibleNews.map((item) => (
                <tr key={item.id} className="border-t border-gray-800">
                  <td className="max-w-sm px-4 py-4">
                    <Link href={`/news/${item.id}`} className="line-clamp-1 font-semibold hover:text-blue-400">{item.title}</Link>
                    <p className="mt-1 text-xs text-gray-500">{item.category?.name ?? '미분류'} · {item.author?.nickname ?? '작성자 없음'}</p>
                  </td>
                  <td className="px-4 py-4">
                    <select value={item.status} onChange={(event) => updateNews(item.id, { status: event.target.value })} className="border border-gray-700 bg-gray-950 px-2 py-1.5">
                      {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-4 tabular-nums text-gray-400">{item.viewCount.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-1">
                      {([
                        ['homeMain', '메인'],
                        ['homeRecommended', '추천'],
                        ['homeUrgent', '속보'],
                      ] as const).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => updateNews(item.id, { [key]: !item[key] })}
                          className={`border px-2 py-1 text-xs ${item[key] ? 'border-blue-500 bg-blue-600' : 'border-gray-700 text-gray-500'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString('ko-KR')}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-3">
                      <Link href={`/admin/news/${item.id}/edit`} className="text-blue-400">수정</Link>
                      <button onClick={() => removeNews(item.id)} className="text-red-400">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && visibleNews.length === 0 && <p className="py-16 text-center text-sm text-gray-500">조건에 맞는 기사가 없습니다.</p>}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage((current) => current - 1)} className="border border-gray-700 px-3 py-2 text-sm disabled:opacity-30">이전</button>
          <span className="text-sm text-gray-500">{page} / {Math.max(1, Math.ceil(total / 20))}</span>
          <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((current) => current + 1)} className="border border-gray-700 px-3 py-2 text-sm disabled:opacity-30">다음</button>
        </div>
      </main>
    </div>
  );
}
