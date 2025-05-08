
import React, { useState, useEffect } from 'react';
import { Menu, X, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

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
          <Link to="/" className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">Home</Link>
          <Link to="/about" className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">About Us</Link>
          <Link to="/services" className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">Services</Link>
          <Link to="/industries" className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">Industries</Link>
          <Link to="/machines" className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">Machines</Link>
          <Link to="/gallery" className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">Gallery</Link>
          <Link to="/contact" className="text-navneet-dark hover:text-navneet-orange font-medium transition-colors">Contact</Link>
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
              <Link to="/" className="text-navneet-dark hover:text-navneet-orange font-medium py-2" onClick={toggleMenu}>Home</Link>
              <Link to="/about" className="text-navneet-dark hover:text-navneet-orange font-medium py-2" onClick={toggleMenu}>About Us</Link>
              <Link to="/services" className="text-navneet-dark hover:text-navneet-orange font-medium py-2" onClick={toggleMenu}>Services</Link>
              <Link to="/industries" className="text-navneet-dark hover:text-navneet-orange font-medium py-2" onClick={toggleMenu}>Industries</Link>
              <Link to="/machines" className="text-navneet-dark hover:text-navneet-orange font-medium py-2" onClick={toggleMenu}>Machines</Link>
              <Link to="/gallery" className="text-navneet-dark hover:text-navneet-orange font-medium py-2" onClick={toggleMenu}>Gallery</Link>
              <Link to="/contact" className="text-navneet-dark hover:text-navneet-orange font-medium py-2" onClick={toggleMenu}>Contact</Link>
              
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
