import React, { useEffect } from 'react';
import { useTransition } from '@/contexts/TransitionContext';
import PrecisionCapAnimation from './animations/PrecisionCapAnimation';
import DieMakingAnimation from './animations/DieMakingAnimation';
import FixProgressAnimation from './animations/FixProgressAnimation';

const TransitionOverlay: React.FC = () => {
  const { transitionType, transitionName, isTransitioning, setIsTransitioning } = useTransition();

  // Automatically hide the overlay after animation completes
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1800); // Animation duration is 1.8s

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, setIsTransitioning]);

  if (!isTransitioning) {
    return null;
  }

  // Render different animations based on transition type
  const renderAnimation = () => {
    switch (transitionType) {
      case 'precision-cap':
        return <PrecisionCapAnimation className="w-full h-40" />;
      case 'die-making':
        return <DieMakingAnimation className="w-full h-40" />;
      case 'fix-progress':
        return <FixProgressAnimation className="w-full h-40" />;
      default:
        return null;
    }
  };

  return (
    <div className={`transition-overlay ${transitionType}`}>
      <div className="transition-content">
        <h2 className="transition-title">{transitionName}</h2>
        <div className="transition-animation">
          {renderAnimation()}
        </div>
      </div>
    </div>
  );
};

export default TransitionOverlay;
