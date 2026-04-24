import './globals.css';
import type { Metadata } from 'next';

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
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}