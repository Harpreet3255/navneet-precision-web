
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ArrowRight, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { scrollToSection } from '@/lib/scrollUtils';
import { useTransition, TransitionType } from '@/contexts/TransitionContext';
import ComingSoonDialog from './ComingSoonDialog';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const { setTransition, setIsTransitioning } = useTransition();
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);

  // Function to handle section navigation
  const handleSectionClick = (sectionId: string, event: React.MouseEvent) => {
    event.preventDefault();

    if (isHomePage) {
      // If on homepage, just scroll to the section
      scrollToSection(sectionId);
      // Scroll to top if clicking on home
      if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // If on another page, navigate to homepage with hash
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <footer className="bg-navneet-dark text-white pt-16 pb-8">
      <ComingSoonDialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog} />
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Information */}
          <div>
            <h3 className="text-xl font-bold mb-6">NAVNEET INDUSTRIES</h3>
            <p className="mb-4 text-gray-300">
              Precision manufacturing and machine maintenance services
              trusted by India's leading industrial partners.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-2 bg-navneet-orange/20 hover:bg-navneet-orange/40 rounded-full transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-2 bg-navneet-orange/20 hover:bg-navneet-orange/40 rounded-full transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-2 bg-navneet-orange/20 hover:bg-navneet-orange/40 rounded-full transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="p-2 bg-navneet-orange/20 hover:bg-navneet-orange/40 rounded-full transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <a
                  href="#hero"
                  onClick={(e) => handleSectionClick('hero', e)}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleSectionClick('about', e)}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> About Us
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleSectionClick('services', e)}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Services
                </a>
              </li>
              <li>
                <a
                  href="#industries"
                  onClick={(e) => handleSectionClick('industries', e)}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Industries
                </a>
              </li>
              <li>
                <a
                  href="#machines"
                  onClick={(e) => handleSectionClick('machines', e)}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Machines & Workshop
                </a>
              </li>
              <li>
                <a
                  href="#why-choose-us"
                  onClick={(e) => handleSectionClick('why-choose-us', e)}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Why Choose Us
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleSectionClick('contact', e)}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-6">Our Services</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setTransition('precision-cap');
                    setIsTransitioning(true);
                    setTimeout(() => {
                      navigate('/services/caps');
                    }, 1800);
                  }}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Plastic Cap Manufacturing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setTransition('die-making');
                    setIsTransitioning(true);
                    setTimeout(() => {
                      navigate('/services/dies');
                    }, 1800);
                  }}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Custom Die Making
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setTransition('fix-progress');
                    setIsTransitioning(true);
                    setTimeout(() => {
                      navigate('/services/maintenance');
                    }, 1800);
                  }}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Machine Maintenance
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    if (isHomePage) {
                      scrollToSection('services');
                      const serviceElement = document.getElementById('machining-operations');
                      if (serviceElement) serviceElement.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      navigate('/#services');
                    }
                  }}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Machining Operations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMaintenanceDialog(true);
                  }}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Client Maintenance Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-6">Contact Information</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <a
                  href="https://maps.google.com/?q=New+Development+Area,+25/A,+Golmuri,+Jamshedpur,+Jharkhand+831003,+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start hover:text-navneet-orange transition-colors"
                >
                  <MapPin className="h-5 w-5 mr-3 text-navneet-orange flex-shrink-0 mt-0.5" />
                  <span>
                    New Development Area, 25/A, Golmuri<br />
                    Jamshedpur, Jharkhand 831003<br />
                    India
                  </span>
                </a>
              </li>
              <li className="flex items-center">
                <a
                  href="tel:+919263391309"
                  className="flex items-center hover:text-navneet-orange transition-colors"
                >
                  <Phone className="h-5 w-5 mr-3 text-navneet-orange flex-shrink-0" />
                  <span>+91-9263391309</span>
                </a>
              </li>
              <li className="flex items-center">
                <a
                  href="mailto:navneetindustries@gmail.com"
                  className="flex items-center hover:text-navneet-orange transition-colors"
                >
                  <Mail className="h-5 w-5 mr-3 text-navneet-orange flex-shrink-0" />
                  <span>navneetindustries@gmail.com</span>
                </a>
              </li>
              <li className="flex items-center">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-navneet-orange flex-shrink-0" />
                  <span>Mon-Sat: 9:00 AM - 6:00 PM</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Navneet Industries. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
