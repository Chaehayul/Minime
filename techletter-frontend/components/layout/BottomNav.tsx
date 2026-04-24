'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: '홈' },
  { href: '/mypage', label: '마이페이지' },
  { href: '/login', label: '로그인' },
  { href: '/admin/stats', label: '관리자' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#2e2e2e] bg-[#111111] md:hidden">
      <div className="mx-auto flex max-w-[1200px] items-center justify-around px-4 py-3 text-sm">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? 'font-semibold text-blue-500' : 'text-gray-300'}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}