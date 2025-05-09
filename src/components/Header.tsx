
import React, { useState, useEffect } from 'react';
import { Menu, X, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { scrollToSection } from '@/lib/scrollUtils';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-navneet-dark">
            NAVNEET <span className="text-navneet-orange">INDUSTRIES</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <button onClick={() => handleNavClick('hero')} className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">Home</button>
          <button onClick={() => handleNavClick('about')} className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">About Us</button>
          <button onClick={() => handleNavClick('services')} className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">Services</button>
          <button onClick={() => handleNavClick('industries')} className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">Industries</button>
          <button onClick={() => handleNavClick('machines')} className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">Machines</button>
          <button onClick={() => handleNavClick('contact')} className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">Contact</button>
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
              <button onClick={() => handleNavClick('hero')} className="text-navneet-dark hover:text-navneet-orange font-medium py-2 text-left">Home</button>
              <button onClick={() => handleNavClick('about')} className="text-navneet-dark hover:text-navneet-orange font-medium py-2 text-left">About Us</button>
              <button onClick={() => handleNavClick('services')} className="text-navneet-dark hover:text-navneet-orange font-medium py-2 text-left">Services</button>
              <button onClick={() => handleNavClick('industries')} className="text-navneet-dark hover:text-navneet-orange font-medium py-2 text-left">Industries</button>
              <button onClick={() => handleNavClick('machines')} className="text-navneet-dark hover:text-navneet-orange font-medium py-2 text-left">Machines</button>
              <button onClick={() => handleNavClick('contact')} className="text-navneet-dark hover:text-navneet-orange font-medium py-2 text-left">Contact</button>
              
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
