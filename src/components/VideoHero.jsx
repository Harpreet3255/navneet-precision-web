import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { scrollToSection } from '@/lib/scrollUtils';

// Fallback image for when video is loading or not supported
const fallbackImage = 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?q=80&w=2070&auto=format&fit=crop';

// Video URLs - we'll use a placeholder industrial video
const videoUrl = 'https://assets.mixkit.co/videos/preview/mixkit-industrial-machine-in-a-factory-processing-food-40164-large.mp4';
const videoUrlWebm = 'https://assets.mixkit.co/videos/preview/mixkit-industrial-machine-in-a-factory-processing-food-40164-large.webm';

const VideoHero = () => {
  return (
    <section id="hero" className="relative h-screen overflow-hidden pt-24">
      {/* Video Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-gradient-to-b from-navneet-dark/80 to-navneet-dark/60 z-10"
          aria-hidden="true"
        ></div>
        
        {/* Video element with fallback */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster={fallbackImage}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrlWebm} type="video/webm" />
          {/* Fallback image if video fails */}
          <img
            src={fallbackImage}
            alt="Navneet Industries - Precision Machinery"
            className="w-full h-full object-cover"
          />
        </video>
      </div>

      {/* Animated overlay elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="industrial-animation">
          {/* Large Gear - CSS Animation */}
          <div className="absolute w-64 h-64 top-1/4 -left-16 opacity-30 animate-spin-slow">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="100" cy="100" r="80" fill="#475569" />
              <circle cx="100" cy="100" r="40" fill="#334155" />
              {/* Gear teeth */}
              {Array.from({ length: 12 }).map((_, i) => (
                <rect 
                  key={i} 
                  x="90" 
                  y="10" 
                  width="20" 
                  height="30" 
                  fill="#475569" 
                  transform={`rotate(${i * 30} 100 100)`}
                />
              ))}
            </svg>
          </div>
          
          {/* Medium Gear - CSS Animation */}
          <div className="absolute w-48 h-48 top-1/3 right-0 opacity-30 animate-spin-slow-reverse">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="100" cy="100" r="80" fill="#64748B" />
              <circle cx="100" cy="100" r="40" fill="#475569" />
              {/* Gear teeth */}
              {Array.from({ length: 10 }).map((_, i) => (
                <rect 
                  key={i} 
                  x="90" 
                  y="10" 
                  width="20" 
                  height="30" 
                  fill="#64748B" 
                  transform={`rotate(${i * 36} 100 100)`}
                />
              ))}
            </svg>
          </div>
          
          {/* Small Gear - CSS Animation */}
          <div className="absolute w-32 h-32 bottom-1/4 left-1/4 opacity-30 animate-spin-medium">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="100" cy="100" r="80" fill="#334155" />
              <circle cx="100" cy="100" r="40" fill="#1E293B" />
              {/* Gear teeth */}
              {Array.from({ length: 8 }).map((_, i) => (
                <rect 
                  key={i} 
                  x="90" 
                  y="10" 
                  width="20" 
                  height="30" 
                  fill="#334155" 
                  transform={`rotate(${i * 45} 100 100)`}
                />
              ))}
            </svg>
          </div>
          
          {/* Particles */}
          <div className="particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="absolute w-2 h-2 rounded-full bg-navneet-orange opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${3 + Math.random() * 7}s ease-in-out ${Math.random() * 5}s infinite`
                }}
              ></div>
            ))}
          </div>
        </div>
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

export default VideoHero;
