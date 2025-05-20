import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '@/components/Footer';
import ServiceDetailHeader from '@/components/ServiceDetailHeader';

const MaintenancePortal = () => {
  return (
    <>
      <Helmet>
        <title>Client Maintenance Portal - Navneet Industries</title>
        <meta name="description" content="Client maintenance portal for Navneet Industries customers to track and manage maintenance services." />
      </Helmet>

      <ServiceDetailHeader />

      <main className="min-h-screen pt-32">
        <div className="bg-navneet-orange/10 py-12">
          <div className="container mx-auto px-4">
            <Link to="/#services" className="inline-flex items-center text-navneet-dark hover:text-navneet-orange mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Services
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-navneet-dark mb-6 animate-on-scroll">Client Maintenance Portal</h1>
            <p className="text-xl text-navneet-gray max-w-3xl animate-on-scroll">
              Track and manage your maintenance services with our dedicated client portal.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="bg-navneet-orange/10 p-12 rounded-lg mb-8">
              <h2 className="text-3xl font-bold text-navneet-dark mb-4">Coming Soon!</h2>
              <p className="text-xl text-navneet-gray mb-6">
                We're currently developing our client maintenance portal to provide you with a seamless experience for tracking and managing your maintenance services.
              </p>
              <p className="text-navneet-gray mb-8">
                The portal will allow you to schedule maintenance visits, track service history, access maintenance reports, and communicate directly with our service team.
              </p>
              <div className="flex justify-center">
                <Link
                  to="/#contact"
                  className="bg-navneet-orange hover:bg-navneet-orange/90 text-white px-8 py-3 rounded-md transition-colors"
                >
                  Contact Us for Maintenance Services
                </Link>
              </div>
            </div>
            
            <p className="text-navneet-gray">
              For immediate assistance with maintenance services, please contact our team at{' '}
              <a href="tel:+919263391309" className="text-navneet-orange hover:underline">+91-9263391309</a> or{' '}
              <a href="mailto:navneetindustries@gmail.com" className="text-navneet-orange hover:underline">navneetindustries@gmail.com</a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default MaintenancePortal;
