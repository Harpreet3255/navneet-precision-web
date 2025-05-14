
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
    <header className="fixed w-full z-50 transition-all duration-300 bg-white shadow-md">
      {/* Top bar with contact info */}
      <div className="hidden md:block bg-navneet-dark text-white py-2">
        <div className="container mx-auto px-4 flex justify-end items-center space-x-6">
          <a href="tel:+919263391309" className="flex items-center text-white hover:text-navneet-orange transition-colors text-sm">
            <Phone size={14} className="mr-2" />
            <span>+91-9263391309</span>
          </a>
          <a href="mailto:navneetindustries@gmail.com" className="flex items-center text-white hover:text-navneet-orange transition-colors text-sm">
            <Mail size={14} className="mr-2" />
            <span>navneetindustries@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold text-navneet-dark">
            NAVNEET <span className="text-navneet-orange">INDUSTRIES</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center">
          <div className="flex space-x-1">
            <div className="relative px-1">
              <button
                onClick={() => navigate('/')}
                className="font-medium transition-colors px-4 py-2 rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                Home
              </button>
            </div>
            <div className="relative px-1">
              <button
                onClick={() => handleNavClick('about')}
                className="font-medium transition-colors px-4 py-2 rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                About Us
              </button>
            </div>
            <div className="relative px-1">
              <button
                onClick={() => handleNavClick('services')}
                className="font-medium transition-colors px-4 py-2 rounded-md text-white bg-navneet-orange"
              >
                Services
              </button>
            </div>
            <div className="relative px-1">
              <button
                onClick={() => handleNavClick('industries')}
                className="font-medium transition-colors px-4 py-2 rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                Industries
              </button>
            </div>
            <div className="relative px-1">
              <button
                onClick={() => handleNavClick('machines')}
                className="font-medium transition-colors px-4 py-2 rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                Machines
              </button>
            </div>
            <div className="relative px-1">
              <button
                onClick={() => handleNavClick('why-choose-us')}
                className="font-medium transition-colors px-4 py-2 rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                Why Us
              </button>
            </div>
            <div className="relative px-1">
              <button
                onClick={() => handleNavClick('contact')}
                className="font-medium transition-colors px-4 py-2 rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                Contact
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile contact info - shown in mobile menu */}
        <div className="hidden"></div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-navneet-dark" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => navigate('/')}
                className="font-medium py-3 px-4 text-left rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className="font-medium py-3 px-4 text-left rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                About Us
              </button>
              <button
                onClick={() => handleNavClick('services')}
                className="font-medium py-3 px-4 text-left rounded-md bg-navneet-orange text-white"
              >
                Services
              </button>
              <button
                onClick={() => handleNavClick('industries')}
                className="font-medium py-3 px-4 text-left rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                Industries
              </button>
              <button
                onClick={() => handleNavClick('machines')}
                className="font-medium py-3 px-4 text-left rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                Machines
              </button>
              <button
                onClick={() => handleNavClick('why-choose-us')}
                className="font-medium py-3 px-4 text-left rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                Why Us
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className="font-medium py-3 px-4 text-left rounded-md text-navneet-dark hover:bg-navneet-orange/10"
              >
                Contact
              </button>

              <div className="mt-4 pt-4 border-t border-gray-200 bg-navneet-dark/5 rounded-lg p-4">
                <h3 className="font-semibold text-navneet-dark mb-3">Contact Us</h3>
                <a href="tel:+919263391309" className="flex items-center text-navneet-dark hover:text-navneet-orange py-2">
                  <Phone size={16} className="mr-2 text-navneet-orange" />
                  <span>+91-9263391309</span>
                </a>
                <a href="mailto:navneetindustries@gmail.com" className="flex items-center text-navneet-dark hover:text-navneet-orange py-2">
                  <Mail size={16} className="mr-2 text-navneet-orange" />
                  <span>navneetindustries@gmail.com</span>
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
