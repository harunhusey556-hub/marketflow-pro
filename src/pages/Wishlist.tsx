import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { localData } from "@/services/localData";
import type { Product } from "@/services/mockDb";
import { getProductImage } from "@/lib/utils";
import { toast } from "sonner";
import { useWishlist } from "@/hooks/useWishlist";

const Wishlist = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const { favorites, toggleFavorite } = useWishlist();

  useEffect(() => {
    localData
      .getProducts()
      .then((data) => setProducts(data))
      .catch((error) => {
        console.error("Failed to load products", error);
        toast.error("Unable to load wishlist items right now.");
      });
  }, []);

  const favoriteProducts = useMemo(
    () => products.filter((product) => favorites.includes(product.id)),
    [favorites, products],
  );

  const removeFavorite = (id: string) => {
    toggleFavorite(id);
    toast.success("Removed from wishlist");
  };

  if (products.length === 0 && favoriteProducts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">Save your favourite items for later</p>
          </div>
        </div>

        {favoriteProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mb-4 opacity-50" />
              <p>You haven't added anything to your wishlist yet.</p>
              <Button variant="link" onClick={() => navigate("/")} className="mt-2">
                Browse products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favoriteProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <span className="text-primary font-semibold">€{product.price.toFixed(2)}</span>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => navigate(`/product/${product.id}`)}>
                      View details
                    </Button>
                    <Button variant="secondary" onClick={() => removeFavorite(product.id)}>
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
