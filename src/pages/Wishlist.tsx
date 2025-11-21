import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("wishlists")
      .select(`
        id,
        products (
          id, name, price, image_url, category, unit
        )
      `)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Favoriler çekilemedi:", error);
    } else {
      setWishlistItems(data || []);
    }
  };

  const removeFromWishlist = async (id: string) => {
    const { error } = await supabase.from("wishlists").delete().eq("id", id);
    if (error) {
      toast.error("Favorilerden silinemedi");
    } else {
      toast.success("Ürün favorilerden kaldırıldı");
      setWishlistItems(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="container py-8 px-4 md:px-6">
        <h1 className="text-3xl font-serif font-bold mb-6">Favorilerim</h1>
        
        {wishlistItems.length === 0 ? (
          <p className="text-muted-foreground">Henüz favori ürününüz yok.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.products;
              return (
                <Card key={item.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-primary font-bold mt-1">
                      ₺{product.price} / {product.unit}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image_url,
                        category: product.category
                      })}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Sepete Ekle
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;