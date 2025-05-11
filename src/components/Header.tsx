
import React, { useState, useEffect } from 'react';
import { Menu, X, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { scrollToSection } from '@/lib/scrollUtils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Function to determine which section is currently in view
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        'hero',
        'about',
        'services',
        'industries',
        'machines',
        'why-choose-us',
        'contact'
      ];

      // Find the section that is currently in view
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Consider a section in view if its top is within the top half of the viewport
          return rect.top <= 300 && rect.bottom >= 300;
        }
        return false;
      }) || 'hero';

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setActiveSection(sectionId);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      className="fixed w-full z-50 transition-all duration-300 bg-white shadow-md py-4"
    >
      <div className="container mx-auto px-4 flex justify-between items-center gap-4">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-navneet-dark">
            NAVNEET <span className="text-navneet-orange">INDUSTRIES</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <div className="relative">
            <button
              onClick={() => handleNavClick('hero')}
              className={`font-medium transition-colors ${activeSection === 'hero' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
            >
              Home
            </button>
            {activeSection === 'hero' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-navneet-orange"></div>}
          </div>
          <div className="relative">
            <button
              onClick={() => handleNavClick('about')}
              className={`font-medium transition-colors ${activeSection === 'about' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
            >
              About Us
            </button>
            {activeSection === 'about' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-navneet-orange"></div>}
          </div>
          <div className="relative">
            <button
              onClick={() => handleNavClick('services')}
              className={`font-medium transition-colors ${activeSection === 'services' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
            >
              Services
            </button>
            {activeSection === 'services' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-navneet-orange"></div>}
          </div>
          <div className="relative">
            <button
              onClick={() => handleNavClick('industries')}
              className={`font-medium transition-colors ${activeSection === 'industries' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
            >
              Industries
            </button>
            {activeSection === 'industries' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-navneet-orange"></div>}
          </div>
          <div className="relative">
            <button
              onClick={() => handleNavClick('machines')}
              className={`font-medium transition-colors ${activeSection === 'machines' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
            >
              Machines
            </button>
            {activeSection === 'machines' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-navneet-orange"></div>}
          </div>
          <div className="relative">
            <button
              onClick={() => handleNavClick('why-choose-us')}
              className={`font-medium transition-colors ${activeSection === 'why-choose-us' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
            >
              Why Us
            </button>
            {activeSection === 'why-choose-us' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-navneet-orange"></div>}
          </div>
          <div className="relative">
            <button
              onClick={() => handleNavClick('contact')}
              className={`font-medium transition-colors ${activeSection === 'contact' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
            >
              Contact
            </button>
            {activeSection === 'contact' && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-navneet-orange"></div>}
          </div>
        </nav>

        {/* Contact Info for Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="tel:+911234567890" className="flex items-center text-navneet-dark hover:text-navneet-orange">
            <Phone size={16} className="mr-2" />
            <span>+91 12345 67890</span>
          </a>
          <a href="mailto:info@navneetindustries.com" className="flex items-center text-navneet-dark hover:text-navneet-orange">
            <Mail size={16} className="mr-2" />
            <span>info@navneetindustries.com</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-navneet-dark" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => handleNavClick('hero')}
                className={`font-medium py-2 text-left ${activeSection === 'hero' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className={`font-medium py-2 text-left ${activeSection === 'about' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
              >
                About Us
              </button>
              <button
                onClick={() => handleNavClick('services')}
                className={`font-medium py-2 text-left ${activeSection === 'services' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
              >
                Services
              </button>
              <button
                onClick={() => handleNavClick('industries')}
                className={`font-medium py-2 text-left ${activeSection === 'industries' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
              >
                Industries
              </button>
              <button
                onClick={() => handleNavClick('machines')}
                className={`font-medium py-2 text-left ${activeSection === 'machines' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
              >
                Machines
              </button>
              <button
                onClick={() => handleNavClick('why-choose-us')}
                className={`font-medium py-2 text-left ${activeSection === 'why-choose-us' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
              >
                Why Us
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className={`font-medium py-2 text-left ${activeSection === 'contact' ? 'text-navneet-orange' : 'text-navneet-dark hover:text-navneet-orange'}`}
              >
                Contact
              </button>

              <div className="pt-4 border-t border-gray-200">
                <a href="tel:+911234567890" className="flex items-center text-navneet-dark hover:text-navneet-orange py-2">
                  <Phone size={16} className="mr-2" />
                  <span>+91 12345 67890</span>
                </a>
                <a href="mailto:info@navneetindustries.com" className="flex items-center text-navneet-dark hover:text-navneet-orange py-2">
                  <Mail size={16} className="mr-2" />
                  <span>info@navneetindustries.com</span>
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
