import React from 'react';

interface FixProgressAnimationProps {
  className?: string;
}

const FixProgressAnimation: React.FC<FixProgressAnimationProps> = ({ className }) => {
  return (
    <div className={`fix-progress-animation ${className || ''}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 100"
        className="w-full h-full"
      >
        {/* Machine Base */}
        <rect x="20" y="70" width="160" height="20" fill="#1E293B" className="machine-base" />
        
        {/* Machine Body */}
        <rect x="50" y="30" width="100" height="40" fill="#64748B" className="machine-body" />
        
        {/* Gears - These will be animated */}
        <circle cx="70" cy="50" r="15" fill="#94A3B8" className="gear gear-large" />
        <circle cx="70" cy="50" r="5" fill="#1E293B" className="gear-center" />
        <line x1="70" y1="35" x2="70" y2="65" stroke="#1E293B" strokeWidth="2" className="gear-tooth-1" />
        <line x1="55" y1="50" x2="85" y2="50" stroke="#1E293B" strokeWidth="2" className="gear-tooth-2" />
        <line x1="60" y1="40" x2="80" y2="60" stroke="#1E293B" strokeWidth="2" className="gear-tooth-3" />
        <line x1="60" y1="60" x2="80" y2="40" stroke="#1E293B" strokeWidth="2" className="gear-tooth-4" />
        
        <circle cx="100" cy="40" r="10" fill="#94A3B8" className="gear gear-small" />
        <circle cx="100" cy="40" r="3" fill="#1E293B" className="gear-center-small" />
        <line x1="100" y1="30" x2="100" y2="50" stroke="#1E293B" strokeWidth="1.5" className="gear-tooth-small-1" />
        <line x1="90" y1="40" x2="110" y2="40" stroke="#1E293B" strokeWidth="1.5" className="gear-tooth-small-2" />
        <line x1="93" y1="33" x2="107" y2="47" stroke="#1E293B" strokeWidth="1.5" className="gear-tooth-small-3" />
        <line x1="93" y1="47" x2="107" y2="33" stroke="#1E293B" strokeWidth="1.5" className="gear-tooth-small-4" />
        
        {/* Wrench - This will be animated */}
        <path 
          d="M130,45 L150,35 L148,30 L125,42 L123,48 L130,45" 
          fill="#E25822" 
          className="wrench" 
        />
        
        {/* Control Panel */}
        <rect x="120" y="50" width="20" height="15" fill="#0EA5E9" className="control-panel" />
        <circle cx="130" cy="57" r="2" fill="#F8FAFC" className="control-light" />
        
        {/* Maintenance Progress Bar */}
        <rect x="50" y="20" width="100" height="5" fill="#94A3B8" className="progress-bar-bg" />
        <rect x="50" y="20" width="60" height="5" fill="#E25822" className="progress-bar-fill" />
      </svg>
    </div>
  );
};

export default FixProgressAnimation;
