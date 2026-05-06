'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'PAYMENT_FAILED';

interface Subscriber {
  id: number;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
  status: SubscriptionStatus;
  planType: 'daily' | 'weekly' | 'all' | null;
  startDate: string | null;
  endDate: string | null;
  canceledAt: string | null;
  nextPaymentDate: string | null;
  paymentMethodBrand: string | null;
  paymentMethodLast4: string | null;
  dailyActive: boolean;
  weeklyActive: boolean;
  failReason: string | null;
  failedAt: string | null;
  createdAt: string;
}

const statusConfig: Record<SubscriptionStatus, { label: string; color: string; bg: string }> = {
  ACTIVE:         { label: '구독 중',   color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  CANCELED:       { label: '해지 예약', color: 'text-yellow-400',  bg: 'bg-yellow-500/10' },
  EXPIRED:        { label: '만료',      color: 'text-gray-400',    bg: 'bg-gray-500/10' },
  PAYMENT_FAILED: { label: '결제 실패', color: 'text-red-400',     bg: 'bg-red-500/10' },
};

const planLabel: Record<string, string> = {
  daily:  '데일리',
  weekly: '위클리',
  all:    '올인원',
};

const planColor: Record<string, string> = {
  daily:  'text-blue-400',
  weekly: 'text-purple-400',
  all:    'text-emerald-400',
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

type QuickFilter = 'ALL' | 'EXPIRING_SOON' | 'PAYMENT_SOON' | 'NEW_30DAYS';

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | 'ALL'>('ALL');
  const [filterPlan, setFilterPlan] = useState<string>('ALL');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sendingMailId, setSendingMailId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        // ✅ 실제 API 연동
        const res = await api.get('/subscriptions/admin/all');
        setSubscribers(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || '구독자 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  const applyQuickFilter = (sub: Subscriber): boolean => {
    const today = new Date();
    const endDate = sub.endDate ? new Date(sub.endDate) : null;
    const nextPayment = sub.nextPaymentDate ? new Date(sub.nextPaymentDate) : null;
    const createdAt = new Date(sub.createdAt);

    switch (quickFilter) {
      case 'EXPIRING_SOON':
        if (!endDate) return false;
        const diffExpire = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diffExpire >= 0 && diffExpire <= 7;
      case 'PAYMENT_SOON':
        if (!nextPayment) return false;
        const diffPayment = (nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diffPayment >= 0 && diffPayment <= 7;
      case 'NEW_30DAYS':
        const diffCreated = (today.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return diffCreated <= 30;
      default:
        return true;
    }
  };

  const filtered = subscribers.filter(s => {
    const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
    const matchPlan = filterPlan === 'ALL' || s.planType === filterPlan;
    const matchSearch = s.user.email.includes(search) || s.user.nickname.includes(search);
    const matchQuick = applyQuickFilter(s);
    return matchStatus && matchPlan && matchSearch && matchQuick;
  });

  const stats = {
    total:    subscribers.length,
    active:   subscribers.filter(s => s.status === 'ACTIVE').length,
    canceled: subscribers.filter(s => s.status === 'CANCELED').length,
    failed:   subscribers.filter(s => s.status === 'PAYMENT_FAILED').length,
  };

  const planStats = {
    daily:  subscribers.filter(s => s.planType === 'daily').length,
    weekly: subscribers.filter(s => s.planType === 'weekly').length,
    all:    subscribers.filter(s => s.planType === 'all').length,
  };
  const totalPlanCount = planStats.daily + planStats.weekly + planStats.all || 1;

  const handleResendFailMail = async (subId: number, email: string) => {
    if (!confirm(`${email}에게 결제수단 변경 안내 메일을 재발송할까요?`)) return;
    setSendingMailId(subId);
    try {
      // ✅ 백엔드 연동 시 주석 해제
      // await api.post(`/subscriptions/${subId}/resend-fail-mail`);
      await new Promise(r => setTimeout(r, 800));
      alert('안내 메일이 발송되었습니다!');
    } catch (err: any) {
      alert(err.response?.data?.message || '발송 실패');
    } finally {
      setSendingMailId(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-gray-500">로딩 중...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-10">
      <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-3">
            <Link href="/mypage">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="font-bold text-base">구독자 관리</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* 에러 메시지 */}
        {error && (
          <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* 요약 통계 */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: '전체 구독자', value: stats.total,    color: 'text-white' },
            { label: '구독 중',     value: stats.active,   color: 'text-emerald-400' },
            { label: '해지 예약',   value: stats.canceled, color: 'text-yellow-400' },
            { label: '결제 실패',   value: stats.failed,   color: 'text-red-400' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-900 rounded-xl p-4">
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-gray-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* 플랜별 통계 */}
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="text-xs text-gray-500 font-medium mb-3">플랜별 구독자 분포</div>
          <div className="flex gap-4 mb-3">
            {[
              { label: '데일리', value: planStats.daily,  color: 'bg-blue-500',    text: 'text-blue-400' },
              { label: '위클리', value: planStats.weekly, color: 'bg-purple-500',  text: 'text-purple-400' },
              { label: '올인원', value: planStats.all,    color: 'bg-emerald-500', text: 'text-emerald-400' },
            ].map((item) => (
              <div key={item.label} className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-medium ${item.text}`}>{item.label}</span>
                  <span className="text-xs text-gray-400">{item.value}명 ({Math.round(item.value / totalPlanCount * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${item.color}`}
                    style={{ width: `${Math.round(item.value / totalPlanCount * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 퀵 필터 */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'ALL',           label: '전체' },
            { key: 'EXPIRING_SOON', label: '이번 주 만료 예정' },
            { key: 'PAYMENT_SOON',  label: '이번 주 결제 예정' },
            { key: 'NEW_30DAYS',    label: '최근 30일 신규' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setQuickFilter(item.key as QuickFilter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                quickFilter === item.key
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 검색 + 필터 */}
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이메일 또는 닉네임 검색"
            className="flex-1 min-w-48 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="ALL">전체 상태</option>
            <option value="ACTIVE">구독 중</option>
            <option value="CANCELED">해지 예약</option>
            <option value="EXPIRED">만료</option>
            <option value="PAYMENT_FAILED">결제 실패</option>
          </select>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="ALL">전체 플랜</option>
            <option value="daily">데일리</option>
            <option value="weekly">위클리</option>
            <option value="all">올인원</option>
          </select>
        </div>

        {/* 구독자 목록 */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 gap-4 px-4 py-3 border-b border-gray-800 text-xs text-gray-500 font-medium">
            <div className="col-span-2">사용자</div>
            <div>상태 / 플랜</div>
            <div>이용 기간</div>
            <div>다음 결제일</div>
            <div>결제 수단</div>
            <div>수신 설정</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500 text-sm">
              구독자가 없어요
            </div>
          ) : (
            filtered.map((sub) => {
              const config = statusConfig[sub.status];
              const isExpanded = expandedId === sub.id;

              return (
                <div key={sub.id} className="border-b border-gray-800 last:border-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                    className="w-full grid grid-cols-7 gap-4 px-4 py-4 hover:bg-gray-800/50 transition items-center text-left"
                  >
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-white">{sub.user.nickname}</div>
                      <div className="text-xs text-gray-500">{sub.user.email}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${config.color} ${config.bg}`}>
                        {config.label}
                      </span>
                      {sub.planType && (
                        <span className={`text-xs font-medium ${planColor[sub.planType]}`}>
                          {planLabel[sub.planType]}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(sub.startDate)} ~<br />{formatDate(sub.endDate)}
                    </div>
                    <div className="text-sm text-gray-300">
                      {formatDate(sub.nextPaymentDate)}
                    </div>
                    <div className="text-sm text-gray-300">
                      {sub.paymentMethodBrand && sub.paymentMethodLast4
                        ? `${sub.paymentMethodBrand} ****${sub.paymentMethodLast4}`
                        : '-'}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs ${sub.dailyActive ? 'text-blue-400' : 'text-gray-600'}`}>
                        {sub.dailyActive ? '● 데일리' : '○ 데일리'}
                      </span>
                      <span className={`text-xs ${sub.weeklyActive ? 'text-purple-400' : 'text-gray-600'}`}>
                        {sub.weeklyActive ? '● 위클리' : '○ 위클리'}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-3 bg-gray-800/30 border-t border-gray-800">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-2">
                          <div className="text-xs text-gray-500 font-medium mb-1">구독 상세</div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">구독 시작일</span>
                            <span className="text-xs text-gray-300">{formatDate(sub.startDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">이용 종료일</span>
                            <span className="text-xs text-gray-300">{formatDate(sub.endDate)}</span>
                          </div>
                          {sub.canceledAt && (
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-500">해지 신청일</span>
                              <span className="text-xs text-yellow-400">{formatDate(sub.canceledAt)}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">다음 결제일</span>
                            <span className="text-xs text-gray-300">{formatDate(sub.nextPaymentDate)}</span>
                          </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-4 flex flex-col gap-2">
                          <div className="text-xs text-gray-500 font-medium mb-1">결제 정보</div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">결제 수단</span>
                            <span className="text-xs text-gray-300">
                              {sub.paymentMethodBrand} ****{sub.paymentMethodLast4}
                            </span>
                          </div>
                          {sub.status === 'PAYMENT_FAILED' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-500">실패 사유</span>
                                <span className="text-xs text-red-400">{sub.failReason ?? '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-500">실패 시각</span>
                                <span className="text-xs text-red-400">{formatDate(sub.failedAt)}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">데일리 수신</span>
                            <span className={`text-xs font-medium ${sub.dailyActive ? 'text-blue-400' : 'text-gray-500'}`}>
                              {sub.dailyActive ? '수신 중' : '꺼짐'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-gray-500">위클리 수신</span>
                            <span className={`text-xs font-medium ${sub.weeklyActive ? 'text-purple-400' : 'text-gray-500'}`}>
                              {sub.weeklyActive ? '수신 중' : '꺼짐'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {sub.status === 'PAYMENT_FAILED' && (
                          <button
                            onClick={() => handleResendFailMail(sub.id, sub.user.email)}
                            disabled={sendingMailId === sub.id}
                            className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded-lg text-xs font-medium transition disabled:opacity-50"
                          >
                            {sendingMailId === sub.id ? '발송 중...' : '결제수단 변경 안내 메일 발송'}
                          </button>
                        )}
                        <Link href={`/mypage/payments?userId=${sub.user.id}`}>
                          <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-xs font-medium transition">
                            결제 내역 보기
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <p className="text-xs text-gray-600 text-center">
          총 {filtered.length}명 표시 중
        </p>
      </main>
    </div>
  );
}