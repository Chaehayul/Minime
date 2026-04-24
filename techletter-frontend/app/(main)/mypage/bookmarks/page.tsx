'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';

interface Bookmark {
  id: number;
  newsId: number;
  createdAt: string;
  news: {
    id: number;
    title: string;
    content: string;
    thumbnailUrl: string;
    viewCount: number;
  } | null;
}

export default function BookmarksPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await api.get('/users/me/bookmarks');
        setBookmarks(res.data);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (e: React.MouseEvent, newsId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/news/${newsId}/bookmarks`);
      setBookmarks(prev => prev.filter(b => b.newsId !== newsId));
    } catch {
      alert('북마크 해제 실패');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="font-bold text-base flex-1">저장한 뉴스</span>
          <span className="text-xs text-gray-500">{bookmarks.length}개</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <div key={i} className="bg-gray-800 rounded-xl h-24 animate-pulse" />)}
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="flex flex-col gap-0">
            {bookmarks.map((bookmark) => (
              <Link key={bookmark.id} href={`/news/${bookmark.newsId}`}>
                <div className="flex gap-3 py-4 border-b border-gray-800 hover:bg-gray-900 transition px-2 rounded-lg cursor-pointer relative">
                  {getImageUrl(bookmark.news?.thumbnailUrl) ? (
                    <img src={getImageUrl(bookmark.news?.thumbnailUrl)} alt=""
                      className="w-20 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="bg-gray-700 rounded-lg w-20 h-16 flex-shrink-0 flex items-center justify-center text-gray-500 text-xs">이미지 없음</div>
                  )}
                  <div className="flex-1 pr-8">
                    <p className="text-sm font-medium line-clamp-2 text-gray-100 mb-1">
                      {bookmark.news?.title || '제목 없음'}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {bookmark.news?.content?.replace(/<[^>]*>/g, '') || ''}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>👁 {bookmark.news?.viewCount || 0}</span>
                      <span>{new Date(bookmark.createdAt).toLocaleDateString('ko-KR')} 저장</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleRemoveBookmark(e, bookmark.newsId)}
                    className="absolute right-2 top-4 text-blue-400 hover:text-gray-400 transition"
                    title="북마크 해제"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#60a5fa" stroke="#60a5fa" strokeWidth="2">
                      <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                  </button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <p className="text-gray-500 text-sm">저장한 뉴스가 없어요</p>
            <Link href="/" className="text-blue-400 text-sm hover:underline">뉴스 보러가기</Link>
          </div>
        )}
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800">
        <div className="max-w-5xl mx-auto flex">
          <Link href="/" className="flex-1 flex flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-xs text-gray-500">홈</span>
          </Link>
          <Link href="/search" className="flex-1 flex flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span className="text-xs text-gray-500">탐색</span>
          </Link>
          <Link href="/mypage/bookmarks" className="flex-1 flex flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563EB"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <span className="text-xs text-blue-500">저장</span>
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