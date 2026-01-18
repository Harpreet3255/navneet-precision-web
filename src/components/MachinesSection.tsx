
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const machines = [
  {
    category: "lathe",
    title: "Lathe Machines",
    description: "Precision lathe machines capable of producing high-quality turned parts with tight tolerances for both manual and CNC operations.",
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
    description: "Advanced milling equipment enabling precise cutting and shaping of solid materials for complex industrial components.",
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
    description: "Professional drilling equipment for creating precise holes with accurate placement and sizing for critical components.",
    image: "/images/machines/drilling-machine.svg",
    specs: [
      "Max Drilling Capacity: 50mm",
      "Table Size: 500x500mm",
      "Spindle Speed: 50-3000 RPM"
    ]
  },
  {
    category: "injection",
    title: "Injection Molding",
    description: "Advanced injection molding systems producing high-quality plastic components with consistent precision and efficiency.",
    image: "/images/machines/injection-molding-machine.svg",
    specs: [
      "Clamping Force: 150 tons",
      "Shot Weight: 100-450g",
      "Cycle Time: 15-40 sec"
    ]
  }
];

const MachinesSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % machines.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isHovered]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + machines.length) % machines.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % machines.length);
  };

  return (
    <section id="machines" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full mb-4 border border-white/10">
            <span className="text-xs text-blue-500 font-medium tracking-widest uppercase">Our Equipment</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Manufacturing Machines
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-white/60">
            State-of-the-art equipment for precision manufacturing
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
            <div className="grid md:grid-cols-5 gap-8 p-8 md:p-12">
              {/* Image Column */}
              <div className="md:col-span-2 flex items-center justify-center">
                <div className="relative w-full aspect-square">
                  {machines.map((machine, index) => (
                    <div
                      key={machine.category}
                      className={`absolute inset-0 transition-all duration-700 ${index === currentIndex
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-95'
                        }`}
                    >
                      <img
                        src={machine.image}
                        alt={machine.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Column */}
              <div className="md:col-span-3 flex flex-col justify-center">
                {machines.map((machine, index) => (
                  <div
                    key={machine.category}
                    className={`transition-all duration-500 ${index === currentIndex
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4 absolute'
                      }`}
                  >
                    <h3 className="text-3xl font-bold mb-4 text-white">
                      {machine.title}
                    </h3>
                    <p className="text-white/70 mb-6 leading-relaxed">
                      {machine.description}
                    </p>

                    {/* Specs */}
                    <div className="space-y-2">
                      <p className="text-sm text-blue-500 font-semibold uppercase tracking-wider mb-3">
                        Specifications
                      </p>
                      {machine.specs.map((spec, idx) => (
                        <div key={idx} className="flex items-center text-white/60 text-sm">
                          <span className="text-blue-500 mr-2">●</span>
                          {spec}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between px-8 pb-6">
              <button
                onClick={goToPrevious}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                aria-label="Previous machine"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>

              {/* Indicators */}
              <div className="flex gap-2">
                {machines.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex
                        ? 'w-8 bg-blue-500'
                        : 'w-1.5 bg-white/30 hover:bg-white/50'
                      }`}
                    aria-label={`Go to machine ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                aria-label="Next machine"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MachinesSection;
