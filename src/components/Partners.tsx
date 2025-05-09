
import React from 'react';

// Updated partners with actual brand logos
const partners = [
  { name: 'Tata', logo: 'https://www.logotaglines.com/wp-content/uploads/2022/12/Tata-Logo-Tagline-Slogan-Owner-480x480.jpg' },
  { name: 'RSB', logo: 'https://www.rsbglobal.com/images/footer-logo.png' },
  { name: 'RKFL', logo: 'https://yt3.googleusercontent.com/ytc/APkrFKZh3LVoMPBFx2ikWCS7_UvMtdSqF0qq_WKVJb4j=s900-c-k-c0x00ffffff-no-rj' },
  { name: 'Cummins', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Cummins_logo.svg/2560px-Cummins_logo.svg.png' },
  { name: 'Silicon', logo: 'https://siliconlogyindia.com/images/logo.png' },
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
