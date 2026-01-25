import { cn } from '@/lib/utils';

interface SyntropylabsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function SyntropylabsLogo({ className, size = 'md', showText = true }: SyntropylabsLogoProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {}
      <div className={cn('relative', sizes[size])}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="M20 4L34.6 12V28L20 36L5.4 28V12L20 4Z"
            fill="url(#Syntropylabs-gradient)"
          />
          <defs>
            <linearGradient id="Syntropylabs-gradient" x1="5.4" y1="4" x2="34.6" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7C3AED" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {showText && (
        <span className={cn('font-semibold text-foreground', textSizes[size])}>
          Syntropylabs
        </span>
      )}
    </div>
  );
}
