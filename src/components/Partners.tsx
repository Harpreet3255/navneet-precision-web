
import React, { useState } from 'react';

// SVG components for each logo as final fallbacks
const TataLogoSVG = () => (
  <svg width="120" height="70" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
    <g>
      <circle cx="35" cy="35" r="25" fill="#2B5AA0" />
      <path d="M35 15 A20 20 0 0 1 55 35 L35 35 Z" fill="white" />
      <path d="M35 55 A20 20 0 0 1 15 35 L35 35 Z" fill="white" />
      <path d="M35 15 A20 20 0 0 0 15 35 L35 35 Z" fill="#2B5AA0" />
      <path d="M35 55 A20 20 0 0 0 55 35 L35 35 Z" fill="#2B5AA0" />
      <text x="70" y="45" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="#2B5AA0">TATA</text>
    </g>
  </svg>
);

const RSBLogoSVG = () => (
  <svg width="150" height="70" viewBox="0 0 250 100" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M20,30 L40,30 L50,50 L40,70 L20,70 Z" fill="#E31937" />
      <circle cx="35" cy="50" r="18" fill="#2B5AA0" />
      <path d="M35 35 A15 15 0 0 1 50 50 A15 15 0 0 1 35 65 A15 15 0 0 1 20 50 A15 15 0 0 1 35 35 Z" fill="#2B5AA0" />
      <path d="M25 40 L45 40 M25 50 L45 50 M25 60 L45 60" stroke="white" strokeWidth="1.5" />
      <text x="60" y="45" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#2B5AA0">RSB</text>
      <text x="60" y="65" fontFamily="Arial, sans-serif" fontSize="8" fill="#000">Where Dreams are Responsibilities</text>
    </g>
  </svg>
);

const RKFLLogoSVG = () => (
  <svg width="200" height="70" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
    <g>
      <rect x="15" y="20" width="60" height="60" fill="white" stroke="#2B5AA0" strokeWidth="1" />
      <rect x="25" y="30" width="10" height="10" fill="#2B5AA0" />
      <rect x="45" y="30" width="10" height="10" fill="#2B5AA0" />
      <rect x="35" y="40" width="10" height="10" fill="#2B5AA0" />
      <rect x="55" y="40" width="10" height="10" fill="#2B5AA0" />
      <rect x="25" y="50" width="10" height="10" fill="#2B5AA0" />
      <rect x="45" y="50" width="10" height="10" fill="#2B5AA0" />
      <text x="90" y="35" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#2B5AA0">RAMKRISHNA</text>
      <text x="90" y="55" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#2B5AA0">FORGINGS</text>
      <text x="90" y="75" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#2B5AA0">LIMITED</text>
    </g>
  </svg>
);

const CumminsLogoSVG = () => (
  <svg width="150" height="70" viewBox="0 0 150 70" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M20,15 L70,15 C90,15 90,55 70,55 L20,55 Z" fill="#E31937" />
      <path d="M30,25 C35,25 40,25 45,25 C50,25 55,30 55,35 C55,40 50,45 45,45 C40,45 35,45 30,45 L30,25 Z" fill="#E31937" stroke="white" strokeWidth="0.5" />
      <text x="32" y="40" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="white" transform="rotate(-10, 40, 35)">Cummins</text>
    </g>
  </svg>
);

// Partner Logo component with enhanced error handling for image loading
interface PartnerLogoProps {
  partner: {
    name: string;
    logo: string;
    fallbackLogo?: string;
    localLogo?: string;
  };
}

