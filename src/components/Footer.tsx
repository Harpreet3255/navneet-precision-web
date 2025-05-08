
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navneet-dark text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Company Information */}
          <div>
            <h3 className="text-xl font-bold mb-6">NAVNEET INDUSTRIES</h3>
            <p className="mb-4 text-gray-300">
              Precision manufacturing and machine maintenance services 
              trusted by India's leading industrial partners.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-navneet-orange/20 hover:bg-navneet-orange/40 rounded-full transition-colors">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="p-2 bg-navneet-orange/20 hover:bg-navneet-orange/40 rounded-full transition-colors">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="p-2 bg-navneet-orange/20 hover:bg-navneet-orange/40 rounded-full transition-colors">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" className="p-2 bg-navneet-orange/20 hover:bg-navneet-orange/40 rounded-full transition-colors">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link to="/" className="inline-flex items-center hover:text-navneet-orange transition-colors">
                  <ArrowRight className="h-3 w-3 mr-2" /> Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="inline-flex items-center hover:text-navneet-orange transition-colors">
                  <ArrowRight className="h-3 w-3 mr-2" /> About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="inline-flex items-center hover:text-navneet-orange transition-colors">
                  <ArrowRight className="h-3 w-3 mr-2" /> Services
                </Link>
              </li>
              <li>
                <Link to="/industries" className="inline-flex items-center hover:text-navneet-orange transition-colors">
                  <ArrowRight className="h-3 w-3 mr-2" /> Industries
                </Link>
              </li>
              <li>
                <Link to="/machines" className="inline-flex items-center hover:text-navneet-orange transition-colors">
                  <ArrowRight className="h-3 w-3 mr-2" /> Machines & Workshop
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="inline-flex items-center hover:text-navneet-orange transition-colors">
                  <ArrowRight className="h-3 w-3 mr-2" /> Product Gallery
                </Link>
              </li>
              <li>
                <Link to="/contact" className="inline-flex items-center hover:text-navneet-orange transition-colors">
                  <ArrowRight className="h-3 w-3 mr-2" /> Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-6">Our Services</h3>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link to="/services" className="inline-flex items-center hover:text-navneet-orange transition-colors">
                  <ArrowRight className="h-3 w-3 mr-2" /> Plastic Cap Manufacturing
                </Link>
              </li>
              <li>
                <Link to="/services" className="inline-flex items-center hover:text-navneet-orange transition-colors">
                  <ArrowRight className="h-3 w-3 mr-2" /> Custom Die Making
                </Link>
              </li>
              <li>
                <Link to="/services" className="inline-flex items-center hover:text-navneet-orange transition-colors">
                  <ArrowRight className="h-3 w-3 mr-2" /> Machine Maintenance
                </Link>
              </li>
              <li>
                <Link to="/services" className="inline-flex items-center hover:text-navneet-orange transition-colors">
                  <ArrowRight className="h-3 w-3 mr-2" /> Machining Operations
                </Link>
              </li>
              <li>
                <Link to="/maintenance-portal" className="inline-flex items-center hover:text-navneet-orange transition-colors">
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
                <MapPin className="h-5 w-5 mr-3 text-navneet-orange flex-shrink-0 mt-0.5" />
                <span>
                  Plot No. 123, Industrial Area Phase II<br />
                  Adityapur, Jamshedpur - 831013<br />
                  Jharkhand, India
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-navneet-orange flex-shrink-0" />
                <span>+91 12345 67890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-navneet-orange flex-shrink-0" />
                <span>info@navneetindustries.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-navneet-orange flex-shrink-0" />
                <span>Mon-Sat: 9:00 AM - 6:00 PM</span>
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
