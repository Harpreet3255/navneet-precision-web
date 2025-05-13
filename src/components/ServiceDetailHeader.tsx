
import React from 'react';
import { Menu, X, Mail, Phone } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ServiceDetailHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (sectionId: string) => {
    // Navigate to homepage and then scroll to section
    navigate('/');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed w-full z-50 transition-all duration-300 bg-white shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center gap-4">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-navneet-dark">
            NAVNEET <span className="text-navneet-orange">INDUSTRIES</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => navigate('/')}
            className="font-medium transition-colors text-navneet-dark hover:text-navneet-orange"
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('about')}
            className="font-medium transition-colors text-navneet-dark hover:text-navneet-orange"
          >
            About Us
          </button>
          <button
            onClick={() => handleNavClick('services')}
            className="font-medium transition-colors text-navneet-dark hover:text-navneet-orange"
          >
            Services
          </button>
          <button
            onClick={() => handleNavClick('industries')}
            className="font-medium transition-colors text-navneet-dark hover:text-navneet-orange"
          >
            Industries
          </button>
          <button
            onClick={() => handleNavClick('machines')}
            className="font-medium transition-colors text-navneet-dark hover:text-navneet-orange"
          >
            Machines
          </button>
          <button
            onClick={() => handleNavClick('why-choose-us')}
            className="font-medium transition-colors text-navneet-dark hover:text-navneet-orange"
          >
            Why Us
          </button>
          <button
            onClick={() => handleNavClick('contact')}
            className="font-medium transition-colors text-navneet-dark hover:text-navneet-orange"
          >
            Contact
          </button>
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
                onClick={() => navigate('/')}
                className="font-medium py-2 text-left text-navneet-dark hover:text-navneet-orange"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className="font-medium py-2 text-left text-navneet-dark hover:text-navneet-orange"
              >
                About Us
              </button>
              <button
                onClick={() => handleNavClick('services')}
                className="font-medium py-2 text-left text-navneet-dark hover:text-navneet-orange"
              >
                Services
              </button>
              <button
                onClick={() => handleNavClick('industries')}
                className="font-medium py-2 text-left text-navneet-dark hover:text-navneet-orange"
              >
                Industries
              </button>
              <button
                onClick={() => handleNavClick('machines')}
                className="font-medium py-2 text-left text-navneet-dark hover:text-navneet-orange"
              >
                Machines
              </button>
              <button
                onClick={() => handleNavClick('why-choose-us')}
                className="font-medium py-2 text-left text-navneet-dark hover:text-navneet-orange"
              >
                Why Us
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className="font-medium py-2 text-left text-navneet-dark hover:text-navneet-orange"
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

export default ServiceDetailHeader;
