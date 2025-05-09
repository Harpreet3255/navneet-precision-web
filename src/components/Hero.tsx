
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Updated slider images with industrial machinery and plastic cap image
const sliderImages = [
  'public/lovable-uploads/c0cd5f04-6f5a-4596-9930-a834cc66d247.png', // Plastic cap image
  'https://images.unsplash.com/photo-1582415892521-eee0c3115e7c?q=80&w=1662&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507646227500-4d389b0012be?q=80&w=1470&auto=format&fit=crop',
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev === sliderImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section id="hero" className="relative h-screen overflow-hidden">
      {/* Slider Images */}
      {sliderImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="absolute inset-0 bg-navneet-dark opacity-60 z-10"
            aria-hidden="true"
          ></div>
          <img
            src={image}
            alt={`${index === 0 ? 'Navneet Industries - Plastic Caps' : `Navneet Industries - Slide ${index + 1}`}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Content overlay */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
              Precision in Every Cap. <br />
              <span className="text-navneet-orange">Trust in Every Turn.</span>
            </h1>
            <p className="text-lg md:text-xl text-white mb-8 max-w-xl">
              Specialized in plastic cap production, custom die making, and machine maintenance services 
              for India's leading industrial partners.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="bg-navneet-orange hover:bg-navneet-orange/90 text-white"
                scrollTo="services"
              >
                Our Services <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-navneet-dark"
                scrollTo="contact"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Slider indicators */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
        <div className="flex space-x-2">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-navneet-orange' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
