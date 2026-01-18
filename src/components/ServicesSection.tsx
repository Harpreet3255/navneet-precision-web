
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
    setTransition(transitionType);
    setIsTransitioning(true);
    setTimeout(() => {
      navigate(path);
    }, 1800);
  };

  return (
    <section id="services" className="py-32 bg-black relative overflow-hidden">
      {/* Volumetric background */}
      <div className="absolute inset-0 gradient-cyber-radial opacity-40"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-cyan/10 rounded-full blur-3xl animate-glass-float"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-blue/10 rounded-full blur-3xl animate-glass-float" style={{ animationDelay: '3s' }}></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-block px-6 py-2 glass-cyber rounded-full mb-6 shadow-glow-cyan">
            <span className="text-sm text-cyber-cyan font-medium tracking-widest">OUR CAPABILITIES</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient-cyber">ADVANCED</span>
            <span className="text-white"> SYSTEMS</span>
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-white/70 font-light leading-relaxed">
            Next-generation manufacturing solutions engineered for precision and reliability
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <Card
              key={index}
              id={service.title.toLowerCase().replace(/\s+/g, '-')}
              className="glass-cyber-strong border-2 border-cyber-cyan/40 rounded-2xl overflow-hidden h-full flex flex-col transform transition-all duration-500 hover:scale-105 hover:shadow-glow-cyan-lg hover:border-cyber-cyan/60 group animate-scale-in bg-transparent"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <CardHeader className="pb-4 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyber-cyan/5 rounded-full blur-2xl group-hover:bg-cyber-cyan/10 transition-all"></div>
                <div className="p-5 bg-cyber-cyan/10 inline-flex rounded-2xl mb-6 items-center justify-center group-hover:bg-cyber-cyan/20 transition-all duration-300 border border-cyber-cyan/30 shadow-glow-cyan relative z-10">
                  <service.icon className="h-8 w-8 text-cyber-cyan" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white relative z-10">{service.title}</h3>
              </CardHeader>
              <CardContent className="flex-grow relative z-10">
                <p className="text-white/70 leading-relaxed text-lg font-light">
                  {service.description}
                </p>
              </CardContent>
              <CardFooter className="pt-0 relative z-10">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="glass-cyber border-2 border-cyber-cyan/50 hover:border-cyber-cyan text-white w-full py-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-glow-cyan hover:shadow-glow-cyan-lg group/btn relative overflow-hidden"
                        onClick={() => handleLearnMore(service.path, service.transitionType)}
                      >
                        <span className="relative z-10">ACCESS SYSTEM</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyber-cyan/0 via-cyber-cyan/20 to-cyber-cyan/0 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="glass-cyber border-cyber-cyan/50">
                      <p className="text-white">{service.transitionTooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Machining Operations - Futuristic Style */}
        <div id="machining-operations" className="mt-20 glass-cyber-strong rounded-2xl p-12 border-2 border-cyber-cyan/40 shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-cyan/5 rounded-full blur-3xl"></div>
          <div className="grid md:grid-cols-5 gap-10 items-center relative z-10">
            <div className="md:col-span-3">
              <div className="inline-block px-4 py-1 glass-cyber rounded-full mb-4 border border-cyber-cyan/30">
                <span className="text-xs text-cyber-cyan font-medium tracking-widest">PRECISION ENGINEERING</span>
              </div>
              <h3 className="text-4xl font-bold mb-6 text-gradient-cyber">Machining Operations</h3>
              <p className="mb-8 leading-relaxed text-white/70 text-lg font-light">
                High-precision lathe, milling, and drilling systems operated by specialized technicians
                to deliver micro-accurate components for advanced industrial applications.
              </p>
              <Button
                className="glass-cyber border-2 border-cyber-cyan/50 hover:border-cyber-cyan text-white px-10 py-6 rounded-xl transition-all duration-300 hover:scale-105 shadow-glow-cyan hover:shadow-glow-cyan-lg"
                onClick={() => {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = '/#contact';
                  }
                }}
              >
                REQUEST QUOTE
              </Button>
            </div>
            <div className="md:col-span-2 relative">
              <div className="absolute inset-0 bg-cyber-cyan/20 rounded-2xl blur-xl"></div>
              <img
                src="https://images.unsplash.com/photo-1535813547-99c456a41d4a?q=80&w=1470&auto=format&fit=crop"
                alt="Machining Operations"
                className="rounded-2xl object-cover w-full h-72 border-2 border-cyber-cyan/30 shadow-glow-cyan relative z-10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
