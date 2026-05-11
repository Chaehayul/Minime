'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const plans = [
  {
    id: 'daily',
    name: '데일리 플랜',
    price: 2900,
    period: '월',
    description: '매일 아침 8시, 오늘의 테크 뉴스를 이메일로 받아보세요.',
    features: ['매일 오전 8시 발송', '주요 테크 뉴스 5건', '카테고리 필터링', '읽음 기록 저장'],
    color: 'blue',
    badge: null,
  },
  {
    id: 'weekly',
    name: '위클리 플랜',
    price: 1900,
    period: '월',
    description: '매주 월요일, 한 주간의 테크 트렌드를 정리해서 보내드려요.',
    features: ['매주 월요일 발송', '주간 테크 트렌드 요약', '심층 분석 리포트', '아카이브 무제한 열람'],
    color: 'purple',
    badge: null,
  },
  {
    id: 'all',
    name: '올인원 플랜',
    price: 3900,
    period: '월',
    description: '데일리 + 위클리 모두! 가장 알차게 테크 트렌드를 챙겨보세요.',
    features: ['데일리 + 위클리 모두 포함', '광고 없는 뉴스 열람', '독점 심층 리포트', '우선 고객 지원'],
    color: 'emerald',
    badge: '인기',
  },
];

const colorMap: Record<string, { border: string; bg: string; badge: string; check: string; dot: string }> = {
  blue: { border: 'border-blue-500', bg: 'bg-blue-500/10', badge: 'bg-blue-500 text-white', check: 'text-blue-400', dot: 'bg-blue-500' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', badge: 'bg-purple-500 text-white', check: 'text-purple-400', dot: 'bg-purple-500' },
  emerald: { border: 'border-emerald-500', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500 text-white', check: 'text-emerald-400', dot: 'bg-emerald-500' },
};

export default function PlansPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleNext = () => {
    if (!selected) return;
    const plan = plans.find(p => p.id === selected)!;
    router.push(`/subscriptions/checkout?plan=${selected}&price=${plan.price}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-40">
      <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/mypage">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <span className="font-bold text-base">구독 플랜 선택</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 pt-6 pb-2">
        {/* 진행 단계 */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-sm text-blue-400 font-medium">플랜 선택</span>
          </div>
          <div className="flex-1 h-px bg-gray-700" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">2</div>
            <span className="text-sm text-gray-500">결제 정보</span>
          </div>
          <div className="flex-1 h-px bg-gray-700" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs text-gray-400">3</div>
            <span className="text-sm text-gray-500">완료</span>
          </div>
        </div>
        <h1 className="text-xl font-bold mb-1">원하는 플랜을 선택하세요</h1>
        <p className="text-sm text-gray-400 mb-6">언제든지 해지할 수 있어요. 첫 달은 무료로 체험해보세요!</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 flex flex-col gap-4">
        {plans.map((plan) => {
          const colors = colorMap[plan.color];
          const isSelected = selected === plan.id;
          return (
            <button key={plan.id} onClick={() => setSelected(plan.id)}
              className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                isSelected ? `${colors.border} ${colors.bg}` : 'border-gray-800 bg-gray-900 hover:border-gray-600'
              }`}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">{plan.name}</span>
                  {plan.badge && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>{plan.badge}</span>
                  )}
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected ? colors.border : 'border-gray-600'
                }`}>
                  {isSelected && <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />}
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold">{plan.price.toLocaleString()}원</span>
                <span className="text-sm text-gray-400">/ {plan.period}</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
              <div className="flex flex-col gap-2">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={colors.check}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="fixed bottom-16 left-0 right-0 bg-gray-950 border-t border-gray-800 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <button onClick={handleNext} disabled={!selected}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl py-3.5 text-sm font-bold transition">
            {selected ? `${plans.find(p => p.id === selected)?.name} 선택하기` : '플랜을 선택해주세요'}
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">첫 달 무료 체험 · 언제든지 해지 가능</p>
        </div>
      </div>
    </div>
  );
}