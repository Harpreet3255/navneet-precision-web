import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import ServiceDetailHeader from '@/components/ServiceDetailHeader';

const PlasticCapManufacturing = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
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
        <title>Plastic Cap Manufacturing - Navneet Industries</title>
        <meta name="description" content="Custom injection molded caps for various industrial applications by Navneet Industries. Eco-friendly protective caps with precise dimensions and high-quality finish." />
      </Helmet>

      <ServiceDetailHeader />

      <main className="min-h-screen pt-32 bg-black">
        <div className="bg-gradient-to-br from-black via-gray-900 to-black py-20 relative overflow-hidden">
          <div className="absolute inset-0 gradient-cyber-radial opacity-30"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <Link to="/#services" className="inline-flex items-center text-cyber-cyan hover:text-cyber-cyan-light mb-8 transition-colors group">
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              BACK TO SYSTEMS
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-gradient-cyber mb-6 animate-on-scroll">PLASTIC CAP MANUFACTURING</h1>
            <p className="text-2xl text-white/70 max-w-3xl animate-on-scroll font-light">
              Custom injection molded caps for advanced industrial applications with eco-friendly precision manufacturing
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="inline-block px-4 py-1 glass-cyber rounded-full mb-6 border border-cyber-cyan/30">
                <span className="text-xs text-cyber-cyan uppercase tracking-widest">Manufacturing Process</span>
              </div>
              <h2 className="text-4xl font-bold mb-8 text-white animate-on-scroll">PRECISION INJECTION MOLDING</h2>
              <p className="mb-6 text-white/70 text-lg font-light leading-relaxed animate-on-scroll">
                At Navneet Industries, we utilize state-of-the-art injection molding technology to produce custom plastic caps that meet the highest standards of quality and precision.
              </p>
              <p className="mb-6 text-white/60 text-lg font-light leading-relaxed animate-on-scroll">
                Our eco-friendly manufacturing process is designed to minimize waste and reduce environmental impact while ensuring consistent product quality. We employ sustainable materials whenever possible, including recycled and biodegradable plastics.
              </p>
              <p className="text-white/60 text-lg font-light leading-relaxed animate-on-scroll">
                Each cap undergoes rigorous quality checks to ensure dimensional accuracy, finish quality, and structural integrity before shipment.
              </p>
            </div>
            <div className="animate-on-scroll glass-cyber-strong rounded-2xl overflow-hidden border-2 border-cyber-cyan/40 shadow-glow-cyan p-2">
              <img src="/images/services/plastic-cap-manufacturing.svg" alt="Plastic injection molding machine" className="rounded-xl w-full" />
            </div>
          </div>

          <div className="glass-cyber-strong rounded-2xl p-12 mb-20 border-2 border-cyber-cyan/40 shadow-glow-cyan relative overflow-hidden animate-on-scroll">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyber-cyan/5 rounded-full blur-3xl"></div>
            <h2 className="text-4xl font-bold mb-12 relative z-10"><span className="text-gradient-cyber">CAP TYPES</span><span className="text-white"> & APPLICATIONS</span></h2>

            <div className="grid md:grid-cols-3 gap-8 mb-12 relative z-10">
              {[
                { title: 'Threaded Caps', desc: 'Precision-engineered threaded caps for bottles, containers, and industrial packaging applications.' },
                { title: 'Protective Caps', desc: 'Durable protective caps for sensitive parts, threaded components, and equipment during shipping and storage.' },
                { title: 'Custom Designs', desc: 'Bespoke cap solutions designed and manufactured to your exact specifications and requirements.' }
              ].map((type, i) => (
                <div key={i} className="glass-cyber p-6 rounded-xl border border-cyber-cyan/30 hover:shadow-glow-cyan transition-all group animate-on-scroll">
                  <h3 className="font-bold text-xl mb-3 text-white uppercase">{type.title}</h3>
                  <p className="text-white/60">{type.desc}</p>
                </div>
              ))}
            </div>

            <div className="glass-cyber p-8 rounded-xl border border-cyber-cyan/30 relative z-10">
              <h3 className="font-bold text-2xl mb-6 text-white uppercase">Materials We Use</h3>
              <ul className="space-y-3 text-white/60">
                <li className="flex items-start"><span className="text-cyber-cyan mr-3 mt-1">▹</span>Polypropylene (PP) - Excellent chemical resistance and durability</li>
                <li className="flex items-start"><span className="text-cyber-cyan mr-3 mt-1">▹</span>High-Density Polyethylene (HDPE) - Strong and impact-resistant</li>
                <li className="flex items-start"><span className="text-cyber-cyan mr-3 mt-1">▹</span>Low-Density Polyethylene (LDPE) - Flexible and economical</li>
                <li className="flex items-start"><span className="text-cyber-cyan mr-3 mt-1">▹</span>Recycled Plastics - Environmentally friendly options</li>
                <li className="flex items-start"><span className="text-cyber-cyan mr-3 mt-1">▹</span>Biodegradable Polymers - For eco-conscious applications</li>
              </ul>
            </div>
          </div>

          <div className="mb-20">
            <div className="inline-block px-4 py-1 glass-cyber rounded-full mb-6 border border-cyber-cyan/30">
              <span className="text-xs text-cyber-cyan uppercase tracking-widest">Quality Control</span>
            </div>
            <h2 className="text-4xl font-bold mb-8 text-white animate-on-scroll"><span className="text-gradient-cyber">QUALITY</span><span className="text-white"> ASSURANCE</span></h2>
            <p className="mb-10 text-white/70 text-lg animate-on-scroll font-light">
              Every batch of caps undergoes our comprehensive quality control process to ensure they meet both our standards and your specifications:
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: 'Dimensional Inspection', desc: 'We verify all critical dimensions using precision measurement tools to ensure consistent fit and function.' },
                { title: 'Visual Inspection', desc: 'Each cap is examined for surface defects, color consistency, and cosmetic quality.' },
                { title: 'Functional Testing', desc: 'We test caps for proper fit, thread engagement, and sealing capabilities when applicable.' },
                { title: 'Material Certification', desc: 'Documentation of material compliance with industry standards and regulatory requirements.' }
              ].map((qa, i) => (
                <div key={i} className="glass-cyber-strong p-8 rounded-xl border-2 border-cyber-cyan/40 hover:shadow-glow-cyan transition-all animate-on-scroll">
                  <h3 className="font-bold text-2xl mb-4 text-white uppercase">{qa.title}</h3>
                  <p className="text-white/60 font-light">{qa.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center glass-cyber-strong p-16 rounded-2xl border-2 border-cyber-cyan/40 shadow-glow-cyan">
            <h2 className="text-4xl font-bold mb-6"><span className="text-gradient-cyber">READY TO DISCUSS</span><span className="text-white"> YOUR CAP REQUIREMENTS?</span></h2>
            <p className="mb-10 text-white/70 text-lg max-w-2xl mx-auto font-light">
              Contact our specialized team to discuss how our plastic cap manufacturing capabilities can meet your specific needs.
            </p>
            <Button
              className="glass-cyber border-2 border-cyber-cyan/50 hover:border-cyber-cyan text-white px-12 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-glow-cyan hover:shadow-glow-cyan-lg"
              onClick={() => { window.location.href = '/#contact'; }}
            >
              REQUEST QUOTE
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PlasticCapManufacturing;
