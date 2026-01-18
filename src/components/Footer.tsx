
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ArrowRight, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import { scrollToSection } from '@/lib/scrollUtils';
import { useTransition } from '@/contexts/TransitionContext';
import ComingSoonDialog from './ComingSoonDialog';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const { setTransition, setIsTransitioning } = useTransition();
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);

  const handleSectionClick = (sectionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    if (isHomePage) {
      scrollToSection(sectionId);
      if (sectionId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate(`/#${sectionId}`);
    }
  };

  return (
    <footer className="bg-black text-white pt-20 pb-10 relative overflow-hidden border-t border-cyber-cyan/20">
      <ComingSoonDialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog} />

      {/* Volumetric background */}
      <div className="absolute inset-0 gradient-cyber-radial opacity-20"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyber-cyan/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Information */}
          <div>
            <h3 className="text-2xl font-bold mb-6 tracking-wide">
              <span className="text-gradient-cyber">NAVNEET</span>
              <span className="text-white"> INDUSTRIES</span>
            </h3>
            <p className="mb-6 text-white/70 font-light leading-relaxed">
              Precision manufacturing and machine maintenance services trusted by India's leading industrial partners.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="p-3 glass-cyber border border-cyber-cyan/30 hover:border-cyber-cyan/50 rounded-xl transition-all hover:shadow-glow-cyan hover:scale-110"
              >
                <Facebook className="h-5 w-5 text-cyber-cyan" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="p-3 glass-cyber border border-cyber-cyan/30 hover:border-cyber-cyan/50 rounded-xl transition-all hover:shadow-glow-cyan hover:scale-110"
              >
                <Instagram className="h-5 w-5 text-cyber-cyan" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="p-3 glass-cyber border border-cyber-cyan/30 hover:border-cyan/50 rounded-xl transition-all hover:shadow-glow-cyan hover:scale-110"
              >
                <Linkedin className="h-5 w-5 text-cyber-cyan" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="p-3 glass-cyber border border-cyber-cyan/30 hover:border-cyber-cyan/50 rounded-xl transition-all hover:shadow-glow-cyan hover:scale-110"
              >
                <Twitter className="h-5 w-5 text-cyber-cyan" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-wide">Quick Access</h3>
            <ul className="space-y-3 text-white/70">
              <li>
                <a href="#hero" onClick={(e) => handleSectionClick('hero', e)} className="inline-flex items-center hover:text-cyber-cyan transition-colors group">
                  <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" /> Home
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => handleSectionClick('about', e)} className="inline-flex items-center hover:text-cyber-cyan transition-colors group">
                  <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" /> About Us
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleSectionClick('services', e)} className="inline-flex items-center hover:text-cyber-cyan transition-colors group">
                  <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" /> Services
                </a>
              </li>
              <li>
                <a href="#industries" onClick={(e) => handleSectionClick('industries', e)} className="inline-flex items-center hover:text-cyber-cyan transition-colors group">
                  <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" /> Industries
                </a>
              </li>
              <li>
                <a href="#machines" onClick={(e) => handleSectionClick('machines', e)} className="inline-flex items-center hover:text-cyber-cyan transition-colors group">
                  <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" /> Machines
                </a>
              </li>
              <li>
                <a href="#why-choose-us" onClick={(e) => handleSectionClick('why-choose-us', e)} className="inline-flex items-center hover:text-cyber-cyan transition-colors group">
                  <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" /> Why Us
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => handleSectionClick('contact', e)} className="inline-flex items-center hover:text-cyber-cyan transition-colors group">
                  <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" /> Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-wide">Our Systems</h3>
            <ul className="space-y-3 text-white/70">
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setTransition('precision-cap');
                    setIsTransitioning(true);
                    setTimeout(() => navigate('/services/caps'), 1800);
                  }}
                  className="inline-flex items-center hover:text-cyber-cyan transition-colors group"
                >
                  <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" /> Plastic Cap Manufacturing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setTransition('die-making');
                    setIsTransitioning(true);
                    setTimeout(() => navigate('/services/dies'), 1800);
                  }}
                  className="inline-flex items-center hover:text-cyber-cyan transition-colors group"
                >
                  <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" /> Custom Die Making
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setTransition('fix-progress');
                    setIsTransitioning(true);
                    setTimeout(() => navigate('/services/maintenance'), 1800);
                  }}
                  className="inline-flex items-center hover:text-cyber-cyan transition-colors group"
                >
                  <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" /> Machine Maintenance
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
                  className="inline-flex items-center hover:text-cyber-cyan transition-colors group"
                >
                  <ArrowRight className="h-3 w-3 mr-2 group-hover:translate-x-1 transition-transform" /> Machining Operations
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-wide">Contact Info</h3>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start">
                <a
                  href="https://maps.google.com/?q=New+Development+Area,+25/A,+Golmuri,+Jamshedpur,+Jharkhand+831003,+India"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start hover:text-cyber-cyan transition-colors group"
                >
                  <MapPin className="h-5 w-5 mr-3 text-cyber-cyan flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>
                    New Development Area, 25/A, Golmuri<br />
                    Jamshedpur, Jharkhand 831003
                  </span>
                </a>
              </li>
              <li className="flex items-center">
                <a href="tel:+919263391309" className="flex items-center hover:text-cyber-cyan transition-colors group">
                  <Phone className="h-5 w-5 mr-3 text-cyber-cyan flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>+91-9263391309</span>
                </a>
              </li>
              <li className="flex items-center">
                <a href="mailto:navneetindustries@gmail.com" className="flex items-center hover:text-cyber-cyan transition-colors group">
                  <Mail className="h-5 w-5 mr-3 text-cyber-cyan flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <span>navneetindustries@gmail.com</span>
                </a>
              </li>
              <li className="flex items-center">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-cyber-cyan flex-shrink-0" />
                  <span>Mon-Sat: 9:00 AM - 6:00 PM</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-cyber-cyan/20 text-center">
          <p className="text-white/60 font-light">
            © {new Date().getFullYear()} Navneet Industries. All rights reserved. | Precision Manufacturing Systems
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
