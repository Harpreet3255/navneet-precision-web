
import React from 'react';
import { Helmet } from 'react-helmet';
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

const Index = () => {
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
          <Hero />
          <Partners />
          <AboutSection />
          <ServicesSection />
          <IndustriesSection />
          <MachinesSection />
          <WhyChooseUsSection />
          <ContactSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
