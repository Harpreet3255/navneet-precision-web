
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { scrollToSection } from '@/lib/scrollUtils';

const Header = () => {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);

      const sections = ['hero', 'about', 'services', 'industries', 'machines', 'why-choose-us', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 300 && rect.bottom >= 300;
        }
        return false;
      }) || 'hero';

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setActiveSection(sectionId);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      {/* Glassmorphism Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-white">
              NAVNEET <span className="text-white/90">INDUSTRIES</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center">
            <div className="flex space-x-1">
              {[
                { id: 'hero', label: 'Home' },
                { id: 'about', label: 'About Us' },
                { id: 'services', label: 'Services' },
                { id: 'industries', label: 'Industries' },
                { id: 'machines', label: 'Machines' },
                { id: 'why-choose-us', label: 'Why Us' },
                { id: 'contact', label: 'Contact' }
              ].map((item) => (
                <div key={item.id} className="relative px-1">
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`font-medium transition-all duration-300 px-4 py-2 rounded-lg ${activeSection === item.id
                      ? 'text-white bg-blue-500/80'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                  >
                    {item.label}
                  </button>
                </div>
              ))}

              {/* Admin Button */}
              <div className="relative px-1">
                <Link
                  to="/admin"
                  className="font-medium transition-all duration-300 px-4 py-2 rounded-lg bg-blue-500/80 text-white hover:bg-blue-500"
                >
                  Admin
                </Link>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white hover:scale-110 transition-transform" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-2">
              {[
                { id: 'hero', label: 'Home' },
                { id: 'about', label: 'About Us' },
                { id: 'services', label: 'Services' },
                { id: 'industries', label: 'Industries' },
                { id: 'machines', label: 'Machines' },
                { id: 'why-choose-us', label: 'Why Us' },
                { id: 'contact', label: 'Contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="font-medium py-3 px-4 text-left rounded-lg transition-all duration-300 text-white/80 hover:text-white hover:bg-white/10"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
