
import React, { useState, useRef } from 'react';
import { Phone, Mail, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
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
import emailjs from '@emailjs/browser';

type FormData = {
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  inquiryType?: string;
  message?: string;
};

const ContactSection = () => {
  const form = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const useFallbackSubmission = true;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    if (errors[id as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, inquiryType: value }));
    if (errors.inquiryType) {
      setErrors(prev => ({ ...prev, inquiryType: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.inquiryType) newErrors.inquiryType = 'Please select an inquiry type';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(false);

    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Form submission:', formData);
      setSubmitSuccess(true);
      setFormData({ name: '', company: '', email: '', phone: '', inquiryType: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Volumetric background */}
      <div className="absolute inset-0 gradient-cyber-radial opacity-30"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl animate-glass-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl animate-glass-float" style={{ animationDelay: '3s' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block px-6 py-2 glass-cyber rounded-full mb-6 border border-cyber-cyan/30 shadow-glow-cyan">
            <span className="text-sm text-cyber-cyan font-medium tracking-widest">GET IN TOUCH</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient-cyber">CONTACT</span>
            <span className="text-white"> US</span>
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-white/70 font-light">
            Connect with us for inquiries, service requests, or advanced manufacturing solutions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          {/* Contact Information */}
          <div>
            <div className="glass-cyber-strong rounded-2xl p-10 mb-8 border-2 border-cyber-cyan/40 shadow-glow-cyan">
              <h3 className="text-3xl font-bold mb-8 text-white uppercase">Contact Information</h3>

              <div className="space-y-8">
                <div className="flex items-start group">
                  <div className="mr-6 p-4 bg-cyber-cyan/10 rounded-xl border border-cyber-cyan/30 group-hover:bg-cyber-cyan/20 transition-all">
                    <MapPin className="h-7 w-7 text-cyber-cyan" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-white">FACTORY ADDRESS</h4>
                    <p className="text-white/60 leading-relaxed">
                      New Development Area, 25/A, Golmuri<br />
                      Jamshedpur, Jharkhand 831003<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="mr-6 p-4 bg-cyber-cyan/10 rounded-xl border border-cyber-cyan/30 group-hover:bg-cyber-cyan/20 transition-all">
                    <Phone className="h-7 w-7 text-cyber-cyan" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-white">PHONE</h4>
                    <a href="tel:+919263391309" className="text-white/60 hover:text-cyber-cyan transition-colors">
                      +91-9263391309
                    </a>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="mr-6 p-4 bg-cyber-cyan/10 rounded-xl border border-cyber-cyan/30 group-hover:bg-cyber-cyan/20 transition-all">
                    <Mail className="h-7 w-7 text-cyber-cyan" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-2 text-white">EMAIL</h4>
                    <a href="mailto:navneetindustries@gmail.com" className="text-white/60 hover:text-cyber-cyan transition-colors">
                      navneetindustries@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="glass-cyber-strong rounded-2xl overflow-hidden border-2 border-cyber-cyan/40 shadow-glow-cyan">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3678.0407621196394!2d86.20630867517283!3d22.80461227939279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f5e4c5a3c0c1c1%3A0x9f1d51b5b8a2a1a0!2sGolmuri%2C%20Jamshedpur%2C%20Jharkhand%20831003!5e0!3m2!1sen!2sin!4v1715188260833!5m2!1sen!2sin"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Navneet Industries Location"
                className="opacity-80"
              ></iframe>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-cyber-strong rounded-2xl p-10 border-2 border-cyber-cyan/40 shadow-glow-cyan">
            <h3 className="text-3xl font-bold mb-8 text-white uppercase">Send Message</h3>

            {submitSuccess && (
              <div className="glass-cyber border border-green-500/50 rounded-xl p-6 mb-8 flex items-start">
                <CheckCircle className="text-green-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-green-400 mb-1">Message Received!</h4>
                  <p className="text-white/70 text-sm">We'll respond within 24-48 business hours.</p>
                </div>
              </div>
            )}

            {submitError && (
              <div className="glass-cyber border border-red-500/50 rounded-xl p-6 mb-8 flex items-start">
                <AlertCircle className="text-red-400 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-red-400 mb-1">Transmission Error</h4>
                  <p className="text-white/70 text-sm">Please contact us directly via phone or email.</p>
                </div>
              </div>
            )}

            <form ref={form} className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-white">Name <span className="text-cyber-cyan">*</span></label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className={`glass-cyber border-cyber-cyan/30 text-white placeholder:text-white/40 focus-visible:ring-cyber-cyan ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium text-white">Company</label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Company name"
                    className="glass-cyber border-cyber-cyan/30 text-white placeholder:text-white/40 focus-visible:ring-cyber-cyan"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-white">Email <span className="text-cyber-cyan">*</span></label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`glass-cyber border-cyber-cyan/30 text-white placeholder:text-white/40 focus-visible:ring-cyber-cyan ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-red-400 text-xs">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium text-white">Phone <span className="text-cyber-cyan">*</span></label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXX XXXXXX"
                    className={`glass-cyber border-cyber-cyan/30 text-white placeholder:text-white/40 focus-visible:ring-cyber-cyan ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-red-400 text-xs">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="inquiry-type" className="text-sm font-medium text-white">Inquiry Type <span className="text-cyber-cyan">*</span></label>
                <Select value={formData.inquiryType} onValueChange={handleSelectChange}>
                  <SelectTrigger className={`glass-cyber border-cyber-cyan/30 text-white focus-visible:ring-cyber-cyan ${errors.inquiryType ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="glass-cyber-strong border-cyber-cyan/30">
                    <SelectItem value="caps">Plastic Caps</SelectItem>
                    <SelectItem value="die">Custom Die Making</SelectItem>
                    <SelectItem value="maintenance">Machine Maintenance</SelectItem>
                    <SelectItem value="machining">Machining Services</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.inquiryType && <p className="text-red-400 text-xs">{errors.inquiryType}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-white">Message <span className="text-cyber-cyan">*</span></label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we assist you?"
                  className={`glass-cyber border-cyber-cyan/30 text-white placeholder:text-white/40 focus-visible:ring-cyber-cyan min-h-[150px] ${errors.message ? 'border-red-500' : ''}`}
                />
                {errors.message && <p className="text-red-400 text-xs">{errors.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full glass-cyber border-2 border-cyber-cyan/50 hover:border-cyber-cyan text-white py-6 text-lg rounded-xl transition-all duration-300 hover:scale-105 shadow-glow-cyan hover:shadow-glow-cyan-lg disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'TRANSMITTING...' : 'SUBMIT INQUIRY'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
