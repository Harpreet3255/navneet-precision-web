import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { scrollToSection } from '@/lib/scrollUtils';

// Using the industrial machinery image as the main background
const backgroundImage = 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?q=80&w=2070&auto=format&fit=crop';

// Lazy load the 3D scene
const BasicScene = React.lazy(() => import('./BasicScene'));

const SimpleHero = () => {
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
      
      {/* 3D Scene - wrapped in error boundary and suspense */}
      <div className="absolute inset-0 z-10 opacity-70">
        <Suspense fallback={null}>
          <BasicScene />
        </Suspense>
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

export default SimpleHero;
