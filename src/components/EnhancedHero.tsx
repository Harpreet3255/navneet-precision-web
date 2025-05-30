import React, { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { scrollToSection } from '@/lib/scrollUtils';
import { ErrorBoundary } from 'react-error-boundary';

// Using the industrial machinery image as the main background
const backgroundImage = 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?q=80&w=2070&auto=format&fit=crop';

// Lazy load the 3D scene to improve initial load time
const SimpleIndustrialScene = React.lazy(() => 
  import('./3d/SimpleIndustrialScene').catch(() => ({ 
    default: () => null 
  }))
);

// Fallback component for when 3D scene is loading
const SceneLoader = () => (
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
    <div className="animate-pulse">Loading 3D scene...</div>
  </div>
);

// Error fallback for the 3D scene
const ErrorFallback = ({ error }: { error: Error }) => {
  console.error('Error in 3D scene:', error);
  return null; // Return null to silently fail and just show the background image
};

const EnhancedHero = () => {
  const [is3DSupported, setIs3DSupported] = useState(true);
  
  // Check if WebGL is supported
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setIs3DSupported(!!gl);
    } catch (e) {
      setIs3DSupported(false);
      console.warn('WebGL not supported, falling back to static image');
    }
  }, []);

  return (
    <section id="hero" className="relative h-screen overflow-hidden pt-24">
      {/* Background Image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-gradient-to-b from-navneet-dark/70 to-navneet-dark/50 z-10"
          aria-hidden="true"
        ></div>
        <img
          src={backgroundImage}
          alt="Navneet Industries - Precision Machinery"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* 3D Scene Overlay - only shown if WebGL is supported */}
      {is3DSupported && (
        <div className="absolute inset-0 z-10 opacity-80">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<SceneLoader />}>
              <SimpleIndustrialScene />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}

      {/* Content overlay */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-block bg-navneet-orange/90 text-white text-sm font-medium py-1 px-3 rounded mb-4">
              Leading Manufacturer in India
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Precision in Every Process
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl leading-relaxed">
              Plastic Manufacturing | Machine Maintenance | Die Making
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-navneet-orange hover:bg-navneet-orange/90 text-white font-medium px-6 py-2.5 h-auto"
                onClick={() => scrollToSection('services')}
              >
                Explore Services <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-navneet-dark font-medium px-6 py-2.5 h-auto"
                onClick={() => scrollToSection('contact')}
              >
                Contact Us <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHero;
