import React from 'react';

export const BrandLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="brandGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="brandGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="brandGrad3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Futuristic N geometry */}
      <path
        d="M10 8C10 6.89543 10.8954 6 12 6H16C17.1046 6 18 6.89543 18 8V32C18 33.1046 17.1046 34 16 34H12C10.8954 34 10 33.1046 10 32V8Z"
        fill="url(#brandGrad1)"
      />
      <path
        d="M24 8C24 6.89543 24.8954 6 26 6H30C31.1046 6 32 6.89543 32 8V32C32 33.1046 31.1046 34 30 34H26C24.8954 34 24 33.1046 24 32V8Z"
        fill="url(#brandGrad2)"
      />
      
      {/* Precision Diagonal Cut */}
      <path
        d="M11 10L29 32"
        stroke="url(#brandGrad3)"
        strokeWidth="6.5"
        strokeLinecap="round"
        filter="url(#glow)"
      />
      
      {/* Accent Tech Dots */}
      <circle cx="28" cy="8" r="1.5" fill="#38BDF8" />
      <circle cx="12" cy="32" r="1.5" fill="#38BDF8" />
    </svg>
  );
};
