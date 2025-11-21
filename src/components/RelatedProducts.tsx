import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface RelatedProductsProps {
  category: string;
  currentProductId: string;
}

const RelatedProducts = ({ category, currentProductId }: RelatedProductsProps) => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category", category)
        .neq("id", currentProductId)
        .limit(4);
      
      if (data) setProducts(data);
    };
    
    fetchRelated();
  }, [category, currentProductId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-serif font-bold mb-6">Bunları da Beğenebilirsiniz</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image_url}
            category={product.category}
            unit={product.unit}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;