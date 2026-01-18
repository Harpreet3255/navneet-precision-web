
import React from 'react';
import { Clock, Award, Users, TrendingUp, CheckCheck } from 'lucide-react';

const reasons = [
  {
    icon: Clock,
    title: "Rapid Response System",
    description: "Advanced monitoring and rapid deployment protocols ensure minimal downtime in critical industrial operations."
  },
  {
    icon: Award,
    title: "Industry Excellence",
    description: "Decades of specialized experience delivering precision-engineered solutions across manufacturing sectors."
  },
  {
    icon: Users,
    title: "Expert Technicians",
    description: "Highly trained specialists utilizing cutting-edge methodologies for superior project execution."
  },
  {
    icon: TrendingUp,
    title: "Strategic Partnerships",
    description: "Trusted manufacturing partner to Tata, RSB, RKFL, Cummins, and Silicon - India's industrial leaders."
  }
];

const WhyChooseUsSection = () => {
  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Volumetric background effects */}
      <div className="absolute inset-0 gradient-cyber-radial opacity-40"></div>
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl animate-glass-float"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl animate-glass-float" style={{ animationDelay: '4s' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 max-w-7xl mx-auto items-start">
          <div>
            <div className="inline-block px-6 py-2 glass-cyber rounded-full mb-6 border border-cyber-cyan/30 shadow-glow-cyan">
              <span className="text-sm text-cyber-cyan font-medium tracking-widest">COMPETITIVE ADVANTAGES</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold mb-12">
              <span className="text-gradient-cyber">Why Choose</span>
              <span className="text-white"> Us?</span>
            </h2>

            <div className="space-y-6">
              {reasons.map((reason, index) => (
                <div key={index} className="flex gap-5 glass-cyber-strong p-6 rounded-xl border-2 border-cyber-cyan/40 hover:shadow-glow-cyan transition-all duration-500 group animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex-shrink-0">
                    <div className="p-4 bg-cyber-cyan/10 rounded-xl group-hover:bg-cyber-cyan/20 transition-all border border-cyber-cyan/30 shadow-glow-cyan">
                      <reason.icon className="h-7 w-7 text-cyber-cyan" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-white uppercase tracking-wide">{reason.title}</h3>
                    <p className="text-white/60 leading-relaxed font-light">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-cyber-strong rounded-2xl p-10 border-2 border-cyber-cyan/40 shadow-glow-cyan relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyber-cyan/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-10">
                <span className="text-gradient-cyber">COMPLIANCE</span>
                <span className="text-white"> & QUALITY</span>
              </h3>

              <div className="mb-10">
                <h4 className="text-xl font-bold mb-6 text-white uppercase tracking-wide">Raw Materials</h4>
                <div className="grid grid-cols-2 gap-4">
                  {['PP', 'HDPE', 'LDPE', 'ABS'].map((material, i) => (
                    <div key={i} className="glass-cyber p-5 rounded-xl text-center border border-cyber-cyan/30 hover:border-cyber-cyan/50 hover:shadow-glow-cyan transition-all group">
                      <span className="block font-bold text-cyber-cyan text-xl mb-2">{material}</span>
                      <span className="text-xs text-white/50">
                        {material === 'PP' ? 'Polypropylene' :
                          material === 'HDPE' ? 'High Density PE' :
                            material === 'LDPE' ? 'Low Density PE' :
                              'Acrylonitrile Butadiene Styrene'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <h4 className="text-xl font-bold mb-6 text-white uppercase tracking-wide">Quality Standards</h4>
                <div className="space-y-3">
                  {['ISO 9001:2015 Quality Management System', '100% quality inspection before shipment',
                    'Dimensional accuracy within ±0.01mm', 'RoHS and REACH compliant materials'].map((standard, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-cyber-cyan/5 transition-all group">
                        <CheckCheck className="h-5 w-5 text-cyber-cyan flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <p className="text-white/60 font-light text-sm">{standard}</p>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold mb-6 text-white uppercase tracking-wide">Environmental Commitment</h4>
                <div className="space-y-3">
                  {['Eco-friendly protective cap systems', 'Optimized material efficiency protocols',
                    'Recyclable and biodegradable options', 'Advanced waste reduction initiatives'].map((commitment, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-cyber-cyan/5 transition-all group">
                        <CheckCheck className="h-5 w-5 text-cyber-cyan flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <p className="text-white/60 font-light text-sm">{commitment}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
