
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight } from 'lucide-react';

// Using the industrial machinery image as the main background
// Using a direct URL to the image that closely matches the dark industrial machinery theme with gears
const backgroundImage = 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?q=80&w=2070&auto=format&fit=crop';

const Hero = () => {
  return (
    <section id="hero" className="relative h-screen overflow-hidden pt-16">
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

      {/* Content overlay */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl animate-fade-in">
            <div className="inline-block bg-navneet-orange/90 text-white text-sm font-medium py-1 px-3 rounded mb-4">
              Leading Manufacturer in India
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Engineering Excellence. <br />
              <span className="text-navneet-orange">Precision Craftsmanship.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl leading-relaxed">
              Specialized in precision manufacturing, custom die making, and industrial machinery maintenance
              for India's leading industrial partners.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                className="bg-navneet-orange hover:bg-navneet-orange/90 text-white font-medium px-6 py-2.5 h-auto"
                scrollTo="services"
              >
                Our Services <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-navneet-dark font-medium px-6 py-2.5 h-auto"
                scrollTo="contact"
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

export default Hero;
