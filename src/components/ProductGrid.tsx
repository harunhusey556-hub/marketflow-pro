import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import Categories from "./Categories";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const products = [
  { id: "1", name: "Fresh Apples", price: 3.99, category: "Fruits", image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&h=500&fit=crop", unit: "lb" },
  { id: "2", name: "Organic Bananas", price: 2.49, category: "Fruits", image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&h=500&fit=crop", unit: "lb" },
  { id: "3", name: "Tomatoes", price: 4.29, category: "Vegetables", image: "https://images.unsplash.com/photo-1546470427-e26264b0ed55?w=500&h=500&fit=crop", unit: "lb" },
  { id: "4", name: "Fresh Carrots", price: 2.99, category: "Vegetables", image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&h=500&fit=crop", unit: "lb" },
  { id: "5", name: "Premium Beef", price: 12.99, category: "Meat", image: "https://images.unsplash.com/photo-1588347818036-be5e2bbf85c5?w=500&h=500&fit=crop", unit: "lb" },
  { id: "6", name: "Chicken Breast", price: 8.99, category: "Meat", image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&h=500&fit=crop", unit: "lb" },
  { id: "7", name: "Fresh Milk", price: 4.49, category: "Dairy", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop", unit: "gal" },
  { id: "8", name: "Greek Yogurt", price: 5.99, category: "Dairy", image: "https://images.unsplash.com/photo-1625845478827-4e8a48e57090?w=500&h=500&fit=crop", unit: "pack" },
  { id: "9", name: "Orange Juice", price: 6.49, category: "Beverages", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=500&fit=crop", unit: "bottle" },
  { id: "10", name: "Coffee Beans", price: 14.99, category: "Beverages", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop", unit: "lb" },
  { id: "11", name: "Sourdough Bread", price: 5.49, category: "Bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop", unit: "loaf" },
  { id: "12", name: "Croissants", price: 7.99, category: "Bakery", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&h=500&fit=crop", unit: "pack" },
];

const ProductGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="products" className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            Our Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our selection of fresh, quality products delivered straight to your door
          </p>
        </div>

        <div className="mb-8 space-y-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Categories
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No products found matching your search
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
