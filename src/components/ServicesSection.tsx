
import React from 'react';
import { Settings, Wrench, Factory } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useTransition, TransitionType } from '@/contexts/TransitionContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const services = [
  {
    title: "Plastic Cap Manufacturing",
    description: "Custom injection molded caps for various industrial applications. We produce eco-friendly protective caps with precise dimensions and high-quality finish, designed to reduce environmental impact.",
    icon: Factory,
    path: "/services/caps",
    transitionType: "precision-cap" as TransitionType,
    transitionTooltip: "Precision in Every Cap"
  },
  {
    title: "Custom Die Making",
    description: "High-precision plastic mold dies designed and manufactured to your exact specifications with exceptional durability.",
    icon: Settings,
    path: "/services/dies",
    transitionType: "die-making" as TransitionType,
    transitionTooltip: "Die in Making"
  },
  {
    title: "Machine Maintenance",
    description: "Professional on-site repair and maintenance services for industrial machinery to minimize downtime and optimize performance.",
    icon: Wrench,
    path: "/services/maintenance",
    transitionType: "fix-progress" as TransitionType,
    transitionTooltip: "Fix in Progress"
  }
];

const ServicesSection = () => {
  const navigate = useNavigate();
  const { setTransition, setIsTransitioning } = useTransition();

  const handleLearnMore = (path: string, transitionType: TransitionType) => {
    // Set the transition type and show the transition overlay
    setTransition(transitionType);
    setIsTransitioning(true);

    // Navigate after a short delay to allow the animation to play
    setTimeout(() => {
      navigate(path);
    }, 1800); // Match this with the animation duration in TransitionOverlay
  };

  return (
    <section id="services" className="py-20 bg-navneet-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navneet-dark">Our Services</h2>
          <div className="w-20 h-1 bg-navneet-orange mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-lg text-navneet-gray">
            We offer a comprehensive range of manufacturing and maintenance services
            to support your industrial needs with precision and reliability.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              id={service.title.toLowerCase().replace(/\s+/g, '-')}
              className="bg-white border-none shadow-lg rounded-lg overflow-hidden h-full flex flex-col transform transition duration-300 hover:-translate-y-2"
            >
              <CardHeader className="pb-0">
                <div className="p-4 bg-navneet-orange/10 inline-flex rounded-full mb-4 items-center justify-center">
                  <service.icon className="h-6 w-6 text-navneet-orange" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-navneet-dark">{service.title}</h3>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-navneet-gray">
                  {service.description}
                </p>
              </CardContent>
              <CardFooter className="pt-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="bg-transparent hover:bg-navneet-orange text-navneet-dark hover:text-white border border-navneet-dark hover:border-transparent"
                        onClick={() => handleLearnMore(service.path, service.transitionType)}
                      >
                        Learn More
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{service.transitionTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Service with updated machine image */}
        <div id="machining-operations" className="mt-16 bg-navneet-dark rounded-lg shadow-xl p-8 text-white">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3">
              <h3 className="text-2xl font-bold mb-4">Machining Operations</h3>
              <p className="mb-6">
                Our workshop is equipped with high-precision lathe, milling, and drilling machines
                operated by skilled technicians to deliver precise parts for various industrial applications.
              </p>
              <Button
                className="bg-navneet-orange hover:bg-navneet-orange/90 text-white"
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = '/#contact';
                  }
                }}
              >
                Request Quote
              </Button>
            </div>
            <div className="md:col-span-2">
              <img
                src="https://images.unsplash.com/photo-1535813547-99c456a41d4a?q=80&w=1470&auto=format&fit=crop"
                alt="Machining Operations"
                className="rounded-lg object-cover w-full h-64"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
