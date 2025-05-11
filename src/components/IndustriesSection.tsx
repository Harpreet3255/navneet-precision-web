
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
    <section id="industries" className="py-20 bg-navneet-light relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 border border-gray-400 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 border border-gray-400 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 border border-gray-400 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navneet-dark uppercase tracking-wide">Industries We Serve</h2>
          <div className="w-20 h-1 bg-navneet-orange mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-lg text-navneet-gray">
            Our expertise spans across multiple industries, delivering specialized solutions
            tailored to each sector's unique requirements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {industries.map((industry, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-6 items-start transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
                <industry.icon className="h-12 w-12 text-navneet-orange transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-navneet-dark">{industry.title}</h3>
                <p className="mb-4 text-navneet-gray">{industry.description}</p>
                <div className="rounded-lg overflow-hidden shadow-sm group">
                  <img
                    src={industry.image}
                    alt={industry.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
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
