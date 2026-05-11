interface ProfileAvatarProps {
  nickname?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClass = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-14 w-14 text-xl',
};

export default function ProfileAvatar({
  nickname,
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const initial = nickname?.trim()?.[0]?.toUpperCase() || 'U';

  return (
    <div
      className={`${sizeClass[size]} flex shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-sm ${className}`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
