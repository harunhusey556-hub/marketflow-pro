import { useState, useMemo, useEffect } from "react";
import ProductCard from "./ProductCard";
import Categories from "./Categories";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getProductImage } from "@/lib/utils";
import { localData } from "@/services/localData";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  unit: string;
}

const ProductGrid = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await localData.getProducts();
      setProducts(
        data
          .filter((product) => product.isActive !== false)
          .map((product) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            category: product.category,
            image_url: product.image_url ?? product.image,
            unit: product.unit,
          })),
      );
    };
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

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
          <Categories
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              id={product.id}
              name={product.name}
              price={product.price}
              category={product.category}
              image={getProductImage(product)}
              unit={product.unit}
            />
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
