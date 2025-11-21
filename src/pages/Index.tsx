import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <ProductGrid />
      </main>
      <footer className="bg-card border-t mt-16">
        <div className="container px-4 md:px-6 py-8">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 MarketFresh. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
