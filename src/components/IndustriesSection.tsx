
import React from 'react';
import { Truck, Package, Factory, Cog } from 'lucide-react';

const industries = [
  {
    title: "Automotive",
    description: "Custom plastic components and caps for the automotive industry, meeting strict quality standards.",
    icon: Truck,
    image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?q=80&w=1588&auto=format&fit=crop"
  },
  {
    title: "Packaging",
    description: "Eco-friendly injection molded protective caps for various packaging applications. Our sustainable solutions help reduce plastic waste while maintaining product integrity.",
    icon: Package,
    image: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=1470&auto=format&fit=crop"
  },
  {
    title: "Heavy Machinery",
    description: "Durable parts and maintenance services for heavy industrial equipment and machinery.",
    icon: Cog,
    image: "https://images.unsplash.com/photo-1473621038790-b778b4750efe?q=80&w=1572&auto=format&fit=crop"
  },
  {
    title: "Industrial Components",
    description: "Precision-engineered components for industrial applications and assemblies.",
    icon: Factory,
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1740&auto=format&fit=crop"
  }
];

const IndustriesSection = () => {
  return (
    <section id="industries" className="py-32 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Volumetric background */}
      <div className="absolute inset-0 gradient-cyber-radial opacity-30"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl animate-glass-float"></div>
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl animate-glass-float" style={{ animationDelay: '2s' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-block px-6 py-2 glass-cyber rounded-full mb-6 border border-cyber-cyan/30 shadow-glow-cyan">
            <span className="text-sm text-cyber-cyan font-medium tracking-widest">SECTOR EXPERTISE</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient-cyber">INDUSTRIES</span>
            <span className="text-white"> WE SERVE</span>
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-white/70 font-light leading-relaxed">
            Specialized solutions engineered for diverse industrial sectors with precision and reliability
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {industries.map((industry, index) => (
            <div
              key={index}
              className="group glass-cyber-strong rounded-2xl overflow-hidden border-2 border-cyber-cyan/40 hover:shadow-glow-cyan-lg transition-all duration-500 hover:scale-105"
            >
              <div className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  <div className="p-5 bg-cyber-cyan/10 rounded-xl border border-cyber-cyan/30 group-hover:bg-cyber-cyan/20 transition-all">
                    <industry.icon className="h-10 w-10 text-cyber-cyan" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-3 text-white uppercase tracking-wide">{industry.title}</h3>
                    <p className="text-white/70 leading-relaxed font-light">{industry.description}</p>
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden border-2 border-cyber-cyan/30 shadow-glow-cyan">
                  <div className="absolute inset-0 bg-cyber-cyan/10 group-hover:bg-cyber-cyan/20 transition-all"></div>
                  <img
                    src={industry.image}
                    alt={industry.title}
                    className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110 relative z-10 mix-blend-luminosity group-hover:mix-blend-normal"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;