const PartnerLogo: React.FC<PartnerLogoProps> = ({ partner }) => {
  const [useMainLogo, setUseMainLogo] = useState(true);
  const [useFallbackLogo, setUseFallbackLogo] = useState(false);
  const [useLocalLogo, setUseLocalLogo] = useState(false);
  const [useSvgFallback, setUseSvgFallback] = useState(false);

  const handleMainImageError = () => {
    setUseMainLogo(false);
    if (partner.localLogo) {
      setUseLocalLogo(true);
    } else if (partner.fallbackLogo) {
      setUseFallbackLogo(true);
    } else {
      setUseSvgFallback(true);
    }
  };

  const handleFallbackImageError = () => {
    setUseFallbackLogo(false);
    if (partner.localLogo) {
      setUseLocalLogo(true);
    } else {
      setUseSvgFallback(true);
    }
  };
  
  const handleLocalImageError = () => {
    setUseLocalLogo(false);
    setUseSvgFallback(true);
  };

  // Render SVG fallback based on partner name
  const renderSvgFallback = () => {
    switch(partner.name) {
      case 'Tata':
        return <TataLogoSVG />;
      case 'RSB':
        return <RSBLogoSVG />;
      case 'Ramkrishna Forgings':
        return <RKFLLogoSVG />;
      case 'Cummins':
        return <CumminsLogoSVG />;
      default:
        return <span className="text-navneet-dark font-medium text-center">{partner.name}</span>;
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      {useMainLogo && (
        <img
          src={partner.logo}
          alt={`${partner.name} Logo`}
          onError={handleMainImageError}
          className="max-h-20 max-w-[180px] object-contain transition-all duration-300"
        />
      )}

      {useFallbackLogo && partner.fallbackLogo && (
        <img
          src={partner.fallbackLogo}
          alt={`${partner.name} Logo (Fallback)`}
          onError={handleFallbackImageError}
          className="max-h-20 max-w-[180px] object-contain transition-all duration-300"
        />
      )}
      
      {useLocalLogo && partner.localLogo && (
        <img
          src={partner.localLogo}
          alt={`${partner.name} Logo (Local)`}
          onError={handleLocalImageError}
          className="max-h-20 max-w-[180px] object-contain transition-all duration-300"
        />
      )}

      {useSvgFallback && renderSvgFallback()}
    </div>
  );
};

// Updated clients with local image fallback options
const partners = [
  {
    name: 'Tata',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Tata_logo.svg',
    fallbackLogo: 'https://www.tata.com/content/dam/tata/images/home-page/desktop/logo_desktop_tata-logo.svg',
    localLogo: '/images/tata-logo.jpg'
  },
  {
    name: 'RSB',
    logo: 'https://www.rsbglobal.co.in/images/logo.png',
    fallbackLogo: 'https://static.wixstatic.com/media/c17d42_e1e2c3e1a1c94d2e9b2f5ee0d3ad0b6a~mv2.png',
    localLogo: '/images/rsb-logo.jpg'
  },
  {
    name: 'Ramkrishna Forgings',
    logo: 'https://www.ramkrishnaforgings.com/images/logo.png',
    fallbackLogo: 'https://www.bseindia.com/include/images/Ramkrishna_Forgings_Ltd.png',
    localLogo: '/images/rkfl-logo.jpg'
  },
  {
    name: 'Cummins',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Cummins_logo.svg/1280px-Cummins_logo.svg.png',
    fallbackLogo: 'https://www.cummins.com/sites/default/files/styles/logo_image/public/2022-01/Cummins_Logo_Global_2021_Red_RGB.jpg',
    localLogo: '/images/cummins-logo.jpg'
  },
];

const Partners = () => {
  return (
    <section className="py-20 bg-navneet-light border-b border-gray-200 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 border border-gray-400 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 border border-gray-400 rounded-full"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-navneet-dark mb-2">
            Our Esteemed Clients
          </h2>
          <div className="w-20 h-1 bg-navneet-orange mx-auto mb-4"></div>
          <p className="text-navneet-gray max-w-2xl mx-auto">
            We're proud to partner with India's leading industrial companies, providing precision manufacturing and maintenance services.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-stretch gap-8 md:gap-12 lg:gap-16">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="bg-white p-6 md:p-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center h-[120px] sm:h-[140px] w-[180px] sm:w-[220px]"
            >
              <PartnerLogo partner={partner} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-navneet-gray text-sm">
            Delivering precision engineering and maintenance solutions to these industry leaders since 2005
          </p>
        </div>
      </div>
    </section>
  );
};

export default Partners;
