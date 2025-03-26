import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

// Step data for the carousel
const howItWorksSteps = [
  {
    id: 1,
    title: "Choose a Date Idea",
    description: "No more boring dinner dates. Find exciting, unique ideas suited to your interests!",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    bgColor: "bg-rose-100",
    imageUrl: "https://images.pexels.com/photos/1024984/pexels-photo-1024984.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    id: 2,
    title: "We Find the Best Spots & Discounts in Your City",
    description: "Get exclusive deals on top-rated experiences near you.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    bgColor: "bg-purple-100",
    imageUrl: "https://images.pexels.com/photos/18105513/pexels-photo-18105513/free-photo-of-couple-embracing-by-lake-in-countryside.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
  },
  {
    id: 3,
    title: "Book in Seconds, Make Memories",
    description: "Book your date and enjoy a memorable experience with your person",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    bgColor: "bg-green-100",
    imageUrl: "https://images.pexels.com/photos/30425123/pexels-photo-30425123/free-photo-of-romantic-hot-air-balloon-wine-toast-at-sunset.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
  }
];

// Animated dots for the carousel
const CarouselDots = ({ active, count, onClick }: { active: number; count: number; onClick: (index: number) => void }) => {
  return (
    <div className="flex justify-center space-x-2 mt-6">
      {Array.from({ length: count }).map((_, i) => (
        <button 
          key={i}
          onClick={() => onClick(i)}
          className={`w-3 h-3 rounded-full transition-all ${active === i ? 'bg-rose-500 w-6' : 'bg-gray-300'}`}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  );
};

export default function HowItWorksCarousel() {
  const [api, setApi] = useState<any>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    
    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    
    api.on('select', handleSelect);
    api.on('reInit', handleSelect);
    
    return () => {
      api.off('select', handleSelect);
      api.off('reInit', handleSelect);
    };
  }, [api]);

  // Auto-scroll carousel
  useEffect(() => {
    if (!api) return;
    
    const interval = setInterval(() => {
      if (current === howItWorksSteps.length - 1) {
        api.scrollTo(0);
      } else {
        api.scrollNext();
      }
    }, 5000); // Auto-scroll every 5 seconds
    
    return () => clearInterval(interval);
  }, [api, current]);

  const handleDotClick = (index: number) => {
    if (api) api.scrollTo(index);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        
        <Carousel 
          className="max-w-4xl mx-auto"
          setApi={setApi}
          opts={{
            align: "center",
            loop: true
          }}
        >
          <CarouselContent>
            {howItWorksSteps.map((step, index) => (
              <CarouselItem key={step.id} className="md:basis-1/1 lg:basis-1/1">
                <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-100 h-full">
                  {/* Image section */}
                  <div className="relative w-full md:w-1/2 h-48 md:h-64 rounded-lg overflow-hidden">
                    <Image 
                      src={step.imageUrl}
                      alt={step.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <div className={`${step.bgColor} p-5 rounded-full`}>
                        {step.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content section */}
                  <div className="w-full md:w-1/2 text-center md:text-left">
                    <div className="inline-block text-sm font-medium bg-gray-100 text-gray-800 px-3 py-1 rounded-full mb-3">
                      Step {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <div className="mt-4 flex items-center justify-center gap-2">
            <CarouselPrevious className="static translate-y-0 transform-none" />
            <CarouselDots 
              active={current} 
              count={howItWorksSteps.length} 
              onClick={handleDotClick}
            />
            <CarouselNext className="static translate-y-0 transform-none" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}