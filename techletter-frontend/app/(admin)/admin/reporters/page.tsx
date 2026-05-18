'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface ReporterProfile {
  id: number;
  realName: string;
  organization: string;
  bio: string;
  portfolioUrl?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejectedReason?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  user: {
    email: string;
    nickname: string;
    role: string;
  };
}

const statusLabel: Record<ReporterProfile['status'], { label: string; color: string }> = {
  pending: { label: '승인 대기', color: 'text-yellow-400' },
  approved: { label: '승인 완료', color: 'text-emerald-400' },
  rejected: { label: '반려', color: 'text-red-400' },
};

export default function AdminReportersPage() {
  const router = useRouter();
  const [reporters, setReporters] = useState<ReporterProfile[]>([]);
  const [status, setStatus] = useState<'all' | ReporterProfile['status']>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReporters();
  }, [status]);

  const fetchReporters = async () => {
    setLoading(true);
    try {
      const query = status === 'all' ? '' : `?status=${status}`;
      const res = await api.get(`/reporters/admin${query}`);
      setReporters(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) alert('관리자만 접근할 수 있습니다.');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id: number) => {
    if (!confirm('이 회원에게 기자 권한을 부여할까요?')) return;
    await api.post(`/reporters/admin/${id}/approve`);
    fetchReporters();
  };

  const reject = async (id: number) => {
    const reason = prompt('반려 사유를 입력하세요. 빈칸으로 둘 수도 있습니다.') || '';
    await api.post(`/reporters/admin/${id}/reject`, { reason });
    fetchReporters();
  };

  return (
    <div className="min-h-screen pb-10 transition-colors duration-200">
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin')} className="text-gray-400 transition hover:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-base font-bold text-white">기자 신청 관리</span>
            <span className="text-xs text-gray-500">총 {reporters.length}건</span>
          </div>
          <Link href="/admin/news" className="text-sm text-blue-400 transition hover:text-blue-300">
            뉴스 관리
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex flex-wrap gap-2">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((item) => (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                status === item
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {item === 'all' ? '전체' : statusLabel[item].label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-lg bg-gray-800" />
            ))}
          </div>
        ) : reporters.length === 0 ? (
          <div className="rounded-lg border border-gray-800 py-16 text-center text-sm text-gray-500">
            표시할 기자 신청이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left text-gray-500">
                  <th className="px-2 py-3">신청자</th>
                  <th className="px-2 py-3">소속</th>
                  <th className="px-2 py-3">소개</th>
                  <th className="px-2 py-3">상태</th>
                  <th className="px-2 py-3">신청일</th>
                  <th className="px-2 py-3">관리</th>
                </tr>
              </thead>
              <tbody>
                {reporters.map((reporter) => (
                  <tr key={reporter.id} className="border-b border-gray-800 align-top transition hover:bg-gray-900">
                    <td className="px-2 py-3">
                      <div className="font-medium text-gray-100">{reporter.realName}</div>
                      <div className="mt-0.5 text-xs text-gray-500">{reporter.user?.email}</div>
                      <div className="mt-0.5 text-xs text-gray-500">닉네임: {reporter.user?.nickname}</div>
                    </td>
                    <td className="px-2 py-3 text-gray-300">{reporter.organization}</td>
                    <td className="max-w-md px-2 py-3">
                      <p className="line-clamp-3 text-gray-400">{reporter.bio}</p>
                      {reporter.portfolioUrl && (
                        <a
                          href={reporter.portfolioUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-xs text-blue-400 hover:underline"
                        >
                          포트폴리오 보기
                        </a>
                      )}
                      {reporter.rejectedReason && (
                        <div className="mt-2 text-xs text-red-400">반려 사유: {reporter.rejectedReason}</div>
                      )}
                    </td>
                    <td className={`px-2 py-3 text-xs font-medium ${statusLabel[reporter.status].color}`}>
                      {statusLabel[reporter.status].label}
                    </td>
                    <td className="px-2 py-3 text-xs text-gray-500">
                      {new Date(reporter.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => approve(reporter.id)}
                          disabled={reporter.status === 'approved'}
                          className="text-xs text-emerald-400 transition hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => reject(reporter.id)}
                          disabled={reporter.status === 'rejected'}
                          className="text-xs text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          반려
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
