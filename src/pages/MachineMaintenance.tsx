
import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

const MachineMaintenance = () => {
  return (
    <>
      <Helmet>
        <title>Machine Maintenance Services - Navneet Industries</title>
        <meta name="description" content="Professional on-site repair and maintenance services for industrial machinery to minimize downtime and optimize performance by Navneet Industries." />
      </Helmet>

      <Header />
      
      <main className="min-h-screen">
        <div className="bg-navneet-orange/10 py-12">
          <div className="container mx-auto px-4">
            <Link to="/#services" className="inline-flex items-center text-navneet-dark hover:text-navneet-orange mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Services
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-navneet-dark mb-6">Machine Maintenance</h1>
            <p className="text-xl text-navneet-gray max-w-3xl">
              Professional on-site repair and maintenance services for industrial machinery to minimize downtime and optimize performance.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Comprehensive Maintenance Solutions</h2>
              <p className="mb-4 text-navneet-gray">
                At Navneet Industries, we understand that equipment downtime can severely impact your production and bottom line. Our skilled technicians provide comprehensive maintenance services designed to keep your machinery running at peak efficiency.
              </p>
              <p className="mb-4 text-navneet-gray">
                With decades of combined experience, our maintenance team can service a wide range of industrial machinery, from manufacturing equipment to specialized tools and systems.
              </p>
              <p className="text-navneet-gray">
                We pride ourselves on quick response times, thorough diagnostics, and effective solutions that minimize downtime and extend the lifespan of your valuable equipment.
              </p>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1581093806997-124204d9fa9d?q=80&w=1470&auto=format&fit=crop" 
                alt="Industrial machinery maintenance"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>

          <div className="bg-navneet-light rounded-lg p-8 mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Our Maintenance Services</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Preventive Maintenance</h3>
                <p className="text-navneet-gray mb-4">
                  Regular scheduled maintenance to prevent unexpected breakdowns and extend equipment life.
                </p>
                <ul className="list-disc list-inside space-y-1 text-navneet-gray">
                  <li>Scheduled inspections and adjustments</li>
                  <li>Lubrication and fluid checks</li>
                  <li>Component replacements before failure</li>
                  <li>Performance testing and calibration</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Corrective Maintenance</h3>
                <p className="text-navneet-gray mb-4">
                  Rapid response repairs to address equipment failures and restore operation quickly.
                </p>
                <ul className="list-disc list-inside space-y-1 text-navneet-gray">
                  <li>Emergency repair services</li>
                  <li>Fault diagnosis and troubleshooting</li>
                  <li>Component replacement</li>
                  <li>System restoration and testing</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Predictive Maintenance</h3>
                <p className="text-navneet-gray mb-4">
                  Advanced monitoring techniques to identify potential issues before they cause failures.
                </p>
                <ul className="list-disc list-inside space-y-1 text-navneet-gray">
                  <li>Vibration analysis</li>
                  <li>Thermal imaging</li>
                  <li>Oil analysis</li>
                  <li>Performance trend monitoring</li>
                </ul>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Equipment Upgrades</h3>
                <p className="text-navneet-gray mb-4">
                  Modernization and enhancement of existing machinery to improve performance and reliability.
                </p>
                <ul className="list-disc list-inside space-y-1 text-navneet-gray">
                  <li>Control system upgrades</li>
                  <li>Efficiency improvements</li>
                  <li>Safety enhancement installations</li>
                  <li>Component modernization</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Industries We Serve</h2>
            <p className="mb-6 text-navneet-gray">
              Our maintenance teams have experience across a wide range of industrial sectors:
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Manufacturing</h3>
                <p className="text-navneet-gray">
                  Production lines, assembly equipment, and factory machinery maintenance.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Automotive</h3>
                <p className="text-navneet-gray">
                  Specialized equipment for automotive component production and assembly.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Metal Fabrication</h3>
                <p className="text-navneet-gray">
                  Presses, shears, bending machines, and welding equipment.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Plastic Processing</h3>
                <p className="text-navneet-gray">
                  Injection molding machines, extruders, and thermoforming equipment.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Food & Beverage</h3>
                <p className="text-navneet-gray">
                  Processing equipment, packaging lines, and sanitary machinery.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">General Industry</h3>
                <p className="text-navneet-gray">
                  General industrial equipment, utilities, and facility machinery.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Ready to Optimize Your Machinery Performance?</h2>
            <p className="mb-8 text-navneet-gray max-w-2xl mx-auto">
              Contact our maintenance team today to schedule a service or discuss a customized maintenance plan for your equipment.
            </p>
            <Button 
              scrollTo="contact"
              className="bg-navneet-orange hover:bg-navneet-orange/90 text-white px-8 py-3"
            >
              Schedule Maintenance Service
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default MachineMaintenance;
