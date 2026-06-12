'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import AdminNavTabs from '@/components/admin/AdminNavTabs';

interface NewsItem {
  id: number; title: string; status: string; viewCount: number;
  likeCount: number; createdAt: string; category?: { name?: string };
}

const statusLabel: Record<string, string> = {
  draft: '초안', review: '검토 요청', approved: '승인',
  published: '발행', scheduled: '예약 발행',
};

export default function ReporterNewsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/users/me'), api.get('/news/admin?mine=true&limit=100')])
      .then(([userResponse, newsResponse]) => {
        if (userResponse.data?.role !== 'reporter') {
          router.replace('/mypage');
          return;
        }
        setItems(Array.isArray(newsResponse.data?.news) ? newsResponse.data.news : []);
      })
      .catch(() => router.replace('/mypage'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 pb-28 dark:bg-gray-950">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div><h1 className="text-lg font-bold">내 기사</h1><p className="text-xs text-gray-500">작성한 기사와 검토 상태를 관리합니다.</p></div>
          <Link href="/reporter/news/create" className="bg-blue-600 px-4 py-2 text-sm font-semibold text-white">기사 작성</Link>
        </div>
        <AdminNavTabs />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {Object.entries(statusLabel).map(([status, label]) => (
            <div key={status} className="border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-950">
              <strong className="text-lg">{items.filter((item) => item.status === status).length}</strong>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
          {loading ? <div className="p-10 text-center text-sm text-gray-500">기사를 불러오는 중입니다.</div> : items.length ? (
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-gray-200 text-left text-xs text-gray-500 dark:border-gray-800">
                <tr><th className="px-4 py-3">기사</th><th>상태</th><th>조회</th><th>좋아요</th><th>작성일</th><th>관리</th></tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                    <td className="px-4 py-3"><strong className="block max-w-md truncate">{item.title}</strong><span className="text-xs text-gray-500">{item.category?.name || '미분류'}</span></td>
                    <td className="text-xs font-semibold text-blue-600">{statusLabel[item.status] || item.status}</td>
                    <td>{item.viewCount.toLocaleString()}</td>
                    <td>{item.likeCount.toLocaleString()}</td>
                    <td className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td><Link href={`/reporter/news/${item.id}/edit`} className="text-xs font-semibold text-blue-600">편집</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="p-10 text-center text-sm text-gray-500">작성한 기사가 없습니다.</div>}
        </div>
      </main>
    </div>
  );
}
