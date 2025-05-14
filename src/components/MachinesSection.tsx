
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const machines = [
  {
    category: "lathe",
    title: "Lathe Machines",
    description: "Our precision lathe machines are capable of producing high-quality turned parts with tight tolerances. We specialize in both manual and CNC lathe operations for various materials including metals and plastics.",
    image: "/images/machines/lathe-machine.svg",
    specs: [
      "Max Diameter: 400mm",
      "Max Length: 1000mm",
      "Precision: ±0.01mm"
    ]
  },
  {
    category: "milling",
    title: "Milling Machines",
    description: "Our milling machines enable precise cutting and shaping of solid materials. These versatile machines allow us to create complex shapes and features on parts for various industrial applications.",
    image: "/images/machines/milling-machine.svg",
    specs: [
      "X-Axis Travel: 600mm",
      "Y-Axis Travel: 400mm",
      "Z-Axis Travel: 450mm"
    ]
  },
  {
    category: "drilling",
    title: "Drilling Machines",
    description: "We utilize advanced drilling equipment for creating precise holes in various materials. Our drilling capabilities ensure accurate hole placement and sizing for critical components.",
    image: "/images/machines/drilling-machine.svg",
    specs: [
      "Max Drilling Capacity: 50mm",
      "Table Size: 500x500mm",
      "Spindle Speed: 50-3000 RPM"
    ]
  },
  {
    category: "injection",
    title: "Injection Molding Machines",
    description: "Our advanced injection molding systems produce high-quality, eco-friendly plastic protective caps and components with consistent precision. These energy-efficient machines form the core of our sustainable plastic manufacturing capabilities.",
    image: "/images/machines/injection-molding-machine.svg",
    specs: [
      "Clamping Force: 150 tons",
      "Shot Weight: 100-450g",
      "Cycle Time: 15-40 sec",
      "Material: Eco-friendly polymers"
    ]
  }
];

const MachinesSection = () => {
  return (
    <section id="machines" className="py-20 bg-navneet-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-navneet-dark">Machines & Workshop</h2>
          <div className="w-20 h-1 bg-navneet-orange mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-lg text-navneet-gray">
            Our workshop is equipped with state-of-the-art machinery operated by skilled technicians
            to deliver precision manufacturing and maintenance services.
          </p>
        </div>

        <Tabs defaultValue="lathe" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="lathe" className="text-lg">Lathe Machines</TabsTrigger>
            <TabsTrigger value="milling" className="text-lg">Milling Machines</TabsTrigger>
            <TabsTrigger value="drilling" className="text-lg">Drilling Machines</TabsTrigger>
            <TabsTrigger value="injection" className="text-lg">Injection Molding</TabsTrigger>
          </TabsList>

          {machines.map((machine) => (
            <TabsContent key={machine.category} value={machine.category} className="animate-fade-in">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="grid md:grid-cols-2">
                  <div className="h-full">
                    <img
                      src={machine.image}
                      alt={machine.title}
                      className="w-full h-full object-contain bg-navneet-light/50 p-4"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-4 text-navneet-dark">{machine.title}</h3>
                    <p className="mb-6 text-navneet-gray">{machine.description}</p>

                    <div className="bg-navneet-light p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Technical Specifications:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {machine.specs.map((spec, index) => (
                          <li key={index} className="text-navneet-gray">{spec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default MachinesSection;
