import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { scrollToSection } from '@/lib/scrollUtils';
import SimpleScene from './3d/SimpleScene';

// Lazy load the advanced scene to improve initial load time
const AdvancedIndustrialScene = React.lazy(() =>
  import('./3d/AdvancedIndustrialScene').catch(() => ({
    default: SimpleScene
  }))
);

// Fallback image for when 3D is loading or not supported
const backgroundImage = 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?q=80&w=2070&auto=format&fit=crop';

// Loading component with progress indicator
const Loader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 10;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-navneet-dark/80 z-30">
      <div className="text-white text-center">
        <div className="mb-4 text-2xl font-bold">Loading 3D Experience</div>
        <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-navneet-orange rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-2">{Math.round(progress)}%</div>
      </div>
    </div>
  );
};

// Fallback component for when 3D is not supported
const Fallback = () => {
  return (
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
  );
};

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D scene error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const Advanced3DHero = () => {
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
      {/* 3D Scene or Fallback */}
      {is3DSupported ? (
        <ErrorBoundary fallback={<Fallback />}>
          <div className="absolute inset-0">
            <Suspense fallback={<Loader />}>
              <Canvas
                shadows
                dpr={[1, 1.5]}
                gl={{
                  antialias: true,
                  alpha: false,
                  powerPreference: "high-performance",
                  failIfMajorPerformanceCaveat: false
                }}
                camera={{ position: [0, 0, 10], fov: 50 }}
                className="bg-navneet-dark"
              >
                <SimpleScene />
              </Canvas>
            </Suspense>
          </div>
        </ErrorBoundary>
      ) : (
        <Fallback />
      )}

      {/* Overlay gradient for better text readability */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-navneet-dark/50 to-navneet-dark/30 z-20"
        aria-hidden="true"
      ></div>

      {/* Content overlay */}
      <div className="relative z-30 h-full flex items-center">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Advanced3DHero;
