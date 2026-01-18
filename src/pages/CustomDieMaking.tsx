import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Footer from '@/components/Footer';
import ServiceDetailHeader from '@/components/ServiceDetailHeader';

const CustomDieMaking = () => {
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
        <title>Custom Die Making - Navneet Industries</title>
        <meta name="description" content="High-precision plastic mold dies designed and manufactured to your exact specifications with exceptional durability by Navneet Industries." />
      </Helmet>

      <ServiceDetailHeader />

      <main className="min-h-screen pt-32 bg-black">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-black via-gray-900 to-black py-20 relative overflow-hidden">


          <div className="container mx-auto px-4 relative z-10">
            <Link to="/#services" className="inline-flex items-center text-blue-500 hover:text-blue-400 mb-8 transition-colors group">
              <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              BACK TO SYSTEMS
            </Link>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-on-scroll">Custom Die Making</h1>
            <p className="text-2xl text-white/70 max-w-3xl animate-on-scroll font-light">
              High-precision plastic mold dies engineered to exact specifications with exceptional durability
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 p-2 animate-on-scroll">
              <img
                src="/images/services/custom-die-making.svg"
                alt="Custom die manufacturing machinery"
                className="rounded-xl w-full"
              />
            </div>
            <div>
              <div className="inline-block px-4 py-1 bg-white/5 backdrop-blur-sm rounded-full mb-6 border border-white/10">
                <span className="text-xs text-blue-500 uppercase tracking-widest">Precision Engineering</span>
              </div>
              <h2 className="text-4xl font-bold mb-8 text-white animate-on-scroll">PRECISION DIE MANUFACTURING</h2>
              <p className="mb-6 text-white/70 text-lg font-light leading-relaxed animate-on-scroll">
                At Navneet Industries, we specialize in the design and fabrication of high-precision dies for plastic injection molding. Our expert engineers and technicians collaborate closely with clients to develop dies that deliver exceptional performance, longevity, and dimensional accuracy.
              </p>
              <p className="mb-6 text-white/60 text-lg font-light leading-relaxed animate-on-scroll">
                Using advanced CNC machining centers and precision grinding equipment, we create dies that meet the most demanding specifications for complex components and high-volume production.
              </p>
              <p className="text-white/60 text-lg font-light leading-relaxed animate-on-scroll">
                Our comprehensive die-making capabilities ensure optimal results in terms of part quality, cycle time, and production efficiency.
              </p>
            </div>
          </div>

          <div className="glass-cyber-strong rounded-2xl p-12 mb-20 border-2 border-cyber-cyan/40 shadow-glow-cyan relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-cyber-cyan/5 rounded-full blur-3xl"></div>
            <h2 className="text-4xl font-bold mb-12 relative z-10">
              <span className="text-gradient-cyber">DIE-MAKING</span>
              <span className="text-white"> PROCESS</span>
            </h2>

            <div className="grid md:grid-cols-4 gap-6 mb-12 relative z-10">
              {[
                { num: '01', title: 'Design Consultation', desc: 'Collaborative design process to define specifications and optimize die performance.' },
                { num: '02', title: '3D Modeling', desc: 'Advanced CAD design to create precise digital models of the die components.' },
                { num: '03', title: 'Precision Machining', desc: 'Multi-axis CNC machining to create components with tight tolerances.' },
                { num: '04', title: 'Testing & Validation', desc: 'Thorough testing to ensure die performance meets all specifications.' }
              ].map((step, i) => (
                <div key={i} className="glass-cyber p-6 rounded-xl border border-cyber-cyan/30 hover:shadow-glow-cyan transition-all group">
                  <div className="text-cyber-cyan text-3xl font-bold mb-4 group-hover:scale-110 transition-transform">{step.num}</div>
                  <h3 className="font-bold text-lg mb-3 text-white uppercase">{step.title}</h3>
                  <p className="text-white/60 text-sm font-light">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="glass-cyber p-8 rounded-xl border border-cyber-cyan/30 relative z-10">
              <h3 className="font-bold text-2xl mb-6 text-white uppercase">Die Materials & Treatments</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-cyber-cyan font-semibold mb-4 uppercase text-sm">Materials</h4>
                  <ul className="space-y-2 text-white/60">
                    <li className="flex items-center"><span className="text-cyber-cyan mr-2">▹</span>Tool Steel (P20, H13, D2)</li>
                    <li className="flex items-center"><span className="text-cyber-cyan mr-2">▹</span>Stainless Steel Components</li>
                    <li className="flex items-center"><span className="text-cyber-cyan mr-2">▹</span>High-performance Alloys</li>
                    <li className="flex items-center"><span className="text-cyber-cyan mr-2">▹</span>Beryllium Copper Inserts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-cyber-cyan font-semibold mb-4 uppercase text-sm">Treatments</h4>
                  <ul className="space-y-2 text-white/60">
                    <li className="flex items-center"><span className="text-cyber-cyan mr-2">▹</span>Heat Treatment & Tempering</li>
                    <li className="flex items-center"><span className="text-cyber-cyan mr-2">▹</span>Surface Hardening</li>
                    <li className="flex items-center"><span className="text-cyber-cyan mr-2">▹</span>PVD Coating for Extended Life</li>
                    <li className="flex items-center"><span className="text-cyber-cyan mr-2">▹</span>Polishing to Mirror Finish</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-20">
            <h2 className="text-4xl font-bold mb-12 text-white">
              <span className="text-gradient-cyber">DIE TYPES</span>
              <span className="text-white"> WE MANUFACTURE</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Single-Cavity Dies', desc: 'Precision dies for producing single parts with exceptional detail and consistency.' },
                { title: 'Multi-Cavity Dies', desc: 'Efficient dies for high-volume production with consistent quality across all cavities.' },
                { title: 'Family Mold Dies', desc: 'Complex dies that produce multiple different parts in a single production cycle.' }
              ].map((type, i) => (
                <div key={i} className="glass-cyber-strong p-8 rounded-xl border-2 border-cyber-cyan/40 hover:shadow-glow-cyan transition-all">
                  <h3 className="font-bold text-2xl mb-4 text-white uppercase">{type.title}</h3>
                  <p className="text-white/60 font-light leading-relaxed">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center glass-cyber-strong p-16 rounded-2xl border-2 border-cyber-cyan/40 shadow-glow-cyan">
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-gradient-cyber">NEED CUSTOM DIES</span>
              <span className="text-white"> FOR YOUR PROJECT?</span>
            </h2>
            <p className="mb-10 text-white/70 text-lg max-w-2xl mx-auto font-light">
              Contact our specialized team to discuss your custom die requirements and advanced manufacturing solutions.
            </p>
            <Button
              className="glass-cyber border-2 border-cyber-cyan/50 hover:border-cyber-cyan text-white px-12 py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-glow-cyan hover:shadow-glow-cyan-lg"
              onClick={() => {
                window.location.href = '/#contact';
              }}
            >
              CONTACT DIE SPECIALISTS
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CustomDieMaking;
