
import React from 'react';

// Placeholder for partner logos
const partners = [
  { name: 'Tata', logo: '/placeholder.svg' },
  { name: 'RSB', logo: '/placeholder.svg' },
  { name: 'RKFL', logo: '/placeholder.svg' },
  { name: 'Cummins', logo: '/placeholder.svg' },
  { name: 'Silicon', logo: '/placeholder.svg' },
];

const Partners = () => {
  return (
    <section className="py-12 bg-navneet-light">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
          Trusted by Industry Leaders
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {partners.map((partner) => (
            <div 
              key={partner.name} 
              className="grayscale hover:grayscale-0 transition-all duration-300"
            >
              <img 
                src={partner.logo} 
                alt={`${partner.name} Logo`} 
                className="h-12 md:h-16 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
