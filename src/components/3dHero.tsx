import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useProgress } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { scrollToSection } from '@/lib/scrollUtils';
import IndustrialScene from './3d/IndustrialScene';

// Loading component
const Loader = () => {
  const { progress } = useProgress();
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-navneet-dark/80 z-10">
      <div className="text-white text-center">
        <div className="mb-4 text-2xl font-bold">Loading</div>
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

// Fallback component for low-performance devices
const FallbackHero = () => {
  return (
    <div className="relative h-screen overflow-hidden pt-24">
      {/* Static background image */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-gradient-to-b from-navneet-dark/70 to-navneet-dark/50 z-10"
          aria-hidden="true"
        ></div>
        <img
          src="/images/industrial-fallback.svg"
          alt="Navneet Industries - Precision Machinery"
          className="w-full h-full object-cover"
        />
      </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main 3D Hero component
const Hero3D = () => {
  const [fallback, setFallback] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check if device is low-performance
  useEffect(() => {
    const checkPerformance = () => {
      // Check if device is mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Check if browser supports WebGL
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const hasWebGL = !!gl;

      // Set fallback for mobile devices or browsers without WebGL
      if (isMobile || !hasWebGL) {
        setFallback(true);
      }
    };

    checkPerformance();
  }, []);

  // If fallback is needed, render the static hero
  if (fallback) {
    return <FallbackHero />;
  }

  return (
    <section id="hero" className="relative h-screen overflow-hidden pt-24">
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas ref={canvasRef} shadows dpr={[1, 2]} className="bg-navneet-dark">
          <Suspense fallback={<Loader />}>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <spotLight
              position={[-10, 10, 5]}
              angle={0.3}
              penumbra={1}
              intensity={1}
              castShadow
            />
            <IndustrialScene />
            <Environment preset="city" />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableRotate={true}
              autoRotate
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 3}
            />
          </Suspense>
        </Canvas>
        <div
          className="absolute inset-0 bg-gradient-to-b from-navneet-dark/70 to-navneet-dark/50 z-10"
          aria-hidden="true"
        ></div>
      </div>

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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero3D;
