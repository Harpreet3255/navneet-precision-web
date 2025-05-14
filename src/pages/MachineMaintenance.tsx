import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import ServiceDetailHeader from '@/components/ServiceDetailHeader';

const MachineMaintenance = () => {
  // Add animation classes to elements as they come into view
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Remove opacity-0 and add the animation class
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    // Wait a bit for the DOM to be fully rendered
    setTimeout(() => {
      // Select all elements to animate
      const animateElements = document.querySelectorAll('.animate-on-scroll');
      animateElements.forEach(el => {
        // Add opacity-0 to hide elements initially
        el.classList.add('opacity-0');
        observer.observe(el);
      });
    }, 100);

    return () => {
      // Clean up the observer
      const animateElements = document.querySelectorAll('.animate-on-scroll');
      animateElements.forEach(el => observer.unobserve(el));
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Machine Maintenance - Navneet Industries</title>
        <meta name="description" content="Professional on-site repair and maintenance services for industrial machinery by Navneet Industries. Minimize downtime and optimize performance." />
      </Helmet>

      <ServiceDetailHeader />

      <main className="min-h-screen pt-32">
        <div className="bg-navneet-orange/10 py-12">
          <div className="container mx-auto px-4">
            <Link to="/#services" className="inline-flex items-center text-navneet-dark hover:text-navneet-orange mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Services
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-navneet-dark mb-6 animate-on-scroll">Machine Maintenance</h1>
            <p className="text-xl text-navneet-gray max-w-3xl animate-on-scroll">
              Professional on-site repair and maintenance services for industrial machinery to minimize downtime and optimize performance.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark animate-on-scroll">Comprehensive Machine Maintenance</h2>
              <p className="mb-4 text-navneet-gray animate-on-scroll">
                At Navneet Industries, our skilled technicians provide expert maintenance and repair services for a wide range of industrial machinery. We understand that downtime costs money, which is why we offer responsive service to get your operations back up and running quickly.
              </p>
              <p className="mb-4 text-navneet-gray animate-on-scroll">
                Our preventative maintenance programs help identify potential issues before they become costly problems, extending equipment life and improving operational reliability.
              </p>
              <p className="text-navneet-gray animate-on-scroll">
                Whether you need emergency repairs, scheduled maintenance, or a comprehensive maintenance program, our team has the expertise and tools to keep your machinery operating at peak performance.
              </p>
            </div>
            <div>
              <img
                src="/images/services/machine-maintenance.svg"
                alt="Machine maintenance technician"
                className="rounded-lg shadow-lg w-full animate-on-scroll"
              />
            </div>
          </div>

          <div className="bg-navneet-light rounded-lg p-8 mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Maintenance Services</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Preventative Maintenance</h3>
                <p className="text-navneet-gray">Regular inspection and servicing to prevent unexpected breakdowns and extend equipment life.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Repair Services</h3>
                <p className="text-navneet-gray">Expert troubleshooting and repair of mechanical, electrical, and hydraulic systems.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Equipment Overhaul</h3>
                <p className="text-navneet-gray">Complete disassembly, inspection, and rebuilding to restore equipment to like-new condition.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-bold text-xl mb-3 text-navneet-dark">Equipment We Service</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside space-y-2 text-navneet-gray">
                  <li>Injection Molding Machines</li>
                  <li>CNC Machine Tools</li>
                  <li>Hydraulic Presses</li>
                  <li>Industrial Pumps and Motors</li>
                </ul>
                <ul className="list-disc list-inside space-y-2 text-navneet-gray">
                  <li>Conveyor Systems</li>
                  <li>Pneumatic Equipment</li>
                  <li>Material Handling Equipment</li>
                  <li>Production Line Machinery</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Our Maintenance Process</h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <div className="bg-navneet-orange/10 text-navneet-orange text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">1</div>
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Inspection & Assessment</h3>
                <p className="text-navneet-gray">
                  Thorough evaluation of equipment condition and identification of issues.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <div className="bg-navneet-orange/10 text-navneet-orange text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">2</div>
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Service Recommendation</h3>
                <p className="text-navneet-gray">
                  Detailed report with recommended repairs, maintenance, and cost estimates.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <div className="bg-navneet-orange/10 text-navneet-orange text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">3</div>
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Service Execution</h3>
                <p className="text-navneet-gray">
                  Professional repair and maintenance performed by experienced technicians.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg">
                <div className="bg-navneet-orange/10 text-navneet-orange text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">4</div>
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Testing & Validation</h3>
                <p className="text-navneet-gray">
                  Comprehensive testing to ensure equipment functions properly after service.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Need Reliable Machine Maintenance?</h2>
            <p className="mb-8 text-navneet-gray max-w-2xl mx-auto">
              Contact our team today to discuss your maintenance requirements and how we can help keep your operations running smoothly.
            </p>
            <Button
              className="bg-navneet-orange hover:bg-navneet-orange/90 text-white px-8 py-3"
              onClick={() => {
                window.location.href = '/#contact';
              }}
            >
              Schedule a Service Call
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default MachineMaintenance;
