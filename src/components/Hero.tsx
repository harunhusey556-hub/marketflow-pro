import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-market.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40" />
      </div>
      
      <div className="container relative z-10 px-4 md:px-6">
        <div className="max-w-2xl space-y-6 animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight">
            Fresh Groceries
            <span className="block text-primary">Delivered to You</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
            Shop premium quality products from local markets. Fast delivery, fresh produce, and everything you need in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              size="lg" 
              className="group transition-all duration-300 hover:scale-105"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Shopping
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="transition-all duration-300 hover:scale-105"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
