
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Clock, Users } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left column with image */}
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img 
              src="/placeholder.svg" 
              alt="Navneet Industries Workshop" 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Right column with text content */}
          <div className="animate-slide-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-navneet-dark">About Navneet Industries</h2>
            <div className="w-20 h-1 bg-navneet-orange mb-6"></div>
            
            <p className="text-lg mb-6 text-navneet-gray">
              Founded in Jamshedpur, Navneet Industries has built a reputation for excellence in 
              plastic cap manufacturing, custom die making, and machine maintenance services. 
              Working with India's leading industrial partners, we deliver precision engineering 
              solutions with quick turnaround times.
            </p>
            
            {/* Core values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-start">
                <div className="mr-4 p-3 bg-navneet-orange/10 rounded-full">
                  <Shield className="h-6 w-6 text-navneet-orange" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Reliability</h3>
                  <p className="text-navneet-gray">Quality products that exceed industry standards</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 p-3 bg-navneet-orange/10 rounded-full">
                  <Clock className="h-6 w-6 text-navneet-orange" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Quick Turnaround</h3>
                  <p className="text-navneet-gray">Efficient processes to meet tight deadlines</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="mr-4 p-3 bg-navneet-orange/10 rounded-full">
                  <Users className="h-6 w-6 text-navneet-orange" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Local Trust</h3>
                  <p className="text-navneet-gray">Deep relationships with India's industrial giants</p>
                </div>
              </div>
            </div>
            
            <Button className="bg-navneet-dark hover:bg-navneet-dark/90 text-white">
              Learn More About Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
