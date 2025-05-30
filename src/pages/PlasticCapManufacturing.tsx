import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import ServiceDetailHeader from '@/components/ServiceDetailHeader';

const PlasticCapManufacturing = () => {
  // Scroll to top when component mounts and add animation classes
  useEffect(() => {
    // Scroll to top when the page loads
    window.scrollTo(0, 0);

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
        <title>Plastic Cap Manufacturing - Navneet Industries</title>
        <meta name="description" content="Custom injection molded caps for various industrial applications by Navneet Industries. Eco-friendly protective caps with precise dimensions and high-quality finish." />
      </Helmet>

      <ServiceDetailHeader />

      <main className="min-h-screen pt-32">
        <div className="bg-navneet-orange/10 py-12">
          <div className="container mx-auto px-4">
            <Link to="/#services" className="inline-flex items-center text-navneet-dark hover:text-navneet-orange mb-6 transition-colors">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Services
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-navneet-dark mb-6 animate-on-scroll">Plastic Cap Manufacturing</h1>
            <p className="text-xl text-navneet-gray max-w-3xl animate-on-scroll">
              Custom injection molded caps for various industrial applications. We produce eco-friendly protective caps with precise dimensions and high-quality finish, designed to reduce environmental impact.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark animate-on-scroll">Our Plastic Cap Manufacturing Process</h2>
              <p className="mb-4 text-navneet-gray animate-on-scroll">
                At Navneet Industries, we utilize state-of-the-art injection molding technology to produce custom plastic caps that meet the highest standards of quality and precision.
              </p>
              <p className="mb-4 text-navneet-gray animate-on-scroll">
                Our eco-friendly manufacturing process is designed to minimize waste and reduce environmental impact while ensuring consistent product quality. We employ sustainable materials whenever possible, including recycled and biodegradable plastics.
              </p>
              <p className="text-navneet-gray animate-on-scroll">
                Each cap undergoes rigorous quality checks to ensure dimensional accuracy, finish quality, and structural integrity before shipment.
              </p>
            </div>
            <div className="animate-on-scroll">
              <img
                src="/images/services/plastic-cap-manufacturing.svg"
                alt="Plastic injection molding machine"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>

          <div className="bg-navneet-light rounded-lg p-8 mb-16 animate-on-scroll">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Cap Types and Applications</h2>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm animate-on-scroll">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Threaded Caps</h3>
                <p className="text-navneet-gray">Precision-engineered threaded caps for bottles, containers, and industrial packaging applications.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm animate-on-scroll">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Protective Caps</h3>
                <p className="text-navneet-gray">Durable protective caps for sensitive parts, threaded components, and equipment during shipping and storage.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm animate-on-scroll">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Custom Designs</h3>
                <p className="text-navneet-gray">Bespoke cap solutions designed and manufactured to your exact specifications and requirements.</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm animate-on-scroll">
              <h3 className="font-bold text-xl mb-3 text-navneet-dark">Materials We Use</h3>
              <ul className="list-disc list-inside space-y-2 text-navneet-gray">
                <li>Polypropylene (PP) - Excellent chemical resistance and durability</li>
                <li>High-Density Polyethylene (HDPE) - Strong and impact-resistant</li>
                <li>Low-Density Polyethylene (LDPE) - Flexible and economical</li>
                <li>Recycled Plastics - Environmentally friendly options</li>
                <li>Biodegradable Polymers - For eco-conscious applications</li>
              </ul>
            </div>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark animate-on-scroll">Quality Assurance</h2>
            <p className="mb-6 text-navneet-gray animate-on-scroll">
              Every batch of caps undergoes our comprehensive quality control process to ensure they meet both our standards and your specifications:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-navneet-orange/20 p-6 rounded-lg animate-on-scroll">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Dimensional Inspection</h3>
                <p className="text-navneet-gray">
                  We verify all critical dimensions using precision measurement tools to ensure consistent fit and function.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg animate-on-scroll">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Visual Inspection</h3>
                <p className="text-navneet-gray">
                  Each cap is examined for surface defects, color consistency, and cosmetic quality.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg animate-on-scroll">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Functional Testing</h3>
                <p className="text-navneet-gray">
                  We test caps for proper fit, thread engagement, and sealing capabilities when applicable.
                </p>
              </div>
              <div className="border border-navneet-orange/20 p-6 rounded-lg animate-on-scroll">
                <h3 className="font-bold text-xl mb-3 text-navneet-dark">Material Certification</h3>
                <p className="text-navneet-gray">
                  Documentation of material compliance with industry standards and regulatory requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center animate-on-scroll">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navneet-dark">Ready to Discuss Your Cap Requirements?</h2>
            <p className="mb-8 text-navneet-gray max-w-2xl mx-auto">
              Contact our team today to discuss how our plastic cap manufacturing capabilities can meet your specific needs.
            </p>
            <Button
              className="bg-navneet-orange hover:bg-navneet-orange/90 text-white px-8 py-3"
              onClick={() => {
                // Navigate to home page and scroll to contact section
                window.location.href = '/#contact';
              }}
            >
              Request a Quote
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PlasticCapManufacturing;
