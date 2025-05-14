
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

// Form validation types
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
  // Form reference for EmailJS
  const form = useRef<HTMLFormElement>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    inquiryType: '',
    message: ''
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // EmailJS configuration with actual credentials
  const useFallbackSubmission = false; // Using real EmailJS now

  // EmailJS configuration - using public values since these are client-side anyway
  const emailjsServiceId = 'service_rnvneet';
  const emailjsTemplateId = 'template_navneet';
  const emailjsPublicKey = 'Dn7zZZ9vaf9tKfLZm';

  // Initialize EmailJS
  try {
    emailjs.init(emailjsPublicKey);
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Clear error for this field when user types
    if (errors[id as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [id]: undefined
      }));
    }
  };

  // Handle select change
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      inquiryType: value
    }));

    // Clear error for this field
    if (errors.inquiryType) {
      setErrors(prev => ({
        ...prev,
        inquiryType: undefined
      }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.inquiryType) {
      newErrors.inquiryType = 'Please select an inquiry type';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset submission states
    setSubmitSuccess(false);
    setSubmitError(false);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare template parameters for EmailJS
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        from_phone: formData.phone,
        company: formData.company || 'Not provided',
        inquiry_type: formData.inquiryType,
        message: formData.message,
        reply_to: formData.email,
        to_name: 'Navneet Industries',
      };

      // Send email using EmailJS
      console.log('Sending email with params:', templateParams);

      const response = await emailjs.send(
        emailjsServiceId,
        emailjsTemplateId,
        templateParams
      );

      console.log('Email sent successfully:', response);
      setSubmitSuccess(true);

      // Reset form
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        inquiryType: '',
        message: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section id="contact" className="py-20 bg-navneet-light">
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
                      New Development Area, 25/A, Golmuri<br />
                      Jamshedpur, Jharkhand 831003<br />
                      India
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
                      +91-9263391309
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
                      navneetindustries@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps */}
            <div className="aspect-video bg-white rounded-lg shadow-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3678.0407621196394!2d86.20630867517283!3d22.80461227939279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f5e4c5a3c0c1c1%3A0x9f1d51b5b8a2a1a0!2sGolmuri%2C%20Jamshedpur%2C%20Jharkhand%20831003!5e0!3m2!1sen!2sin!4v1715188260833!5m2!1sen!2sin"
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

            {/* Success Message */}
            {submitSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 flex items-start">
                <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-green-800 mb-1">Thank you for your inquiry!</h4>
                  <p className="text-green-700 mb-2">
                    We've received your message and will get back to you as soon as possible.
                  </p>
                  <p className="text-green-700 text-sm">
                    <strong>What happens next?</strong> Our team will review your inquiry and contact you within 24-48 business hours.
                    You should receive a confirmation email at the address you provided.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6 flex items-start">
                <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-red-800 mb-1">Something went wrong</h4>
                  <p className="text-red-700 mb-2">
                    We couldn't send your message. Please try again or contact us directly.
                  </p>
                  <div className="flex flex-col space-y-2 mt-3">
                    <p className="text-red-700 text-sm">You can reach us directly at:</p>
                    <a href="tel:+919263391309" className="text-red-700 text-sm flex items-center">
                      <Phone size={14} className="mr-2" />
                      +91-9263391309
                    </a>
                    <a href="mailto:navneetindustries@gmail.com" className="text-red-700 text-sm flex items-center">
                      <Mail size={14} className="mr-2" />
                      navneetindustries@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            )}

            <form ref={form} className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Full Name <span className="text-red-500">*</span></label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={`border-navneet-gray/20 focus-visible:ring-navneet-orange ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="company" className="text-sm font-medium">Company Name</label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Enter your company name"
                    className="border-navneet-gray/20 focus-visible:ring-navneet-orange"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email Address <span className="text-red-500">*</span></label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`border-navneet-gray/20 focus-visible:ring-navneet-orange ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className={`border-navneet-gray/20 focus-visible:ring-navneet-orange ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="inquiry-type" className="text-sm font-medium">Inquiry Type <span className="text-red-500">*</span></label>
                <Select value={formData.inquiryType} onValueChange={handleSelectChange}>
                  <SelectTrigger className={`border-navneet-gray/20 focus-visible:ring-navneet-orange ${errors.inquiryType ? 'border-red-500' : ''}`}>
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
                {errors.inquiryType && <p className="text-red-500 text-xs mt-1">{errors.inquiryType}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message <span className="text-red-500">*</span></label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className={`border-navneet-gray/20 focus-visible:ring-navneet-orange min-h-[150px] ${errors.message ? 'border-red-500' : ''}`}
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              <Button
                type="submit"
                className="w-full bg-navneet-orange hover:bg-navneet-orange/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
