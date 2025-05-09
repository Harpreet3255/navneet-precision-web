
import React from 'react';

// Updated partners with actual brand logos that are more reliable
const partners = [
  { name: 'Tata', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg' },
  { name: 'RSB', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP_VIJzFLOLO-yiQb3j3D1m3LMvj60i-7YG8IQugmLxg&s' },
  { name: 'RKFL', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg4YhVMzfzHFnWLfHYqR0nGufNwMq_wX-vxr5J0xWCYA&s' },
  { name: 'Cummins', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Cummins_logo.svg/2560px-Cummins_logo.svg.png' },
  { name: 'Silicon', logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBUn1nvcVyX7WWG1mlvCj5xlLXg-S0mqeZ7g&s' },
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
