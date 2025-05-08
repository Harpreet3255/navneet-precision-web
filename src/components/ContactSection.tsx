
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ContactSection = () => {
  return (
    <section className="py-20 bg-navneet-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navneet-dark">Contact Us</h2>
          <div className="w-20 h-1 bg-navneet-orange mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-lg text-navneet-gray">
            Get in touch with us for inquiries, service requests, or to discuss how we can support your industrial needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Contact Information */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-semibold mb-6 text-navneet-dark">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="mr-4 p-3 bg-navneet-orange/10 rounded-full">
                    <MapPin className="h-6 w-6 text-navneet-orange" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Factory Address</h4>
                    <p className="text-navneet-gray">
                      Plot No. 123, Industrial Area Phase II<br />
                      Adityapur, Jamshedpur - 831013<br />
                      Jharkhand, India
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 p-3 bg-navneet-orange/10 rounded-full">
                    <Phone className="h-6 w-6 text-navneet-orange" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Phone</h4>
                    <p className="text-navneet-gray">
                      Office: +91 12345 67890<br />
                      Support: +91 98765 43210
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 p-3 bg-navneet-orange/10 rounded-full">
                    <Mail className="h-6 w-6 text-navneet-orange" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-navneet-gray">
                      Sales: sales@navneetindustries.com<br />
                      Support: support@navneetindustries.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Google Maps */}
            <div className="aspect-video bg-white rounded-lg shadow-lg overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d58830.41206974912!2d86.14289087535721!3d22.79344537257106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f5e31989f0e2b5%3A0xeeec8e81ce9b344!2sJamshedpur%2C%20Jharkhand!5e0!3m2!1sen!2sin!4v1715188260833!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Navneet Industries Location"
              ></iframe>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold mb-6 text-navneet-dark">Send Us a Message</h3>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                  <Input 
                    id="name" 
                    placeholder="Enter your name" 
                    className="border-navneet-gray/20 focus-visible:ring-navneet-orange" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium">Company Name</label>
                  <Input 
                    id="company" 
                    placeholder="Enter your company name" 
                    className="border-navneet-gray/20 focus-visible:ring-navneet-orange" 
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    className="border-navneet-gray/20 focus-visible:ring-navneet-orange" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                  <Input 
                    id="phone" 
                    placeholder="Enter your phone number" 
                    className="border-navneet-gray/20 focus-visible:ring-navneet-orange" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="inquiry-type" className="text-sm font-medium">Inquiry Type</label>
                <Select>
                  <SelectTrigger className="border-navneet-gray/20 focus-visible:ring-navneet-orange">
                    <SelectValue placeholder="Select inquiry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caps">Plastic Caps</SelectItem>
                    <SelectItem value="die">Custom Die Making</SelectItem>
                    <SelectItem value="maintenance">Machine Maintenance</SelectItem>
                    <SelectItem value="machining">Machining Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea 
                  id="message" 
                  placeholder="How can we help you?" 
                  className="border-navneet-gray/20 focus-visible:ring-navneet-orange min-h-[150px]" 
                />
              </div>
              
              <Button className="w-full bg-navneet-orange hover:bg-navneet-orange/90 text-white">
                Submit Inquiry
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
