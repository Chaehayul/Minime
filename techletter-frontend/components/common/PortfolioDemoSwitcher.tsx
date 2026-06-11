'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

type DemoRole = 'user' | 'reporter' | 'admin';

const demoOptions: Array<{
  role: DemoRole;
  label: string;
  description: string;
  destination: string;
}> = [
  {
    role: 'user',
    label: '일반 사용자',
    description: '뉴스 탐색, 북마크, 마이페이지를 둘러봅니다.',
    destination: '/mypage',
  },
  {
    role: 'reporter',
    label: '기자',
    description: '기자 대시보드, 기사 관리, 구독자 화면을 둘러봅니다.',
    destination: '/reporter/dashboard',
  },
  {
    role: 'admin',
    label: '관리자',
    description: '뉴스, 사용자, 기자, 통계 관리 화면을 둘러봅니다.',
    destination: '/admin',
  },
];

export default function PortfolioDemoSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<DemoRole | null>(null);
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedRole = localStorage.getItem('portfolioDemoRole') as DemoRole | null;
    if (savedRole && demoOptions.some((option) => option.role === savedRole)) {
      setActiveRole(savedRole);
    }
  }, []);

  const startDemo = async (option: (typeof demoOptions)[number]) => {
    setLoadingRole(option.role);
    setError('');

    try {
      const { data } = await api.post('/auth/demo', { role: option.role });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('portfolioDemoRole', option.role);
      window.location.href = option.destination;
    } catch (requestError: unknown) {
      const responseMessage =
        typeof requestError === 'object' &&
        requestError !== null &&
        'response' in requestError
          ? (requestError as { response?: { data?: { message?: string | string[] } } }).response?.data?.message
          : undefined;
      setError(Array.isArray(responseMessage) ? responseMessage.join(', ') : responseMessage || '데모를 시작하지 못했습니다.');
    } finally {
      setLoadingRole(null);
    }
  };

  const exitDemo = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('portfolioDemoRole');
    window.location.href = '/';
  };

  return (
    <>
      <div className="fixed right-4 top-4 z-[10000] flex items-center gap-2">
        {activeRole && (
          <div className="hidden border border-blue-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-blue-900 dark:bg-[#171717] sm:block">
            <strong className="text-blue-600">{demoOptions.find((option) => option.role === activeRole)?.label}</strong>
            <span className="ml-1 text-gray-500 dark:text-gray-400">읽기 전용 체험 중</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border border-blue-600 bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:bg-blue-700"
        >
          {activeRole ? '역할 전환' : '포트폴리오 체험'}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/55 p-4" onMouseDown={() => setOpen(false)}>
          <section
            className="w-full max-w-lg border border-gray-200 bg-white p-5 shadow-2xl dark:border-[#333] dark:bg-[#171717]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950 dark:text-white">역할별 포트폴리오 체험</h2>
                <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  가입과 승인 없이 모든 화면을 볼 수 있습니다. 실제 데이터 보호를 위해 조회만 가능합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 w-8 shrink-0 border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 dark:border-[#3a3a3a] dark:hover:bg-[#222]"
                aria-label="체험 선택 닫기"
              >
                X
              </button>
            </div>

            <div className="grid gap-2">
              {demoOptions.map((option) => (
                <button
                  key={option.role}
                  type="button"
                  onClick={() => startDemo(option)}
                  disabled={loadingRole !== null}
                  className="flex min-h-20 items-center justify-between gap-4 border border-gray-200 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 dark:border-[#333] dark:hover:border-blue-500 dark:hover:bg-blue-950/30"
                >
                  <span>
                    <strong className="block text-sm text-gray-950 dark:text-white">{option.label}</strong>
                    <span className="mt-1 block text-xs leading-relaxed text-gray-500 dark:text-gray-400">{option.description}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-blue-600">
                    {loadingRole === option.role ? '접속 중' : '체험하기'}
                  </span>
                </button>
              ))}
            </div>

            {error && <p className="mt-3 bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/30">{error}</p>}

            {activeRole && (
              <button
                type="button"
                onClick={exitDemo}
                className="mt-4 w-full border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 dark:border-[#3a3a3a] dark:text-gray-300 dark:hover:bg-[#222]"
              >
                체험 종료하고 공개 홈으로 돌아가기
              </button>
            )}
          </section>
        </div>
      )}
    </>
  );
}
