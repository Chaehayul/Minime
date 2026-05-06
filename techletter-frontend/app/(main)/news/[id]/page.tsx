'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface Comment {
  id: number;
  content: string;
  likeCount: number;
  isBest: boolean;
  createdAt: string;
  user: { nickname: string };
}

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

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await api.post(`/news/${id}/comments`, { content: commentText });
      setComments([...comments, res.data]);
      setCommentText('');
    } catch {
      router.push('/login');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-200">
      <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
    </div>
  );

  if (!news) return (
    <div className="min-h-screen flex items-center justify-center transition-colors duration-200">
      <div className="text-gray-500 dark:text-gray-400">뉴스를 찾을 수 없습니다.</div>
    </div>
  );

  return (
    <div className="min-h-screen transition-colors duration-200 pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span className="flex-1 text-sm font-medium truncate">뉴스 상세</span>
          <button onClick={() => navigator.share?.({ title: news.title, url: window.location.href })}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-5">
        {/* 제목 */}
        <div>
          <h1 className="text-xl font-bold leading-tight mb-2">{news.title}</h1>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>👁 {news.viewCount}</span>
            <span>{new Date(news.createdAt).toLocaleDateString('ko-KR')}</span>
            <span>{news.author?.nickname}</span>
          </div>
        </div>

        {/* 대표 이미지 */}
        {getImageUrl(news.thumbnailUrl) ? (
          <img src={getImageUrl(news.thumbnailUrl)} alt={news.title}
            className="w-full h-48 object-cover rounded-xl" />
        ) : (
          <div className="w-full h-48 bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 text-sm border border-gray-700">
            대표 이미지 없음
          </div>
        )}

        {/* 본문 */}
        <div className="text-sm text-gray-300 leading-relaxed prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: news.content }} />

        {/* 인터랙션 */}
        <div className="flex items-center justify-between py-3 border-y border-gray-800">
          <div className="flex gap-5">
            <button onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition ${liked ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? '#f87171' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              좋아요
            </button>
            <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              댓글 {comments.length}
            </button>
            <button onClick={() => navigator.share?.({ title: news.title, url: window.location.href })}
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              공유
            </button>
          </div>
          <button onClick={handleBookmark} className={`transition ${bookmarked ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={bookmarked ? '#60a5fa' : 'none'} stroke="currentColor" strokeWidth="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>

        {/* 댓글 */}
        <section>
          <h3 className="font-bold text-sm mb-4">댓글 {comments.length}개</h3>
          <div className="flex flex-col gap-0">
            {comments.map((comment) => (
              <div key={comment.id}
                className={`py-4 border-b border-gray-800 ${comment.isBest ? 'bg-blue-950 px-3 rounded-xl border-blue-800 mb-2' : ''}`}>
                {comment.isBest && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs text-blue-400 font-medium">⭐ 베스트</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center text-xs text-blue-300 font-medium">
                    {comment.user?.nickname?.[0]}
                  </div>
                  <span className="text-xs font-medium text-gray-300">{comment.user?.nickname}</span>
                  <span className="text-xs text-gray-600">{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {comment.likeCount}
                </div>
              </div>
            ))}
          </div>

          {/* 댓글 입력 */}
          <div className="flex gap-2 mt-4 items-center">
            <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
              placeholder="댓글을 남겨보세요..."
              className="flex-1 bg-gray-800 rounded-full px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
            />
            <button onClick={handleComment}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2.5 text-sm font-medium transition flex-shrink-0">
              등록
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}