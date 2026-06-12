import './globals.css';
import type { Metadata } from 'next';
import BottomNav from '@/components/layout/BottomNav';
import { ThemeProvider } from '@/components/ThemeProvider';
import Chatbot from '@/components/common/Chatbot';
import PortfolioDemoSwitcher from '@/components/common/PortfolioDemoSwitcher';

export const metadata: Metadata = {
  title: 'MINIME TechLetter',
  description: '사용자, 기자, 관리자를 연결하는 IT 뉴스레터 플랫폼',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <PortfolioDemoSwitcher />
          <Chatbot />
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
