import React, { createContext, useContext, useState } from 'react';

// Define the transition types
export type TransitionType = 
  | 'precision-cap' // Plastic Cap Manufacturing
  | 'die-making'    // Custom Die Making
  | 'fix-progress'  // Machine Maintenance
  | 'default';      // Default transition

// Define the context type
interface TransitionContextType {
  transitionType: TransitionType;
  transitionName: string;
  setTransition: (type: TransitionType) => void;
  isTransitioning: boolean;
  setIsTransitioning: (value: boolean) => void;
}

// Create the context with default values
const TransitionContext = createContext<TransitionContextType>({
  transitionType: 'default',
  transitionName: '',
  setTransition: () => {},
  isTransitioning: false,
  setIsTransitioning: () => {},
});

// Custom hook to use the transition context
export const useTransition = () => useContext(TransitionContext);

// Get transition name based on type
const getTransitionName = (type: TransitionType): string => {
  switch (type) {
    case 'precision-cap':
      return 'Precision in Every Cap';
    case 'die-making':
      return 'Die in Making';
    case 'fix-progress':
      return 'Fix in Progress';
    default:
      return '';
  }
};

// Provider component
export const TransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transitionType, setTransitionType] = useState<TransitionType>('default');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Function to set the transition type
  const setTransition = (type: TransitionType) => {
    setTransitionType(type);
  };

  // Get the transition name based on the current type
  const transitionName = getTransitionName(transitionType);

  return (
    <TransitionContext.Provider
      value={{
        transitionType,
        transitionName,
        setTransition,
        isTransitioning,
        setIsTransitioning,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
};
