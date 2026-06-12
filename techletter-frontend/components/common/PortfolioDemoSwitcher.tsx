'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

type DemoRole = 'user' | 'reporter' | 'admin';

const demoOptions = [
  { role: 'user' as const, label: '일반 사용자', description: '뉴스 탐색, 맞춤 추천, 북마크와 마이페이지를 확인합니다.', destination: '/mypage' },
  { role: 'reporter' as const, label: '기자', description: '기자 대시보드, 내 기사, 구독자와 프로필을 확인합니다.', destination: '/reporter/dashboard' },
  { role: 'admin' as const, label: '관리자', description: '운영 현황, 기사, 사용자, 기자 신청과 구독자를 확인합니다.', destination: '/admin' },
];

export default function PortfolioDemoSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<DemoRole | null>(null);
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setActiveRole(localStorage.getItem('portfolioDemoRole') as DemoRole | null);
    const listener = (event: Event) => {
      setNotice((event as CustomEvent<string>).detail);
      window.setTimeout(() => setNotice(''), 4200);
    };
    window.addEventListener('portfolio-demo-notice', listener);
    return () => window.removeEventListener('portfolio-demo-notice', listener);
  }, []);

  const startDemo = async (option: (typeof demoOptions)[number]) => {
    setLoadingRole(option.role);
    setNotice('');
    try {
      const { data } = await api.post('/auth/demo', { role: option.role });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('portfolioDemoRole', option.role);
      window.location.href = option.destination;
    } catch (error) {
      if (!(error instanceof Error && error.message === 'DEMO_READ_ONLY')) {
        setNotice('체험 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.');
      }
    } finally {
      setLoadingRole(null);
    }
  };

  const exitDemo = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('portfolioDemoRole');
    window.location.href = '/';
  };

  const activeLabel = demoOptions.find((option) => option.role === activeRole)?.label;

  return (
    <>
      {activeRole && (
        <div className="fixed inset-x-0 top-0 z-[9998] border-b border-blue-200 bg-blue-50/95 px-4 py-2 text-center text-xs text-blue-800 backdrop-blur dark:border-blue-900 dark:bg-blue-950/95 dark:text-blue-200">
          <strong>{activeLabel} 체험 중</strong>
          <span className="ml-2">실제 데이터를 보호하기 위해 조회만 가능합니다.</span>
        </div>
      )}
      <div className={`fixed right-4 z-[10000] ${activeRole ? 'top-12' : 'top-4'}`}>
        <button type="button" onClick={() => setOpen(true)} className="border border-blue-700 bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-blue-700">
          {activeRole ? '역할 전환' : '포트폴리오 체험'}
        </button>
      </div>
      {notice && <div className="fixed bottom-24 left-1/2 z-[10002] w-[min(92vw,440px)] -translate-x-1/2 border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white shadow-2xl">{notice}</div>}
      {open && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 p-4" onMouseDown={() => setOpen(false)}>
          <section className="w-full max-w-lg border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-950" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div><h2 className="text-lg font-bold">역할별 포트폴리오 체험</h2><p className="mt-1 text-sm leading-relaxed text-gray-500">회원가입 없이 실제 서비스 데이터를 안전한 읽기 전용 모드로 둘러볼 수 있습니다.</p></div>
              <button type="button" onClick={() => setOpen(false)} className="h-8 w-8 border border-gray-300 text-gray-500" aria-label="닫기">×</button>
            </div>
            <div className="mt-5 grid gap-2">
              {demoOptions.map((option) => (
                <button key={option.role} type="button" onClick={() => startDemo(option)} disabled={loadingRole !== null} className="flex min-h-20 items-center justify-between gap-4 border border-gray-200 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-blue-950/30">
                  <span><strong className="block text-sm">{option.label}</strong><span className="mt-1 block text-xs leading-relaxed text-gray-500">{option.description}</span></span>
                  <span className="shrink-0 text-xs font-semibold text-blue-600">{loadingRole === option.role ? '연결 중' : '체험하기'}</span>
                </button>
              ))}
            </div>
            {activeRole && <button type="button" onClick={exitDemo} className="mt-4 w-full border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300">체험 종료 후 공개 화면으로 돌아가기</button>}
          </section>
        </div>
      )}
    </>
  );
}
