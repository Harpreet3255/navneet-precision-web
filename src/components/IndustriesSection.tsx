
import React from 'react';
import { Truck, Package, Factory, Cog } from 'lucide-react';

const industries = [
  {
    title: "Automotive",
    description: "Custom plastic components and caps for the automotive industry, meeting strict quality standards.",
    icon: Truck,
    image: "/placeholder.svg"
  },
  {
    title: "Packaging",
    description: "Injection molded caps for various packaging applications across industries.",
    icon: Package,
    image: "/placeholder.svg"
  },
  {
    title: "Heavy Machinery",
    description: "Durable parts and maintenance services for heavy industrial equipment and machinery.",
    icon: Cog,
    image: "/placeholder.svg"
  },
  {
    title: "Industrial Components",
    description: "Precision-engineered components for industrial applications and assemblies.",
    icon: Factory,
    image: "/placeholder.svg"
  }
];

const IndustriesSection = () => {
  return (
    <section className="py-20 bg-navneet-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-700">Industries We Serve</h2>
          <div className="w-20 h-1 bg-gray-400 mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-lg text-gray-600">
            Our expertise spans across multiple industries, delivering specialized solutions 
            tailored to each sector's unique requirements.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          {industries.map((industry, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <industry.icon className="h-12 w-12 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3 text-gray-700">{industry.title}</h3>
                <p className="mb-4 text-gray-600">{industry.description}</p>
                <div className="rounded-lg overflow-hidden shadow-sm">
                  <img 
                    src={industry.image} 
                    alt={industry.title} 
                    className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
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
