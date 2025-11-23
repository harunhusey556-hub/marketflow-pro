import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SheetClose } from "@/components/ui/sheet"; // Sheet'i kapatmak için

const Cart = () => {
  const { t } = useTranslation();
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t('cart.empty')}</h3>
        <p className="text-muted-foreground text-center">
          Add some products to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-serif font-bold">{t('cart.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {cart.length} {t('cart.items')}
        </p>
      </div>

      <ScrollArea className="flex-1 -mx-6 px-6">
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-md"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{item.name}</h4>
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <p className="text-primary font-bold mt-1">
                  €{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col justify-between items-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label={`Remove ${item.name} from cart`}
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Decrease quantity for ${item.name}`}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Increase quantity for ${item.name}`}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="mt-6 space-y-4">
        <Separator />
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('cart.subtotal')}</span>
            <span className="font-medium">€{getTotalPrice().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('cart.delivery')}</span>
            <span className="font-medium">€5.00</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>{t('cart.total')}</span>
            <span className="text-primary">€{(getTotalPrice() + 5).toFixed(2)}</span>
          </div>
        </div>
        <div className="space-y-2">
          {/* SheetClose componenti tıklandığında yan menüyü kapatır */}
          <SheetClose asChild>
            <Button type="button" className="w-full" size="lg" onClick={handleCheckoutClick}>
              {t('cart.checkout')}
            </Button>
          </SheetClose>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={clearCart}
            type="button"
            aria-label={t('cart.clear')}
          >
            {t('cart.clear')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
