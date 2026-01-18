
import React, { useState } from 'react';

// SVG components for each logo as final fallbacks
const TataLogoSVG = () => (
  <svg width="120" height="70" viewBox="0 0 120 70" xmlns="http://www.w3.org/2000/svg">
    <g>
      <circle cx="35" cy="35" r="25" fill="#00D9FF" opacity="0.2" />
      <path d="M35 15 A20 20 0 0 1 55 35 L35 35 Z" fill="#00D9FF" />
      <path d="M35 55 A20 20 0 0 1 15 35 L35 35 Z" fill="#00D9FF" />
      <text x="70" y="45" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="#00F5FF">TATA</text>
    </g>
  </svg>
);

const RSBLogoSVG = () => (
  <svg width="150" height="70" viewBox="0 0 250 100" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M20,30 L40,30 L50,50 L40,70 L20,70 Z" fill="#00D9FF" opacity="0.3" />
      <circle cx="35" cy="50" r="18" fill="#00D9FF" opacity="0.2" />
      <text x="60" y="45" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="#00F5FF">RSB</text>
      <text x="60" y="65" fontFamily="Arial, sans-serif" fontSize="8" fill="#fff">Where Dreams are Responsibilities</text>
    </g>
  </svg>
);

const RKFLLogoSVG = () => (
  <svg width="200" height="70" viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
    <g>
      <rect x="15" y="20" width="60" height="60" fill="transparent" stroke="#00D9FF" strokeWidth="2" />
      <rect x="25" y="30" width="10" height="10" fill="#00D9FF" />
      <rect x="45" y="30" width="10" height="10" fill="#00D9FF" />
      <rect x="35" y="40" width="10" height="10" fill="#00D9FF" />
      <rect x="55" y="40" width="10" height="10" fill="#00D9FF" />
      <rect x="25" y="50" width="10" height="10" fill="#00D9FF" />
      <rect x="45" y="50" width="10" height="10" fill="#00D9FF" />
      <text x="90" y="35" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#00F5FF">RAMKRISHNA</text>
      <text x="90" y="55" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#00F5FF">FORGINGS</text>
      <text x="90" y="75" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#00F5FF">LIMITED</text>
    </g>
  </svg>
);

const CumminsLogoSVG = () => (
  <svg width="150" height="70" viewBox="0 0 150 70" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M20,15 L70,15 C90,15 90,55 70,55 L20,55 Z" fill="#00D9FF" opacity="0.3" />
      <text x="32" y="40" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="#00F5FF" transform="rotate(-10, 40, 35)">Cummins</text>
    </g>
  </svg>
);

const SiliconLogoSVG = () => (
  <svg width="150" height="70" viewBox="0 0 150 70" xmlns="http://www.w3.org/2000/svg">
    <g>
      <rect x="20" y="20" width="40" height="40" fill="transparent" stroke="#00D9FF" strokeWidth="2" rx="4" />
      <circle cx="40" cy="40" r="15" fill="#00D9FF" opacity="0.2" />
      <text x="70" y="45" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="#00F5FF">SILICON</text>
    </g>
  </svg>
);

// Partner Logo component with enhanced error handling
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

  const renderSvgFallback = () => {
    switch (partner.name) {
      case 'Tata':
        return <TataLogoSVG />;
      case 'RSB':
        return <RSBLogoSVG />;
      case 'Ramkrishna Forgings':
        return <RKFLLogoSVG />;
      case 'Cummins':
        return <CumminsLogoSVG />;
      case 'Silicon':
        return <SiliconLogoSVG />;
      default:
        return <span className="text-white font-medium text-center">{partner.name}</span>;
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      {useMainLogo && (
        <img
          src={partner.logo}
          alt={`${partner.name} Logo`}
          onError={handleMainImageError}
          className="max-h-20 max-w-[180px] object-contain transition-all duration-300 brightness-0 invert opacity-80 group-hover:opacity-100"
        />
      )}

      {useFallbackLogo && partner.fallbackLogo && (
        <img
          src={partner.fallbackLogo}
          alt={`${partner.name} Logo (Fallback)`}
          onError={handleFallbackImageError}
          className="max-h-20 max-w-[180px] object-contain transition-all duration-300 brightness-0 invert opacity-80 group-hover:opacity-100"
        />
      )}

      {useLocalLogo && partner.localLogo && (
        <img
          src={partner.localLogo}
          alt={`${partner.name} Logo (Local)`}
          onError={handleLocalImageError}
          className="max-h-20 max-w-[180px] object-contain transition-all duration-300 brightness-0 invert opacity-80 group-hover:opacity-100"
        />
      )}

      {useSvgFallback && renderSvgFallback()}
    </div>
  );
};

// Updated clients
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
  {
    name: 'Silicon',
    logo: '/images/silicon-logo.jpg',
  },
];

const Partners = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Volumetric background */}
      <div className="absolute inset-0 gradient-cyber-radial opacity-30"></div>
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-6 py-2 glass-cyber rounded-full mb-6 border border-cyber-cyan/30">
            <span className="text-sm text-cyber-cyan font-medium tracking-widest">TRUSTED BY</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-cyber">ESTEEMED</span>
            <span className="text-white"> CLIENTS</span>
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg font-light">
            Partnering with India's leading industrial companies for precision manufacturing and maintenance services
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-stretch gap-8 md:gap-12">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="glass-cyber-strong p-8 md:p-10 rounded-xl border-2 border-cyber-cyan/40 hover:shadow-glow-cyan transition-all duration-500 hover:scale-110 flex items-center justify-center h-[140px] w-[220px] group"
            >
              <PartnerLogo partner={partner} />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-white/60 text-sm font-light">
            Delivering precision engineering and maintenance solutions to industry leaders since 2005
          </p>
        </div>
      </div>
    </section>
  );
};

export default Partners;
