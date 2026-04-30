'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from 'next-themes'; // ✅ 1. next-themes 불러오기
import api, { getImageUrl } from '@/lib/api';

interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
}

interface Subscription {
  dailyActive: boolean;
  weeklyActive: boolean;
  dailySendTime: string;
}

interface Bookmark {
  id: number;
  createdAt: string;
  news: {
    id: number;
    title: string;
    thumbnailUrl: string;
  };
}

interface ActivityStats {
  bookmarks: number;
  likes: number;
  comments: number;
}

export default function MyPage() {
  const router = useRouter();
  
  // ✅ 2. 테마 훅 사용
  const { theme, setTheme } = useTheme();
  // hydration error 방지를 위해 mounted 상태 확인
  const [mounted, setMounted] = useState(false);
  
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [stats, setStats] = useState<ActivityStats>({ bookmarks: 0, likes: 0, comments: 0 });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    setMounted(true); // 마운트 완료 확인
    
    const fetchData = async () => {
      try {
        const [userRes, subRes, bookmarkRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/subscriptions/me').catch(() => ({ data: null })),
          api.get('/users/me/bookmarks').catch(() => ({ data: [] })),
        ]);
        setUser(userRes.data);
        setSubscription(subRes.data);
        const bookmarkList = bookmarkRes.data || [];
        setBookmarks(bookmarkList.slice(0, 3));
        setStats({
          bookmarks: bookmarkList.length,
          likes: 0,
          comments: 0,
        });
        setNewNickname(userRes.data.nickname);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  const handleSubscribe = async () => {
    try {
      await api.post('/subscriptions');
      const res = await api.get('/subscriptions/me');
      setSubscription(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await api.delete('/subscriptions');
      setSubscription(null);
    } catch (err: any) {
      alert(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  const handleEditNickname = async () => {
    if (!newNickname.trim()) return;
    setEditLoading(true);
    try {
      await api.put('/users/me', { nickname: newNickname });
      setUser(u => u ? { ...u, nickname: newNickname } : u);
      setEditMode(false);
      alert('닉네임이 변경되었습니다!');
    } catch (err: any) {
      alert(err.response?.data?.message || '변경 실패');
    } finally {
      setEditLoading(false);
    }
  };

  // ✅ 3. 다크모드 토글 함수
  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (loading || !mounted) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="text-gray-500">로딩 중...</div>
    </div>
  );

  const isDark = theme === 'dark';

  return (
    // ✅ 4. 배경, 텍스트, 테두리 색상에 다크모드 대응(dark: 클래스) 추가
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white pb-24 transition-colors duration-200">
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-base">마이페이지</span>
          <Link href="/mypage/settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* 프로필 */}
        <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-300">
              {user?.nickname?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-bold text-base">{user?.nickname}</div>
                {user?.role === 'admin' && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">관리자</span>
                )}
              </div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
            <button onClick={() => setEditMode(!editMode)}
              className="text-sm px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
              {editMode ? '취소' : '편집'}
            </button>
          </div>
          {editMode && (
            <div className="flex gap-2">
              <input type="text" value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="새 닉네임 입력"
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleEditNickname} disabled={editLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition disabled:opacity-50">
                {editLoading ? '저장 중...' : '저장'}
              </button>
            </div>
          )}
        </div>

        {/* 관리자 메뉴 */}
        {user?.role === 'admin' && (
          <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
              <span className="font-bold text-sm text-blue-500 dark:text-blue-400">관리자 메뉴</span>
            </div>
            <Link href="/admin/news/create" className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 px-2 -mx-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span className="text-sm text-gray-700 dark:text-gray-200">뉴스 작성</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link href="/admin/news" className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 px-2 -mx-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                <span className="text-sm text-gray-700 dark:text-gray-200">뉴스 관리</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link href="/admin/stats" className="flex justify-between items-center py-3 hover:bg-gray-50 dark:hover:bg-gray-900 px-2 -mx-2 rounded-lg transition">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                <span className="text-sm text-gray-700 dark:text-gray-200">통계 대시보드</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        )}

        {/* 나의 활동 */}
        <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span className="font-bold text-sm">나의 활동</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/mypage/bookmarks">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-transparent rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer">
                <div className="text-xl font-bold">{stats.bookmarks}</div>
                <div className="text-xs text-gray-500 mt-1">북마크</div>
              </div>
            </Link>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-transparent rounded-xl p-4">
              <div className="text-xl font-bold">{stats.likes}</div>
              <div className="text-xs text-gray-500 mt-1">좋아요</div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-transparent rounded-xl p-4">
              <div className="text-xl font-bold">{stats.comments}</div>
              <div className="text-xs text-gray-500 mt-1">댓글</div>
            </div>
          </div>
        </div>

        {/* 저장한 뉴스 */}
        <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              <span className="font-bold text-sm">저장한 뉴스</span>
            </div>
            <Link href="/mypage/bookmarks" className="text-xs text-blue-500 dark:text-blue-400 hover:underline">전체보기</Link>
          </div>
          {bookmarks.length > 0 ? (
            <div className="flex flex-col gap-0">
              {bookmarks.map((bookmark) => (
                <Link key={bookmark.id} href={`/news/${bookmark.news?.id}`}>
                  <div className="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition px-2 -mx-2 rounded-lg">
                    {getImageUrl(bookmark.news?.thumbnailUrl) ? (
                      <img src={getImageUrl(bookmark.news?.thumbnailUrl)} alt=""
                        className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">없음</div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2 text-gray-900 dark:text-gray-200">{bookmark.news?.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(bookmark.createdAt).toLocaleDateString('ko-KR')}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">저장한 뉴스가 없어요</p>
          )}
        </div>

        {/* 구독 설정 */}
        <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span className="font-bold text-sm">구독 설정</span>
          </div>
          {subscription ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-900 dark:text-gray-200">데일리 뉴스레터</div>
                  <div className="text-xs text-gray-500">매일 오전 수신 중</div>
                </div>
                <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition ${subscription.dailyActive ? 'bg-blue-600 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'}`}>
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-900 dark:text-gray-200">주간 뉴스레터</div>
                  <div className="text-xs text-gray-500">매주 월요일 수신 중</div>
                </div>
                <div className={`w-11 h-6 rounded-full flex items-center px-0.5 transition ${subscription.weeklyActive ? 'bg-blue-600 justify-end' : 'bg-gray-300 dark:bg-gray-700 justify-start'}`}>
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <button onClick={handleUnsubscribe} className="mt-2 text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition text-left">
                구독 해지
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">아직 구독하지 않았어요</p>
              <button onClick={handleSubscribe}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition shadow-sm">
                뉴스레터 구독하기
              </button>
            </div>
          )}
        </div>

        {/* 설정 */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="text-sm text-gray-700 dark:text-gray-200">알림 설정</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-400" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
              <span className="text-sm text-gray-700 dark:text-gray-200">다크모드</span>
            </div>
            {/* ✅ 5. 다크모드 버튼 */}
            <button onClick={toggleDarkMode}
              className={`w-11 h-6 rounded-full flex items-center px-0.5 transition ${isDark ? 'bg-blue-600 justify-end' : 'bg-gray-300 justify-start'}`}>
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </button>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 px-2 -mx-2 rounded-lg transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500 dark:text-red-400" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="text-sm text-red-500 dark:text-red-400">로그아웃</span>
          </button>
        </div>
      </main>

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-5xl mx-auto flex">
          <Link href="/" className="flex-1 flex flex-col items-center gap-1 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="2"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            <span className="text-xs text-gray-500">홈</span>
          </Link>
          <Link href="/search" className="flex-1 flex flex-col items-center gap-1 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span className="text-xs text-gray-500">탐색</span>
          </Link>
          <Link href="/mypage/bookmarks" className="flex-1 flex flex-col items-center gap-1 py-3 hover:bg-gray-50 dark:hover:bg-gray-900 transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-gray-500" strokeWidth="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <span className="text-xs text-gray-500">저장</span>
          </Link>
          <Link href="/mypage" className="flex-1 flex flex-col items-center gap-1 py-3 bg-blue-50/50 dark:bg-blue-900/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600 dark:text-blue-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-500">마이</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}