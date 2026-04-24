import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function MobileFrame({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}