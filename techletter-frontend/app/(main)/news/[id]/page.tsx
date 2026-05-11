'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';

interface News {
  id: number;
  title: string;
  content: string;
  thumbnailUrl: string | null;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  createdAt: string;
  author: { nickname: string };
}

interface Comment {
  id: number;
  content: string;
  likeCount: number;
  isBest: boolean;
  createdAt: string;
  user: { nickname: string };
}

const formatNumber = (value: number | undefined) => (value ?? 0).toLocaleString();

export default function NewsDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const viewedKey = `viewed_news_${id}`;
        const alreadyViewed = localStorage.getItem(viewedKey);

        const [newsRes, commentsRes] = await Promise.all([
          api.get(`/news/${id}`, {
            headers: alreadyViewed ? {} : { 'x-view-token': 'true' },
          }),
          api.get(`/news/${id}/comments`),
        ]);

        if (!alreadyViewed) localStorage.setItem(viewedKey, 'true');
        if (localStorage.getItem('accessToken')) {
          api.post(`/news/${id}/view-history`).catch(() => undefined);
        }

        setNews(newsRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await api.post(`/news/${id}/likes`);
      setLiked(res.data.liked);
      setNews((prev) => prev ? { ...prev, likeCount: res.data.likeCount ?? prev.likeCount } : prev);
    } catch {
      router.push('/login');
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await api.post(`/news/${id}/bookmarks`);
      setBookmarked(res.data.bookmarked);
    } catch {
      router.push('/login');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: news?.title, url: window.location.href });
      } else {
        await navigator.clipboard?.writeText(window.location.href);
        alert('링크가 복사되었습니다.');
      }
      const res = await api.post(`/news/${id}/share`);
      setNews((prev) => prev ? { ...prev, shareCount: res.data.shareCount ?? prev.shareCount } : prev);
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') console.error(error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/news/${id}/comments`, { content: commentText });
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
    } catch {
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center transition-colors duration-200">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="flex min-h-screen items-center justify-center transition-colors duration-200">
        <div className="text-gray-500 dark:text-gray-400">뉴스를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 transition-colors duration-200">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
          <button onClick={() => router.back()} className="text-gray-400 transition hover:text-white" aria-label="뒤로가기">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="flex-1 truncate text-sm font-medium">뉴스 상세</span>
          <button onClick={handleShare} aria-label="공유" className="text-gray-400 transition hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
        <div>
          <h1 className="mb-3 text-xl font-bold leading-tight">{news.title}</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
            <span>조회 {formatNumber(news.viewCount)}</span>
            <span>좋아요 {formatNumber(news.likeCount)}</span>
            <span>댓글 {formatNumber(comments.length)}</span>
            <span>공유 {formatNumber(news.shareCount)}</span>
            <span>{new Date(news.createdAt).toLocaleDateString('ko-KR')}</span>
            <span>{news.author?.nickname}</span>
          </div>
        </div>

        {getImageUrl(news.thumbnailUrl) ? (
          <img src={getImageUrl(news.thumbnailUrl)} alt={news.title} className="h-48 w-full rounded-xl object-cover" />
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-xl border border-gray-700 bg-gray-800 text-sm text-gray-500">
            대표 이미지 없음
          </div>
        )}

        <div
          className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-300"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        <div className="flex items-center justify-between border-y border-gray-800 py-3">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition ${liked ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#f87171' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              좋아요 {formatNumber(news.likeCount)}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              댓글 {formatNumber(comments.length)}
            </span>
            <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-gray-400 transition hover:text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              공유 {formatNumber(news.shareCount)}
            </button>
          </div>
          <button onClick={handleBookmark} className={`transition ${bookmarked ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`} aria-label="북마크">
            <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? '#60a5fa' : 'none'} stroke="currentColor" strokeWidth="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>

        <section>
          <h3 className="mb-4 text-sm font-bold">댓글 {formatNumber(comments.length)}개</h3>
          <div className="flex flex-col gap-0">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`border-b border-gray-800 py-4 ${comment.isBest ? 'mb-2 rounded-xl border-blue-800 bg-blue-950 px-3' : ''}`}
              >
                {comment.isBest && <div className="mb-2 text-xs font-medium text-blue-400">베스트 댓글</div>}
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-900 text-xs font-medium text-blue-300">
                    {comment.user?.nickname?.[0]}
                  </div>
                  <span className="text-xs font-medium text-gray-300">{comment.user?.nickname}</span>
                  <span className="text-xs text-gray-600">{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-300">{comment.content}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {formatNumber(comment.likeCount)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 남겨보세요..."
              className="flex-1 rounded-full bg-gray-800 px-4 py-2.5 text-sm text-gray-200 outline-none placeholder:text-gray-500 focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            />
            <button onClick={handleComment} className="shrink-0 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700">
              등록
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
