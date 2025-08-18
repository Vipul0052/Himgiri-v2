import { Mountain } from 'lucide-react';

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
      className={`flex items-center space-x-2 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Logo Icon */}
      <div className={`
        ${currentSize.container} 
        relative 
        rounded-lg 
        bg-gradient-to-br from-accent via-primary to-secondary 
        flex items-center justify-center 
        shadow-lg
        group-hover:shadow-xl transition-all duration-300
      `}>
        <Mountain className={`${currentSize.icon} text-white drop-shadow-sm`} />
        {/* Decorative accent */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full opacity-80"></div>
      </div>
      
      {/* Company Name */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${currentSize.text} bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
            Himgirinaturals
          </span>
          {size === 'lg' && (
            <span className="text-xs text-muted-foreground tracking-wider">
              HIMALAYAN NATURALS
            </span>
          )}
        </div>
      )}
    </div>
  );
}