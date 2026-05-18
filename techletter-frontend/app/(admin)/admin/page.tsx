import Link from 'next/link';

const adminMenus = [
  { href: '/admin/news', title: '뉴스 관리', description: '기사 작성, 수정, 발행 상태를 관리합니다.' },
  { href: '/admin/reporters', title: '기자 신청 관리', description: '기사 작성 권한 신청을 승인하거나 반려합니다.' },
  { href: '/admin/subscribers', title: '구독자 관리', description: '뉴스레터 구독자 목록을 확인합니다.' },
  { href: '/admin/stats', title: '통계', description: '서비스 이용 현황과 발송 지표를 확인합니다.' },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen px-4 py-10">
      <main className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">관리자 대시보드</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {adminMenus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="rounded-lg border border-gray-200 p-5 transition hover:border-blue-500 hover:bg-blue-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500 dark:hover:bg-gray-900"
            >
              <div className="text-base font-semibold text-gray-900 dark:text-white">{menu.title}</div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{menu.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
