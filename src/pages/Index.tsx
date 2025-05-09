
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Partners from '@/components/Partners';
import AboutSection from '@/components/AboutSection';
import ServicesSection from '@/components/ServicesSection';
import IndustriesSection from '@/components/IndustriesSection';
import MachinesSection from '@/components/MachinesSection';
import WhyChooseUsSection from '@/components/WhyChooseUsSection';
import ContactSection from '@/components/ContactSection';
import Footer from '@/components/Footer';
import { scrollToSection } from '@/lib/scrollUtils';

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if there's a hash in the URL and scroll to that section
    if (location.hash) {
      const sectionId = location.hash.substring(1); // Remove the # character
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 100);
    }
  }, [location]);

  return (
    <>
      <Helmet>
        <title>Navneet Industries - Precision Manufacturing & Machine Maintenance Services</title>
        <meta name="description" content="Navneet Industries is a trusted small-scale manufacturing company based in Jamshedpur, India, specializing in plastic cap production, custom die making, and machine maintenance services." />
        <meta name="keywords" content="plastic cap manufacturing, custom die making, machine maintenance, Jamshedpur, industrial manufacturing, precision engineering" />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content="Navneet Industries - Precision Manufacturing & Machine Maintenance Services" />
        <meta property="og:description" content="Trusted by Tata, RSB, RKFL, Cummins, and Silicon for reliability, precision, and quick turnaround time." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://navneetindustries.com" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://navneetindustries.com" />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Hero /> {/* Already has id="hero" */}
          <Partners />
          <div id="about">
            <AboutSection />
          </div>
          {/* Services section already has id="services" */}
          <ServicesSection />
          {/* Industries section already has id="industries" */}
          <IndustriesSection />
          {/* Machines section already has id="machines" */}
          <MachinesSection />
          <div id="why-choose-us">
            <WhyChooseUsSection />
          </div>
          <div id="contact">
            <ContactSection />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
