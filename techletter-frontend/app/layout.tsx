import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider'; // ✅ 1. 추가
import Chatbot from '@/components/common/Chatbot';

export const metadata: Metadata = {
  title: 'TechLetter',
  description: 'IT 트렌드를 한눈에',
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
      </body>
    </html>
  );
}