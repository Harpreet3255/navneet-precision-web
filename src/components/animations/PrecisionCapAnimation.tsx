import React from 'react';

interface PrecisionCapAnimationProps {
  className?: string;
}

const PrecisionCapAnimation: React.FC<PrecisionCapAnimationProps> = ({ className }) => {
  return (
    <div className={`precision-cap-animation ${className || ''}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 100"
        className="w-full h-full"
      >
        {/* Machine Base */}
        <rect x="20" y="70" width="160" height="20" fill="#1E293B" className="machine-base" />
        
        {/* Machine Body */}
        <rect x="40" y="30" width="120" height="40" fill="#64748B" className="machine-body" />
        
        {/* Injection Nozzle */}
        <rect x="95" y="20" width="10" height="10" fill="#E25822" className="injection-nozzle" />
        
        {/* Conveyor Belt */}
        <rect x="40" y="75" width="120" height="5" fill="#0EA5E9" className="conveyor-belt" />
        
        {/* Caps - These will be animated */}
        <circle cx="60" cy="50" r="8" fill="#E25822" className="cap cap-1" />
        <circle cx="90" cy="50" r="8" fill="#E25822" className="cap cap-2" />
        <circle cx="120" cy="50" r="8" fill="#E25822" className="cap cap-3" />
        <circle cx="150" cy="50" r="8" fill="#E25822" className="cap cap-4" />
        
        {/* Falling Cap */}
        <circle cx="100" cy="15" r="8" fill="#E25822" className="falling-cap" />
        
        {/* Control Panel */}
        <rect x="150" y="40" width="20" height="15" fill="#0EA5E9" className="control-panel" />
        <circle cx="160" cy="47" r="2" fill="#F8FAFC" className="control-light" />
      </svg>
    </div>
  );
};

export default PrecisionCapAnimation;
