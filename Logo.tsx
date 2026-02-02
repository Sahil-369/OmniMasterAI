
import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const uniqueId = useId().replace(/:/g, "x"); 
  const gradId = `omniGrad-${uniqueId}`;
  
  const sizes = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  return (
    <div className={`relative flex items-center justify-center ${sizes[size]} ${className} pointer-events-none select-none`}>
      <svg 
        viewBox="0 0 100 100" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl overflow-visible"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#818cf8', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#4f46e5', stopOpacity: 1 }} />
          </linearGradient>
          <filter id={`glow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle 
          cx="50" cy="50" r="46" 
          fill={`url(#${gradId})`} 
          stroke="white" 
          strokeWidth="2"
          filter={`url(#glow-${uniqueId})`}
        />
        <path 
          d="M35 45 Q50 25 65 45 Q50 65 35 45 Z" 
          fill="none" 
          stroke="white" 
          strokeWidth="6" 
          strokeLinecap="round" 
          className="animate-pulse"
        />
        <circle cx="50" cy="45" r="6" fill="white" />
        <path 
          d="M40 70 Q50 60 60 70" 
          fill="none" 
          stroke="white" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
      </svg>
    </div>
  );
};

export default Logo;
