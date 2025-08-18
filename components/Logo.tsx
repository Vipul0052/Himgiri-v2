import { cn } from './ui/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export function Logo({ size = 'md', showText = true, className = '', onClick }: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'h-6 w-6',
      text: 'text-base font-semibold',
      icon: 'h-4 w-4'
    },
    md: {
      container: 'h-8 w-8',
      text: 'text-lg font-semibold',
      icon: 'h-5 w-5'
    },
    lg: {
      container: 'h-12 w-12',
      text: 'text-2xl font-bold',
      icon: 'h-8 w-8'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      className={cn('flex items-center cursor-pointer', className)}
      onClick={onClick}
    >
      <img
        src="/logo-himgiri.svg"
        alt="Himgirinaturals"
        className={currentSize.container}
      />
    </div>
  );
}