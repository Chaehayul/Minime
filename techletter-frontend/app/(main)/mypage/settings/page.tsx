'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 비밀번호 변경 처리
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwords.newPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    setLoading(true);
    try {
      await api.patch('/users/me/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '정말로 탈퇴하시겠습니까?\n탈퇴 시 모든 북마크와 구독 정보가 영구적으로 삭제됩니다.'
    );
    if (!confirmed) return;

    try {
      await api.delete('/users/me');
      localStorage.removeItem('accessToken');
      alert('그동안 TechLetter를 이용해 주셔서 감사합니다.');
      router.push('/');
    } catch (err: any) {
      alert(err.response?.data?.message || '회원 탈퇴 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-24">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="font-bold text-base flex-1">설정</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-8">
        
        {/* 비밀번호 변경 섹션 */}
        <section>
          <h2 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            비밀번호 변경
          </h2>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            {error && <div className="mb-4 text-sm text-red-400 bg-red-400/10 p-3 rounded-lg">{error}</div>}
            {success && <div className="mb-4 text-sm text-green-400 bg-green-400/10 p-3 rounded-lg">{success}</div>}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">현재 비밀번호</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">새 비밀번호 (8자 이상)</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                  required
                  minLength={8}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50"
              >
                {loading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          </div>
        </section>

        {/* 위험 구역 (Danger Zone) */}
        <section>
          <h2 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            위험 구역
          </h2>
          <div className="bg-gray-900 border border-red-900/30 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-200 font-medium">회원 탈퇴</p>
              <p className="text-xs text-gray-500 mt-1">계정을 삭제하면 모든 데이터가 복구 불가능하게 삭제됩니다.</p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-lg text-sm font-medium transition whitespace-nowrap"
            >
              계정 삭제
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}