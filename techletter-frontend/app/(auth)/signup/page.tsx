'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', nickname: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const authBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorMessage = params.get('error');
    if (errorMessage) {
      setError(errorMessage);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/signup', form);
      localStorage.setItem('accessToken', res.data.accessToken);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow dark:bg-gray-800">
        <Link href="/">
          <h1 className="mb-2 cursor-pointer text-center text-2xl font-bold text-gray-900 transition hover:opacity-80 dark:text-white">
            TechLetter
          </h1>
        </Link>
        <p className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
          IT 트렌드를 한눈에
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
              닉네임
            </label>
            <input
              type="text"
              placeholder="닉네임"
              value={form.nickname}
              onChange={(e) => setForm({ ...form, nickname: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
              이메일
            </label>
            <input
              type="email"
              placeholder="이메일 주소"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호 (8자 이상)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              window.location.href = `${authBaseUrl}/auth/google/signup`;
            }}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
          >
            Google로 가입하기
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = `${authBaseUrl}/auth/kakao/signup`;
            }}
            className="w-full rounded-lg bg-[#FEE500] px-4 py-2.5 text-sm font-medium text-[#191919] transition hover:brightness-95"
          >
            Kakao로 가입하기
          </button>

          <button
            type="button"
            onClick={() => {
              window.location.href = `${authBaseUrl}/auth/naver/signup`;
            }}
            className="w-full rounded-lg bg-[#03C75A] px-4 py-2.5 text-sm font-medium text-white transition hover:brightness-95"
          >
            Naver로 가입하기
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
