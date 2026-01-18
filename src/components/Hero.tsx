
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { scrollToSection } from '@/lib/scrollUtils';
import './heroAnimations.css';

const backgroundImage = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop';

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen overflow-hidden pt-24 bg-black">
      {/* Subtle factory background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black z-10"
          aria-hidden="true"
        ></div>

        <img
          src={backgroundImage}
          alt="Manufacturing Facility"
          className="w-full h-full object-cover opacity-30"
        />
      </div>

      {/* Content */}
      <div className="relative z-30 min-h-screen flex items-center py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            {/* Left column - Content */}
            <div className="animate-fade-in">
              {/* Company tagline */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full mb-6 border border-white/10">
                <span className="text-xs text-white/80 font-medium tracking-wide">PRECISION MANUFACTURING</span>
              </div>

              {/* Main heading */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="text-white">Navneet Industries</span>
              </h1>

              {/* Subheading */}
              <p className="text-xl md:text-2xl text-white/70 mb-8 font-light leading-relaxed">
                Advanced plastic manufacturing, custom die making, and precision machine maintenance since 1980
              </p>

              {/* Professional action buttons with blue accent */}
              <div className="flex flex-wrap gap-4 mb-12">
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-6 h-auto text-sm rounded-lg transition-all duration-300"
                  onClick={() => scrollToSection('services')}
                >
                  Our Services <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border border-white/30 text-white hover:bg-white/5 font-medium px-8 py-6 h-auto text-sm rounded-lg transition-all duration-300"
                  onClick={() => scrollToSection('contact')}
                >
                  Contact Us <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Simple stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Precision', value: '±0.01mm' },
                  { label: 'Uptime', value: '99.9%' },
                  { label: 'Service', value: '24/7' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/10">
                    <div className="text-white text-lg font-bold mb-0.5">{stat.value}</div>
                    <div className="text-white/50 text-xs uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column - Founder Image with subtle fade animation */}
            <div className="hidden lg:block">
              <div className="relative founder-fade-animation">
                {/* Simple frosted frame */}
                <div className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10 h-[520px]">
                  <img
                    src="/images/founder.jpg"
                    alt="Santokh Singh - Founder, Navneet Industries"
                    className="w-full h-full object-cover opacity-90"
                    style={{ objectPosition: '50% 25%' }}
                  />

                  {/* Subtle bottom gradient */}
                  <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>

                  {/* Founder info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-white/60 text-xs font-medium tracking-wide uppercase mb-1">Founder & CEO</p>
                    <p className="text-white text-xl font-semibold mb-0.5">Santokh Singh</p>
                    <p className="text-white/50 text-xs">Established 1980</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-25"></div>
    </section>
  );
};

export default Hero;
