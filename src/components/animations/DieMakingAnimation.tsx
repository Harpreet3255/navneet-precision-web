import React from 'react';

interface DieMakingAnimationProps {
  className?: string;
}

const DieMakingAnimation: React.FC<DieMakingAnimationProps> = ({ className }) => {
  return (
    <div className={`die-making-animation ${className || ''}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 100"
        className="w-full h-full"
      >
        {/* Machine Base */}
        <rect x="20" y="70" width="160" height="20" fill="#1E293B" className="machine-base" />
        
        {/* CNC Machine Body */}
        <rect x="40" y="20" width="120" height="50" fill="#64748B" className="machine-body" />
        
        {/* Die Block */}
        <rect x="70" y="40" width="60" height="20" fill="#94A3B8" className="die-block" />
        
        {/* Cutting Tool */}
        <rect x="95" y="20" width="10" height="20" fill="#E25822" className="cutting-tool" />
        
        {/* Sparks - These will be animated */}
        <circle cx="100" cy="40" r="2" fill="#FBBF24" className="spark spark-1" />
        <circle cx="105" cy="42" r="1.5" fill="#FBBF24" className="spark spark-2" />
        <circle cx="95" cy="38" r="1.8" fill="#FBBF24" className="spark spark-3" />
        <circle cx="102" cy="36" r="1.2" fill="#FBBF24" className="spark spark-4" />
        <circle cx="98" cy="44" r="1.7" fill="#FBBF24" className="spark spark-5" />
        
        {/* Control Panel */}
        <rect x="150" y="30" width="20" height="30" fill="#0EA5E9" className="control-panel" />
        <rect x="155" y="35" width="10" height="5" fill="#F8FAFC" className="control-screen" />
        <circle cx="160" cy="50" r="3" fill="#E25822" className="control-button" />
        
        {/* Engraving Lines */}
        <line x1="75" y1="45" x2="125" y2="45" stroke="#1E293B" strokeWidth="1" className="engraving-line-1" />
        <line x1="75" y1="50" x2="125" y2="50" stroke="#1E293B" strokeWidth="1" className="engraving-line-2" />
        <line x1="75" y1="55" x2="125" y2="55" stroke="#1E293B" strokeWidth="1" className="engraving-line-3" />
      </svg>
    </div>
  );
};

export default DieMakingAnimation;
