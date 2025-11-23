import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Heart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  unit?: string;
}

const ProductCard = ({ id, name, price, image, category, unit = "unit" }: ProductCardProps) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [id]);

  const checkWishlistStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", session.user.id)
      .eq("product_id", id)
      .maybeSingle();

    setIsInWishlist(!!data);
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Favorilere eklemek için giriş yapın");
      return;
    }

    if (isInWishlist) {
      const { error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", session.user.id)
        .eq("product_id", id);

      if (!error) {
        setIsInWishlist(false);
        toast.success("Favorilerden çıkarıldı");
      }
    } else {
      const { error } = await supabase
        .from("wishlists")
        .insert({ user_id: session.user.id, product_id: id });

      if (!error) {
        setIsInWishlist(true);
        toast.success("Favorilere eklendi");
      }
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({ id, name, price, image, category });
  };

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <Card 
      className="group overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur">
          {category}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 left-3 bg-background/90 backdrop-blur hover:bg-background/80"
          onClick={toggleWishlist}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 transition-colors group-hover:text-primary">
          {name}
        </h3>
        <p className="text-2xl font-bold text-primary">
          ${price.toFixed(2)}
          <span className="text-sm text-muted-foreground font-normal ml-1">/ {unit}</span>
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full group/btn transition-all duration-300 hover:scale-105" 
          onClick={handleAddToCart}
        >
          <Plus className="mr-2 h-4 w-4 transition-transform group-hover/btn:rotate-90" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
