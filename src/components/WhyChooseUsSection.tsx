
import React from 'react';
import { Clock, Award, Users, TrendingUp, CheckCheck } from 'lucide-react';

const reasons = [
  {
    icon: Clock,
    title: "Quick Response Times",
    description: "We understand the importance of timely service in industrial settings. Our team ensures rapid response to minimize downtime."
  },
  {
    icon: Award,
    title: "Industry Experience",
    description: "With years of experience in manufacturing and maintenance, we have developed deep expertise in delivering precision solutions."
  },
  {
    icon: Users,
    title: "Skilled Workforce",
    description: "Our technicians and engineers are highly trained professionals committed to delivering excellence in every project."
  },
  {
    icon: TrendingUp,
    title: "Partner to Top Indian Manufacturers",
    description: "We're proud to serve leading companies like Tata, RSB, RKFL, Cummins, and Silicon as their trusted manufacturing partner."
  }
];

const WhyChooseUsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navneet-dark">Why Choose Us?</h2>
            <div className="w-20 h-1 bg-navneet-orange mb-6"></div>
            
            <div className="space-y-6">
              {reasons.map((reason, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-navneet-orange/10 rounded-full">
                      <reason.icon className="h-6 w-6 text-navneet-orange" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{reason.title}</h3>
                    <p className="text-navneet-gray">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-navneet-light rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-navneet-dark">Compliance & Quality</h3>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Raw Materials</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <span className="block font-semibold text-navneet-orange">PP</span>
                  <span className="text-sm text-navneet-gray">Polypropylene</span>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <span className="block font-semibold text-navneet-orange">HDPE</span>
                  <span className="text-sm text-navneet-gray">High Density Polyethylene</span>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <span className="block font-semibold text-navneet-orange">LDPE</span>
                  <span className="text-sm text-navneet-gray">Low Density Polyethylene</span>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <span className="block font-semibold text-navneet-orange">ABS</span>
                  <span className="text-sm text-navneet-gray">Acrylonitrile Butadiene Styrene</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-3">Quality Standards</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCheck className="h-5 w-5 text-navneet-orange flex-shrink-0 mt-0.5" />
                  <p className="text-navneet-gray">ISO 9001:2015 Quality Management System</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCheck className="h-5 w-5 text-navneet-orange flex-shrink-0 mt-0.5" />
                  <p className="text-navneet-gray">100% quality inspection before shipment</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCheck className="h-5 w-5 text-navneet-orange flex-shrink-0 mt-0.5" />
                  <p className="text-navneet-gray">Dimensional accuracy within ±0.01mm</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCheck className="h-5 w-5 text-navneet-orange flex-shrink-0 mt-0.5" />
                  <p className="text-navneet-gray">RoHS and REACH compliant materials when required</p>
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
