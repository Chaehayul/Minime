'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';

interface User {
  id: number;
  email: string;
  nickname: string;
  role: string;
}

type SubscriptionStatus = 'NONE' | 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PAYMENT_FAILED';

interface Subscription {
  status: SubscriptionStatus;
  planType: 'daily' | 'weekly' | 'all' | null;
  startDate: string | null;
  endDate: string | null;
  nextPaymentDate: string | null;
  paymentMethodLast4: string | null;
  paymentMethodBrand: string | null;
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

const planLabel: Record<string, string> = {
  daily: '데일리 플랜',
  weekly: '위클리 플랜',
  all: '올인원 플랜',
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

function SubscriptionSection({
  subscription,
  onUnsubscribe,
  onResubscribe,
}: {
  subscription: Subscription | null;
  onUnsubscribe: () => void;
  onResubscribe: () => void;
}) {
  const status = subscription?.status ?? 'NONE';

  if (status === 'NONE' || !subscription) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-500">아직 구독하지 않았어요</p>
        <Link href="/subscriptions/plans">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition">
            뉴스레터 구독하기
          </button>
        </Link>
      </div>
    );
  }

  if (status === 'ACTIVE') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          <span className="text-sm font-medium text-emerald-400">구독 중</span>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">플랜</span>
            <span className="text-sm font-medium text-white">
              {planLabel[subscription.planType ?? ''] ?? '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">이용 기간</span>
            <span className="text-sm text-gray-300">
              {formatDate(subscription.startDate)} ~ {formatDate(subscription.endDate)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">다음 결제일</span>
            <span className="text-sm text-gray-300">{formatDate(subscription.nextPaymentDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">결제 수단</span>
            <span className="text-sm text-gray-300">
              {subscription.paymentMethodBrand} ****{subscription.paymentMethodLast4}
            </span>
          </div>
        </div>
        <Link href="/mypage/payments" className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-400">결제 내역 보기</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
        <button onClick={onUnsubscribe} className="text-sm text-red-400 hover:text-red-300 transition text-left">
          구독 해지
        </button>
      </div>
    );
  }

  if (status === 'CANCELED') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
          <span className="text-sm font-medium text-yellow-400">해지 예약됨</span>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-sm text-yellow-300 font-medium mb-1">구독 해지됨</p>
          <p className="text-xs text-yellow-200/70">
            {formatDate(subscription.endDate)}까지 이용 가능해요.
            이후에는 자동으로 서비스가 종료됩니다.
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">플랜</span>
            <span className="text-sm text-gray-300">{planLabel[subscription.planType ?? ''] ?? '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-500">이용 종료일</span>
            <span className="text-sm text-gray-300">{formatDate(subscription.endDate)}</span>
          </div>
        </div>
        <Link href="/mypage/payments" className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-400">결제 내역 보기</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
        <button onClick={onResubscribe}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition">
          자동결제 재활성화
        </button>
      </div>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-500 inline-block" />
          <span className="text-sm font-medium text-gray-400">구독 만료</span>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <p className="text-sm text-gray-300 font-medium mb-1">이용 기간이 종료되었어요</p>
          <p className="text-xs text-gray-500">
            {formatDate(subscription.endDate)}에 구독이 만료되었습니다.
            다시 구독하시면 바로 이용 가능해요.
          </p>
        </div>
        <Link href="/subscriptions/plans">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition">
            다시 구독하기
          </button>
        </Link>
      </div>
    );
  }

  if (status === 'PAYMENT_FAILED') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          <span className="text-sm font-medium text-red-400">결제 실패</span>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-red-300 font-medium mb-1">자동결제에 실패했어요</p>
          <p className="text-xs text-red-200/70">
            등록된 카드({subscription.paymentMethodBrand} ****{subscription.paymentMethodLast4})로
            결제에 실패했습니다. 결제 수단을 변경하거나 카드 정보를 확인해주세요.
          </p>
        </div>
        <Link href="/subscriptions/payment-method">
          <button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-medium transition">
            결제 수단 변경하기
          </button>
        </Link>
        <Link href="/mypage/payments" className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-400">결제 내역 보기</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>
    );
  }

  return null;
}

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [stats, setStats] = useState<ActivityStats>({ bookmarks: 0, likes: 0, comments: 0 });
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode');
    if (savedDark === 'false') setDarkMode(false);

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
        setStats({ bookmarks: bookmarkList.length, likes: 0, comments: 0 });
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

  const handleUnsubscribe = async () => {
    if (!confirm('구독을 해지하시겠어요?\n남은 이용 기간 동안은 계속 이용 가능합니다.')) return;
    try {
      await api.delete('/subscriptions');
      setSubscription(prev => prev ? { ...prev, status: 'CANCELED' } : prev);
    } catch (err: any) {
      alert(err.response?.data?.message || '오류가 발생했습니다.');
    }
  };

  const handleResubscribe = async () => {
    try {
      await api.post('/subscriptions/reactivate');
      const res = await api.get('/subscriptions/me');
      setSubscription(res.data);
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

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', String(next));
    document.documentElement.classList.toggle('dark', next);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-500">로딩 중...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-base">마이페이지</span>
          <Link href="/mypage/settings">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* 프로필 */}
        <div className="pb-6 border-b border-gray-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-900 flex items-center justify-center text-xl font-bold text-blue-300">
              {user?.nickname?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-bold text-base">{user?.nickname}</div>
                {user?.role === 'admin' && (
                  <span className="text-xs px-2 py-0.5 bg-blue-900 text-blue-300 rounded-full">관리자</span>
                )}
              </div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>
            <button onClick={() => setEditMode(!editMode)}
              className="text-sm px-4 py-1.5 border border-gray-700 rounded-lg text-gray-400 hover:text-white transition">
              {editMode ? '취소' : '편집'}
            </button>
          </div>
          {editMode && (
            <div className="flex gap-2">
              <input type="text" value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="새 닉네임 입력"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="pb-6 border-b border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
              <span className="font-bold text-sm text-blue-400">관리자 메뉴</span>
            </div>
            <Link href="/admin/news/create" className="flex justify-between items-center py-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span className="text-sm text-gray-200">뉴스 작성</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link href="/admin/news" className="flex justify-between items-center py-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
                <span className="text-sm text-gray-200">뉴스 관리</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link href="/admin/stats" className="flex justify-between items-center py-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                <span className="text-sm text-gray-200">통계 대시보드</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            {/* ✅ 추가된 메뉴 */}
            <Link href="/admin/subscribers" className="flex justify-between items-center py-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span className="text-sm text-gray-200">구독자 관리</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
            <Link href="/admin/sends" className="flex justify-between items-center py-3">
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                <span className="text-sm text-gray-200">뉴스레터 발송 이력</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          </div>
        )}

        {/* 나의 활동 */}
        <div className="pb-6 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <span className="font-bold text-sm">나의 활동</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/mypage/bookmarks">
              <div className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 transition cursor-pointer">
                <div className="text-xl font-bold">{stats.bookmarks}</div>
                <div className="text-xs text-gray-500 mt-1">북마크</div>
              </div>
            </Link>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-xl font-bold">{stats.likes}</div>
              <div className="text-xs text-gray-500 mt-1">좋아요</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="text-xl font-bold">{stats.comments}</div>
              <div className="text-xs text-gray-500 mt-1">댓글</div>
            </div>
          </div>
        </div>

        {/* 저장한 뉴스 */}
        <div className="pb-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              <span className="font-bold text-sm">저장한 뉴스</span>
            </div>
            <Link href="/mypage/bookmarks" className="text-xs text-blue-400">전체보기</Link>
          </div>
          {bookmarks.length > 0 ? (
            <div className="flex flex-col gap-0">
              {bookmarks.map((bookmark) => (
                <Link key={bookmark.id} href={`/news/${bookmark.news?.id}`}>
                  <div className="flex gap-3 py-3 border-b border-gray-800 hover:bg-gray-900 transition px-1 rounded-lg">
                    {getImageUrl(bookmark.news?.thumbnailUrl) ? (
                      <img src={getImageUrl(bookmark.news?.thumbnailUrl)} alt=""
                        className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-700 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-500 text-xs">없음</div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2 text-gray-200">{bookmark.news?.title}</p>
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
        <div className="pb-6 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span className="font-bold text-sm">구독 설정</span>
          </div>
          <SubscriptionSection
            subscription={subscription}
            onUnsubscribe={handleUnsubscribe}
            onResubscribe={handleResubscribe}
          />
        </div>

        {/* 설정 */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              <span className="text-sm text-gray-200">알림 설정</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
          <div className="flex justify-between items-center py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
              <span className="text-sm text-gray-200">다크모드</span>
            </div>
            <button onClick={toggleDarkMode}
              className={`w-11 h-6 rounded-full flex items-center px-0.5 transition-all duration-200 ${darkMode ? 'bg-blue-600 justify-end' : 'bg-gray-700 justify-start'}`}>
              <div className="w-5 h-5 rounded-full bg-white" />
            </button>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-3 py-4">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span className="text-sm text-red-400">로그아웃</span>
          </button>
        </div>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            <span className="text-xs text-gray-500">저장</span>
          </Link>
          <Link href="/mypage" className="flex-1 flex flex-col items-center gap-1 py-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#2563EB"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span className="text-xs text-blue-500">마이</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}