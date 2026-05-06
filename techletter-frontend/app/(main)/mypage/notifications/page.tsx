'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [newsBriefing, setNewsBriefing] = useState(true);
  const [activityNotifications, setActivityNotifications] = useState(true);

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0b0b] transition-colors duration-200 pb-32">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#0b0b0b] border-b border-gray-100 dark:border-[#2e2e2e] px-4 h-14 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-500 dark:text-gray-400 p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-base font-bold text-gray-900 dark:text-white">알림 설정</h1>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* 뉴스 브리핑 */}
        <section className="mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#171717] rounded-2xl border border-gray-100 dark:border-[#2f2f2f]">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">뉴스 브리핑</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">매일 아침 최신 뉴스를 받아보세요</p>
            </div>
            <button 
              onClick={() => setNewsBriefing(!newsBriefing)}
              className={`w-12 h-6 rounded-full transition-colors relative ${newsBriefing ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newsBriefing ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        {/* 활동 알림 */}
        <section className="mb-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#171717] rounded-2xl border border-gray-100 dark:border-[#2f2f2f]">
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">활동 알림</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">좋아요, 댓글 등의 활동 알림</p>
            </div>
            <button 
              onClick={() => setActivityNotifications(!activityNotifications)}
              className={`w-12 h-6 rounded-full transition-colors relative ${activityNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${activityNotifications ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}