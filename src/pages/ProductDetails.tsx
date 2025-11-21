import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { ArrowLeft, Plus, Star, ChefHat, Info, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  image_url: string;
  description?: string;
}

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews] = useState<Review[]>([
    {
      id: "1",
      user_name: "Maria K.",
      rating: 5,
      comment: "Excellent quality! Very fresh and well packaged.",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      user_name: "Jukka M.",
      rating: 4,
      comment: "Good product, delivered on time. Will order again.",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
      navigate("/");
      return;
    }

    if (!data) {
      toast.error("Product not found");
      navigate("/");
      return;
    }

    setProduct(data);
    setLoading(false);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url,
      category: product.category,
    });
  };

  const getNutritionalInfo = (productName: string) => {
    // Simplified nutritional data - would come from database in production
    if (productName.toLowerCase().includes("chicken")) {
      return {
        calories: "165 kcal",
        protein: "31g",
        fat: "3.6g",
        carbs: "0g",
        servingSize: "100g",
      };
    } else if (productName.toLowerCase().includes("turkey")) {
      return {
        calories: "135 kcal",
        protein: "30g",
        fat: "0.7g",
        carbs: "0g",
        servingSize: "100g",
      };
    } else if (productName.toLowerCase().includes("beef")) {
      return {
        calories: "250 kcal",
        protein: "26g",
        fat: "17g",
        carbs: "0g",
        servingSize: "100g",
      };
    }
    return {
      calories: "200 kcal",
      protein: "25g",
      fat: "10g",
      carbs: "0g",
      servingSize: "100g",
    };
  };

  const getCookingSuggestions = (productName: string) => {
    const name = productName.toLowerCase();
    
    if (name.includes("fillet") || name.includes("breast")) {
      return [
        "Pan-fry in olive oil for 6-8 minutes per side",
        "Grill on medium-high heat for optimal flavor",
        "Slice thinly for stir-fry dishes",
        "Marinate for 2-4 hours before cooking for extra tenderness",
      ];
    } else if (name.includes("wings")) {
      return [
        "Bake at 200°C for 40-45 minutes until crispy",
        "Deep fry for 10-12 minutes for extra crispiness",
        "Toss in your favorite sauce after cooking",
        "Great for grilling on BBQ",
      ];
    } else if (name.includes("drumstick") || name.includes("thigh")) {
      return [
        "Roast at 180°C for 35-40 minutes",
        "Perfect for slow cooking in stews",
        "Marinate overnight for best flavor",
        "Grill on medium heat for 25-30 minutes",
      ];
    } else if (name.includes("steak") || name.includes("striploin") || name.includes("tenderloin")) {
      return [
        "Sear on high heat for 3-4 minutes per side for medium-rare",
        "Let rest for 5 minutes before serving",
        "Season generously with salt and pepper",
        "Add butter and herbs in the last minute of cooking",
      ];
    } else if (name.includes("minced") || name.includes("mince") || name.includes("ground")) {
      return [
        "Brown in a hot pan, breaking up as you cook",
        "Perfect for burgers, meatballs, and tacos",
        "Cook to internal temperature of 70°C",
        "Add to pasta sauces and chili",
      ];
    }
    
    return [
      "Cook to recommended internal temperature",
      "Season well before cooking",
      "Let rest after cooking for juicier results",
      "Experiment with different marinades and spices",
    ];
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) return null;

  const nutritionalInfo = getNutritionalInfo(product.name);
  const cookingSuggestions = getCookingSuggestions(product.name);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container px-4 py-8 md:px-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-background">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-4 right-4 text-lg px-4 py-2">
              {product.category}
            </Badge>
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.round(parseFloat(averageRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground">
                  {averageRating} ({reviews.length} reviews)
                </span>
              </div>

              <div className="mb-6">
                <p className="text-5xl font-bold text-primary mb-2">
                  €{product.price.toFixed(2)}
                  <span className="text-xl text-muted-foreground font-normal ml-2">
                    / {product.unit}
                  </span>
                </p>
              </div>

              {product.description && (
                <p className="text-lg text-muted-foreground mb-6">
                  {product.description}
                </p>
              )}
            </div>

            <Button
              size="lg"
              className="w-full text-lg py-6"
              onClick={handleAddToCart}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="nutrition" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nutrition">
              <Info className="mr-2 h-4 w-4" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="cooking">
              <ChefHat className="mr-2 h-4 w-4" />
              Cooking Tips
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <MessageSquare className="mr-2 h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nutrition" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutritional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Serving Size</span>
                    <span className="font-semibold">{nutritionalInfo.servingSize}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Calories</span>
                    <span className="font-semibold">{nutritionalInfo.calories}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Protein</span>
                    <span className="font-semibold">{nutritionalInfo.protein}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total Fat</span>
                    <span className="font-semibold">{nutritionalInfo.fat}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Carbohydrates</span>
                    <span className="font-semibold">{nutritionalInfo.carbs}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cooking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cooking Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {cookingSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <ChefHat className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{review.user_name}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{review.comment}</p>
                    <Separator />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetails;
