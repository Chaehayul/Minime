import MobileFrame from '@/components/layout/MobileFrame';

export default function AdminStatsPage() {
  return (
    <MobileFrame>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-bold">통계 대시보드</h1>
        <button className="rounded-xl border border-[#3a3a3a] px-4 py-2 text-sm">
          2026년 4월
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card-dark p-4">
          <p className="text-3xl font-bold">2,841</p>
          <p className="mt-1 text-sm text-gray-400">전체 구독자</p>
        </div>

        <div className="card-dark p-4">
          <p className="text-3xl font-bold">34.2%</p>
          <p className="mt-1 text-sm text-gray-400">이메일 오픈율</p>
        </div>
      </div>
    </MobileFrame>
  );
}