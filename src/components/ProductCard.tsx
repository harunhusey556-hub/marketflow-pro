import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";

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
