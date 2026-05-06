import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import Chatbot from '@/components/common/Chatbot';
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
  title: 'MINIME',
  description: 'AI가 요약해주는 나만의 IT 뉴스레터',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // ✅ 2. suppressHydrationWarning 추가 (다크모드 깜빡임 경고 방지)
    <html lang="ko" suppressHydrationWarning>
      <body>
        {/* ✅ 3. children을 ThemeProvider로 감싸주기 */}
        <ThemeProvider>
          {children}
          <Chatbot />
        </ThemeProvider>
        <BottomNav />
      </body>
    </html>
  );
}