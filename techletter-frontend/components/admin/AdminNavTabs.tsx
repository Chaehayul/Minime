'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const adminTabs = [
  { href: '/admin', label: '운영 홈' },
  { href: '/admin/news', label: '기사 관리' },
  { href: '/admin/users', label: '사용자' },
  { href: '/admin/reporter-requests', label: '기자 신청' },
  { href: '/admin/subscribers', label: '구독자' },
  { href: '/admin/stats', label: '통계' },
];

const reporterTabs = [
  { href: '/reporter/dashboard', label: '기자 홈' },
  { href: '/reporter/news', label: '내 기사' },
  { href: '/reporter/feed', label: '피드' },
  { href: '/reporter/subscribers', label: '구독자' },
  { href: '/reporter/profile/edit', label: '프로필' },
];

export default function AdminNavTabs() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    api.get('/users/me').then((response) => setRole(response.data?.role || null)).catch(() => setRole(null));
  }, []);

  const tabs = role === 'reporter' ? reporterTabs : role === 'admin' ? adminTabs : [];

  return (
    <nav className="mx-auto max-w-6xl overflow-x-auto px-4 pb-3">
      <div className="flex min-w-max gap-2 border-t border-gray-200 pt-3 dark:border-gray-800">
        {tabs.map((tab) => {
          const active = pathname === tab.href || (tab.href !== '/admin' && pathname.startsWith(`${tab.href}/`));
          return (
            <Link key={tab.href} href={tab.href} className={`border px-3 py-1.5 text-xs font-medium transition ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-500 hover:border-gray-500 dark:border-gray-700 dark:text-gray-400'}`}>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
