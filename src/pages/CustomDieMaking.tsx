
import React from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import ServiceDetailHeader from '@/components/ServiceDetailHeader';

const CustomDieMaking = () => {
  return (
    <>
      <Helmet>
        <title>Custom Die Making - Navneet Industries</title>
        <meta name="description" content="High-precision plastic mold dies designed and manufactured to your exact specifications with exceptional durability by Navneet Industries." />
      </Helmet>

      <ServiceDetailHeader />
      
      <main className="min-h-screen pt-24">
        <div className="bg-navneet-orange/10 py-12">
          <div className="container mx-auto px-4">
            <Link to="/#services" className="inline-flex items-center text-navneet-dark hover:text-navneet-orange mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Services
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-navneet-dark mb-6">Custom Die Making</h1>
            <p className="text-xl text-navneet-gray max-w-3xl">
              High-precision plastic mold dies designed and manufactured to your exact specifications with exceptional durability.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1626208465488-56bb695c67ce?q=80&w=1470&auto=format&fit=crop" 
                alt="Custom die manufacturing machinery"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Precision Die Manufacturing</h2>
              <p className="mb-4 text-navneet-gray">
                At Navneet Industries, we specialize in the design and fabrication of high-precision dies for plastic injection molding. Our expert engineers and technicians collaborate closely with clients to develop dies that deliver exceptional performance, longevity, and dimensional accuracy.
              </p>
              <p className="mb-4 text-navneet-gray">
                Using advanced CNC machining centers and precision grinding equipment, we create dies that meet the most demanding specifications for complex components and high-volume production.
              </p>
              <p className="text-navneet-gray">
                Our comprehensive die-making capabilities ensure that your plastic molding projects achieve optimal results in terms of part quality, cycle time, and production efficiency.
              </p>
            </div>
          </div>

          <div className="bg-navneet-light rounded-lg p-8 mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Our Die-Making Process</h2>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-navneet-orange/10 text-navneet-orange text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">1</div>
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Design Consultation</h3>
                <p className="text-navneet-gray">Collaborative design process to define specifications and optimize die performance.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-navneet-orange/10 text-navneet-orange text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">2</div>
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">3D Modeling</h3>
                <p className="text-navneet-gray">Advanced CAD design to create precise digital models of the die components.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-navneet-orange/10 text-navneet-orange text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">3</div>
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Precision Machining</h3>
                <p className="text-navneet-gray">Multi-axis CNC machining to create components with tight tolerances.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="bg-navneet-orange/10 text-navneet-orange text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">4</div>
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Testing & Validation</h3>
                <p className="text-navneet-gray">Thorough testing to ensure die performance meets all specifications.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-xl mb-3 text-navneet-dark">Die Materials & Treatments</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside space-y-2 text-navneet-gray">
                  <li>Tool Steel (P20, H13, D2)</li>
                  <li>Stainless Steel Components</li>
                  <li>High-performance Alloys</li>
                  <li>Beryllium Copper Inserts</li>
                </ul>
                <ul className="list-disc list-inside space-y-2 text-navneet-gray">
                  <li>Heat Treatment & Tempering</li>
                  <li>Surface Hardening</li>
                  <li>PVD Coating for Extended Life</li>
                  <li>Polishing to Mirror Finish</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Die Types We Manufacture</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Single-Cavity Dies</h3>
                <p className="text-navneet-gray">
                  Precision dies for producing single parts with exceptional detail and consistency.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Multi-Cavity Dies</h3>
                <p className="text-navneet-gray">
                  Efficient dies for high-volume production with consistent quality across all cavities.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Family Mold Dies</h3>
                <p className="text-navneet-gray">
                  Complex dies that produce multiple different parts in a single production cycle.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Need Custom Dies for Your Project?</h2>
            <p className="mb-8 text-navneet-gray max-w-2xl mx-auto">
              Contact our team today to discuss your custom die requirements and how we can help bring your project to life.
            </p>
            <Button 
              scrollTo="contact"
              className="bg-navneet-orange hover:bg-navneet-orange/90 text-white px-8 py-3"
            >
              Contact Our Die Experts
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default CustomDieMaking;
