
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ArrowRight, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { scrollToSection } from '@/lib/scrollUtils';

const Footer = () => {
  // Function to handle section navigation
  const handleSectionClick = (sectionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    scrollToSection(sectionId);
    // Scroll to top if clicking on home
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-navneet-dark text-white pt-16 pb-8">
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
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('services');
                    // You could add additional logic here to scroll to specific service
                    const serviceElement = document.getElementById('plastic-cap-manufacturing');
                    if (serviceElement) serviceElement.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Plastic Cap Manufacturing
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('services');
                    // You could add additional logic here to scroll to specific service
                    const serviceElement = document.getElementById('custom-die-making');
                    if (serviceElement) serviceElement.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Custom Die Making
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('services');
                    // You could add additional logic here to scroll to specific service
                    const serviceElement = document.getElementById('machine-maintenance');
                    if (serviceElement) serviceElement.scrollIntoView({ behavior: 'smooth' });
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
                    scrollToSection('services');
                    // You could add additional logic here to scroll to specific service
                    const serviceElement = document.getElementById('machining-operations');
                    if (serviceElement) serviceElement.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Machining Operations
                </a>
              </li>
              <li>
                <Link
                  to="/maintenance-portal"
                  className="inline-flex items-center hover:text-navneet-orange transition-colors"
                >
                  <ArrowRight className="h-3 w-3 mr-2" /> Client Maintenance Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-6">Contact Information</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <a
                  href="https://maps.google.com/?q=Plot+No.+123,+Industrial+Area+Phase+II,+Adityapur,+Jamshedpur+-+831013,+Jharkhand,+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start hover:text-navneet-orange transition-colors"
                >
                  <MapPin className="h-5 w-5 mr-3 text-navneet-orange flex-shrink-0 mt-0.5" />
                  <span>
                    Plot No. 123, Industrial Area Phase II<br />
                    Adityapur, Jamshedpur - 831013<br />
                    Jharkhand, India
                  </span>
                </a>
              </li>
              <li className="flex items-center">
                <a
                  href="tel:+911234567890"
                  className="flex items-center hover:text-navneet-orange transition-colors"
                >
                  <Phone className="h-5 w-5 mr-3 text-navneet-orange flex-shrink-0" />
                  <span>+91 12345 67890</span>
                </a>
              </li>
              <li className="flex items-center">
                <a
                  href="mailto:info@navneetindustries.com"
                  className="flex items-center hover:text-navneet-orange transition-colors"
                >
                  <Mail className="h-5 w-5 mr-3 text-navneet-orange flex-shrink-0" />
                  <span>info@navneetindustries.com</span>
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
