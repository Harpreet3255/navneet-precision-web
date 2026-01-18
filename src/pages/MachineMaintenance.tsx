import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import ServiceDetailHeader from '@/components/ServiceDetailHeader';

const MachineMaintenance = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0');
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    setTimeout(() => {
      const animateElements = document.querySelectorAll('.animate-on-scroll');
      animateElements.forEach(el => {
        el.classList.add('opacity-0');
        observer.observe(el);
      });
    }, 100);

    return () => {
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

      <main className="min-h-screen pt-32 bg-black">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black py-20 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/#services" className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-8 transition-colors group">
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              Back to Services
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-on-scroll">Machine Maintenance</h1>
            <p className="text-2xl text-white/70 max-w-3xl animate-on-scroll font-light">
              Professional on-site repair and maintenance services to minimize downtime and optimize performance
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 p-2 animate-on-scroll">
              <img
                src="/images/services/machine-maintenance.svg"
                alt="Machine maintenance technician"
                className="rounded-xl w-full"
              />
            </div>
            <div>
              <div className="inline-block px-4 py-1 bg-white/5 backdrop-blur-sm rounded-full mb-6 border border-white/10">
                <span className="text-xs text-blue-500 uppercase tracking-widest">Expert Service</span>
              </div>
              <h2 className="text-4xl font-bold mb-8 text-white animate-on-scroll">Comprehensive Maintenance</h2>
              <p className="mb-6 text-white/70 text-lg font-light leading-relaxed animate-on-scroll">
                At Navneet Industries, our skilled technicians provide expert maintenance and repair services for a wide range of industrial machinery. We understand that downtime costs money, which is why we offer responsive service to get your operations back up and running quickly.
              </p>
              <p className="mb-6 text-white/60 text-lg font-light leading-relaxed animate-on-scroll">
                Our preventative maintenance programs help identify potential issues before they become costly problems, extending equipment life and improving operational reliability.
              </p>
              <p className="text-white/60 text-lg font-light leading-relaxed animate-on-scroll">
                Whether you need emergency repairs, scheduled maintenance, or a comprehensive maintenance program, our team has the expertise and tools to keep your machinery operating at peak performance.
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 mb-20 border border-white/10">
            <h2 className="text-4xl font-bold mb-12 text-white">Maintenance Services</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
                <h3 className="font-bold text-xl mb-3 text-white">Preventative Maintenance</h3>
                <p className="text-white/70">Regular inspection and servicing to prevent unexpected breakdowns and extend equipment life.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
                <h3 className="font-bold text-xl mb-3 text-white">Repair Services</h3>
                <p className="text-white/70">Expert troubleshooting and repair of mechanical, electrical, and hydraulic systems.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
                <h3 className="font-bold text-xl mb-3 text-white">Equipment Overhaul</h3>
                <p className="text-white/70">Complete disassembly, inspection, and rebuilding to restore equipment to like-new condition.</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-lg border border-white/10">
              <h3 className="font-bold text-xl mb-4 text-white">Equipment We Service</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside space-y-2 text-white/70">
                  <li>Injection Molding Machines</li>
                  <li>CNC Machine Tools</li>
                  <li>Hydraulic Presses</li>
                  <li>Industrial Pumps and Motors</li>
                </ul>
                <ul className="list-disc list-inside space-y-2 text-white/70">
                  <li>Conveyor Systems</li>
                  <li>Pneumatic Equipment</li>
                  <li>Material Handling Equipment</li>
                  <li>Production Line Machinery</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-12 text-white">Our Maintenance Process</h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
                <div className="bg-blue-500/20 text-blue-500 text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">1</div>
                <h3 className="font-bold text-xl mb-3 text-white">Inspection & Assessment</h3>
                <p className="text-white/70">
                  Thorough evaluation of equipment condition and identification of issues.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
                <div className="bg-blue-500/20 text-blue-500 text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">2</div>
                <h3 className="font-bold text-xl mb-3 text-white">Service Recommendation</h3>
                <p className="text-white/70">
                  Detailed report with recommended repairs, maintenance, and cost estimates.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
                <div className="bg-blue-500/20 text-blue-500 text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">3</div>
                <h3 className="font-bold text-xl mb-3 text-white">Service Execution</h3>
                <p className="text-white/70">
                  Professional repair and maintenance performed by experienced technicians.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-lg">
                <div className="bg-blue-500/20 text-blue-500 text-xl font-bold rounded-full h-12 w-12 flex items-center justify-center mb-4">4</div>
                <h3 className="font-bold text-xl mb-3 text-white">Testing & Validation</h3>
                <p className="text-white/70">
                  Comprehensive testing to ensure equipment functions properly after service.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">Need Reliable Machine Maintenance?</h2>
            <p className="mb-8 text-white/70 max-w-2xl mx-auto text-lg">
              Contact our team today to discuss your maintenance requirements and how we can help keep your operations running smoothly.
            </p>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-sm"
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
