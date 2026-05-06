'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import api, { getImageUrl } from '@/lib/api';
// 실제 파일 경로에 맞게 필요시 수정하세요
import { useUserReport } from '@/hooks/useUserReport';

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
  news: { id: number; title: string; thumbnailUrl: string };
}

const CATEGORY_EMOJI: Record<string, string> = {
  'ai-ml': '🤖', 'web-dev': '🌐', cloud: '☁️',
  'open-source': '📦', security: '🔐', startup: '🚀', trend: '📈',
};

// 통계 카드 한 개
function StatCard({
  value, label, pct,
}: { value: number; label: string; pct: number }) {
  return (
    // 배경을 부드러운 다크그레이(#1E1E1E)로 변경
    <div className="flex flex-col gap-2 bg-white dark:bg-[#1E1E1E] rounded-2xl p-4 border border-gray-100 dark:border-[#2E2E2E]">
      <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white leading-none">
        {value.toLocaleString()}
      </span>
      <span className="text-[11px] text-gray-400 dark:text-gray-400">{label}</span>
      {/* 미니 진행 바 */}
      <div className="h-[3px] rounded-full bg-gray-100 dark:bg-[#2A2A2A] overflow-hidden">
        <div
          className="h-full rounded-full bg-gray-900 dark:bg-white transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// 토글 스위치 (버튼 튀어 나가는 현상 완벽 수정)
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
        on ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-[#333333]'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-[#121212] transition duration-200 ease-in-out shadow-sm ${
          on ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function MyPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const { report } = useUserReport();

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const [userRes, subRes, bookmarkRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/subscriptions/me').catch(() => ({ data: null })),
          api.get('/users/me/bookmarks').catch(() => ({ data: [] })),
        ]);
        setUser(userRes.data);
        setSubscription(subRes.data);
        setBookmarks((bookmarkRes.data ?? []).slice(0, 3));
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

  const handleToggleSubscription = async (type: 'dailyActive' | 'weeklyActive') => {
    if (!subscription) return;

    // 1. 서버 응답을 기다리지 않고 UI(스위치)를 먼저 즉각적으로 변경
    const prevValue = subscription[type];
    setSubscription({ ...subscription, [type]: !prevValue });

    try {
      // 2. 백엔드 API에 변경된 설정값 전송 (API 엔드포인트는 진현님의 백엔드 설정에 맞게 PATCH나 PUT으로 맞춰주세요)
      await api.patch('/subscriptions/me', { [type]: !prevValue });
    } catch (err: any) {
      // 3. 서버 오류 시 원래 상태로 롤백
      setSubscription({ ...subscription, [type]: prevValue });
      alert(err.response?.data?.message || '설정 변경에 실패했습니다.');
    }
  };

  const handleEditNickname = async () => {
    if (!newNickname.trim() || newNickname === user?.nickname) return;
    setEditLoading(true);
    try {
      await api.put('/users/me', { nickname: newNickname });
      setUser((u) => (u ? { ...u, nickname: newNickname } : u));
      setEditMode(false);
    } catch (err: any) {
      alert(err.response?.data?.message || '변경 실패');
    } finally {
      setEditLoading(false);
    }
  };

  const isDark = mounted && theme === 'dark';

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#121212]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#2A2A2A] animate-pulse" />
          <div className="h-3 w-24 rounded bg-gray-100 dark:bg-[#2A2A2A] animate-pulse" />
        </div>
      </div>
    );
  }

  const readCount = report?.monthlyReadCount ?? 0;
  const bookmarkCount = report?.bookmarkCount ?? 0;
  const likeCount = report?.likeCount ?? 0;
  const maxVal = Math.max(readCount, bookmarkCount, likeCount, 1);

  return (
    // 전체 배경을 부드러운 다크그레이(#121212)로 변경
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] transition-colors">

      {/* ── 헤더 ── */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md border-b border-gray-100 dark:border-[#2E2E2E] transition-colors">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-center">
          <span className="font-semibold text-base text-gray-900 dark:text-white">마이페이지</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-5 flex flex-col gap-4 pb-32">

        {/* ── 1. 프로필 카드 ── */}
        <section className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-[#2E2E2E] overflow-hidden">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-900 dark:bg-white flex items-center justify-center
                              text-white dark:text-gray-900 text-xl font-bold flex-shrink-0">
                {user?.nickname?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-base text-gray-900 dark:text-white truncate">
                    {user?.nickname}
                  </span>
                  {user?.role === 'admin' && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-[#2A2A2A]
                                     text-blue-600 dark:text-blue-400 rounded-md font-semibold">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
              </div>
              <button
                onClick={() => setEditMode((v) => !v)}
                className="text-xs text-gray-500 dark:text-gray-300 border border-gray-200 dark:border-[#3A3A3A]
                           rounded-lg px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition flex-shrink-0 whitespace-nowrap"
              >
                {editMode ? '닫기' : '편집'}
              </button>
            </div>

            {editMode && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[#2E2E2E] flex flex-col gap-3">
                <div>
                  <label className="text-xs text-gray-400 dark:text-gray-400 mb-1.5 block">닉네임 변경</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="flex-1 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-[#3A3A3A]
                                 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white outline-none
                                 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition min-w-0"
                    />
                    {/* 저장 버튼에 튀어 나감 방지용 flex-shrink-0 및 whitespace-nowrap 추가 */}
                    <button
                      onClick={handleEditNickname}
                      disabled={editLoading || newNickname === user?.nickname || !newNickname.trim()}
                      className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900
                                 text-sm rounded-xl font-medium disabled:opacity-40 transition whitespace-nowrap flex-shrink-0"
                    >
                      {editLoading ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 px-5 pb-5">
            <StatCard value={readCount}     label="이번 달 읽은 뉴스" pct={(readCount / maxVal) * 100} />
            <StatCard value={bookmarkCount} label="북마크"            pct={(bookmarkCount / maxVal) * 100} />
            <StatCard value={likeCount}     label="좋아요"            pct={(likeCount / maxVal) * 100} />
            <StatCard value={0}             label="작성 댓글"         pct={0} />
          </div>

          {report && report.topCategories.length > 0 && (
            <div className="px-5 pb-5 border-t border-gray-50 dark:border-[#2E2E2E] pt-4">
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2">많이 읽는 카테고리</p>
              <div className="flex flex-wrap gap-1.5">
                {report.topCategories.map((item, i) => (
                  <Link
                    key={item.category.id}
                    href={`/category/${item.category.slug}`}
                    className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition
                      ${i === 0
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white font-medium'
                        : 'bg-white dark:bg-[#121212] text-gray-600 dark:text-gray-300 border-gray-200 dark:border-[#3A3A3A] hover:border-gray-400'
                      }`}
                  >
                    <span>{CATEGORY_EMOJI[item.category.slug] ?? '📰'}</span>
                    {item.category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── 2. 관리자 퀵메뉴 ── */}
        {user?.role === 'admin' && (
          <section className="bg-blue-50 dark:bg-[#1E2530] rounded-2xl border border-blue-100
                               dark:border-blue-900/40 p-4">
            <p className="text-[11px] font-semibold text-blue-500 dark:text-blue-400 mb-3">관리자</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { href: '/admin/news/create', icon: '✏️', label: '뉴스 작성' },
                { href: '/admin/news',        icon: '📋', label: '뉴스 관리' },
                { href: '/admin/stats',       icon: '📊', label: '통계 분석' },
              ].map(({ href, icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-1.5 py-3 bg-white dark:bg-[#2A2A2A]
                             rounded-xl text-blue-600 dark:text-blue-300 hover:shadow-sm transition"
                >
                  <span className="text-lg">{icon}</span>
                  <span className="text-[11px] font-medium">{label}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── 3. 최근 북마크 ── */}
        <section className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100 dark:border-[#2E2E2E] p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">최근 저장한 뉴스</h3>
            <Link href="/mypage/bookmarks"
              className="text-xs text-blue-500 hover:text-blue-400 transition">
              전체보기
            </Link>
          </div>

          {bookmarks.length > 0 ? (
            <div className="flex flex-col divide-y divide-gray-50 dark:divide-[#2E2E2E]">
              {bookmarks.map((bm) => (
                <Link key={bm.id} href={`/news/${bm.news?.id}`}
                  className="group flex gap-3 items-center py-3 first:pt-0 last:pb-0">
                  <div className="w-16 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-[#2A2A2A] relative">
                    {getImageUrl(bm.news?.thumbnailUrl)
                      ? <Image src={getImageUrl(bm.news?.thumbnailUrl)} alt=""
                          fill className="object-cover group-hover:scale-105 transition-transform" />
                      : <div className="w-full h-full bg-gray-200 dark:bg-[#3A3A3A]" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug
                                  group-hover:text-blue-500 transition-colors">
                      {bm.news?.title}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(bm.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400 dark:text-gray-500
                            bg-gray-50 dark:bg-[#121212] rounded-xl border border-dashed
                            border-gray-200 dark:border-[#3A3A3A]">
              아직 저장한 뉴스가 없어요 📌
            </div>
          )}
        </section>

        {/* ── 4. 환경설정 ── */}
        <section className="bg-white dark:bg-[#1E1E1E] rounded-2xl border border-gray-100
                             dark:border-[#2E2E2E] overflow-hidden">

          {/* 뉴스레터 */}
          <div className="p-5 border-b border-gray-50 dark:border-[#2E2E2E]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">뉴스레터 구독</span>
              {subscription && (
                <button onClick={handleUnsubscribe}
                  className="text-[11px] text-gray-400 hover:text-red-500 transition">
                  해지
                </button>
              )}
            </div>
            {subscription ? (
              <div className="flex flex-col gap-3 mt-3">
                {[
                  { label: '데일리 브리핑', sub: '매일 오전 8시', type: 'dailyActive' as const, active: subscription.dailyActive },
                  { label: '위클리 딥다이브', sub: '매주 월요일', type: 'weeklyActive' as const, active: subscription.weeklyActive },
                ].map(({ label, sub, type, active }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-800 dark:text-gray-100">{label}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">{sub}</p>
                    </div>
                    {/* 빈 함수 대신 위에서 만든 함수를 연결! */}
                    <Toggle on={active} onToggle={() => handleToggleSubscription(type)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-xs text-gray-400 dark:text-gray-400 mb-3">
                  최신 IT 트렌드를 메일로 받아보세요!
                </p>
                <button onClick={handleSubscribe}
                  className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900
                             rounded-xl text-sm font-semibold hover:opacity-90 transition">
                  무료로 구독하기
                </button>
              </div>
            )}
          </div>

          {/* 메뉴 아이템들 */}
          {[
            {
              icon: '🔔',
              label: '푸시 알림',
              type: 'link' as const,
              href: '/mypage/notifications',
            },
            {
              icon: isDark ? '☀️' : '🌙',
              label: '다크 모드',
              type: 'toggle' as const,
              on: isDark,
              onToggle: () => setTheme(isDark ? 'light' : 'dark'),
            },
            {
              icon: '🔒',
              label: '비밀번호 변경',
              type: 'link' as const,
              href: '/mypage/settings',
            },
          ].map((item) => (
            item.type === 'link' ? (
              <Link key={item.label} href={item.href!}
                className="flex items-center gap-3 px-5 py-4 border-b border-gray-50
                           dark:border-[#2E2E2E] hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition">
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">{item.label}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  className="text-gray-300 dark:text-gray-500" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ) : (
              <div key={item.label}
                className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-[#2E2E2E]">
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span className="flex-1 text-sm text-gray-800 dark:text-gray-100">{item.label}</span>
                <Toggle on={item.on!} onToggle={item.onToggle!} />
              </div>
            )
          ))}

          {/* 로그아웃 */}
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4
                       hover:bg-red-50 dark:hover:bg-red-950/30 transition group rounded-b-2xl">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              className="text-red-400 dark:text-red-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-sm text-red-500">로그아웃</span>
          </button>
        </section>

      </main>
    </div>
  );
}