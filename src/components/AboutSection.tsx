
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Clock, Users } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="py-32 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Volumetric lighting */}
      <div className="absolute inset-0 gradient-cyber-radial opacity-30"></div>
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl animate-glass-float"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl animate-glass-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Image with futuristic frame */}
          <div className="relative group">
            <div className="absolute inset-0 bg-cyber-cyan/20 rounded-2xl blur-2xl group-hover:bg-cyber-cyan/30 transition-all duration-500"></div>
            <div className="glass-cyber-strong rounded-2xl overflow-hidden border-2 border-cyber-cyan/40 shadow-glow-cyan group-hover:shadow-glow-cyan-lg transition-all duration-500 relative z-10">
              <img
                src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=1740&auto=format&fit=crop"
                alt="Advanced Manufacturing Facility"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Content */}
          <div className="animate-slide-in">
            <div className="inline-block px-6 py-2 glass-cyber rounded-full mb-6 border border-cyber-cyan/30">
              <span className="text-sm text-cyber-cyan font-medium tracking-widest">ABOUT US</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="text-gradient-cyber">Navneet</span>
              <span className="text-white"> Industries</span>
            </h2>

            <p className="text-xl text-white/70 leading-relaxed mb-12 font-light">
              Founded in Jamshedpur, we've established ourselves as pioneers in precision manufacturing,
              delivering cutting-edge solutions to India's leading industrial partners with unmatched
              technical excellence and rapid deployment capabilities.
            </p>

            {/* Core values - Futuristic cards */}
            <div className="grid grid-cols-1 gap-6 mb-12">
              <div className="glass-cyber p-6 rounded-xl flex items-start hover:shadow-glow-cyan transition-all duration-300 border border-cyber-cyan/30 group">
                <div className="mr-5 p-4 bg-cyber-cyan/10 rounded-xl group-hover:bg-cyber-cyan/20 transition-all border border-cyber-cyan/30">
                  <Shield className="h-7 w-7 text-cyber-cyan" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">RELIABILITY</h3>
                  <p className="text-white/60 font-light">Quality systems that exceed industry standards</p>
                </div>
              </div>

              <div className="glass-cyber p-6 rounded-xl flex items-start hover:shadow-glow-cyan transition-all duration-300 border border-cyber-cyan/30 group">
                <div className="mr-5 p-4 bg-cyber-cyan/10 rounded-xl group-hover:bg-cyber-cyan/20 transition-all border border-cyber-cyan/30">
                  <Clock className="h-7 w-7 text-cyber-cyan" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">RAPID DEPLOYMENT</h3>
                  <p className="text-white/60 font-light">Optimized processes for accelerated timelines</p>
                </div>
              </div>

              <div className="glass-cyber p-6 rounded-xl flex items-start hover:shadow-glow-cyan transition-all duration-300 border border-cyber-cyan/30 group">
                <div className="mr-5 p-4 bg-cyber-cyan/10 rounded-xl group-hover:bg-cyber-cyan/20 transition-all border border-cyber-cyan/30">
                  <Users className="h-7 w-7 text-cyber-cyan" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-white">TRUSTED PARTNER</h3>
                  <p className="text-white/60 font-light">Strategic relationships with India's industrial leaders</p>
                </div>
              </div>
            </div>

            <Button className="glass-cyber border-2 border-cyber-cyan/50 hover:border-cyber-cyan text-white px-10 py-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-glow-cyan hover:shadow-glow-cyan-lg">
              LEARN MORE
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
