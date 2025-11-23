import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import Navigation from "@/components/Navigation";
import { ArrowLeft, ShieldCheck, Minus, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { localData } from "@/services/localData";
import type { PaymentMethod } from "@/services/localData";

const checkoutSchema = z.object({
  address: z.string().trim().min(5),
  city: z.string().trim().min(2),
  postalCode: z.string().trim().min(3),
});

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart, updateQuantity } = useCart();
  const discount = 0;
  const DELIVERY_FEE = 5;
  const VAT_RATE = 0.14;
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    postalCode: "",
    notes: "",
    paymentMethod: "card" as PaymentMethod,
  });

  // Sepet boşsa anasayfaya yönlendir
  useEffect(() => {
    if (cart.length === 0) {
      navigate("/");
    }
  }, [cart, navigate]);

  const paymentOptions: { value: PaymentMethod; label: string }[] = [
    { value: "card", label: t("checkout.payment.card") },
    { value: "cash", label: t("checkout.payment.cash") },
    { value: "invoice", label: t("checkout.payment.invoice") },
  ];

  const selectedPaymentLabel =
    paymentOptions.find((option) => option.value === formData.paymentMethod)?.label ?? paymentOptions[0].label;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = checkoutSchema.parse(formData);
      
      if (!user) {
        toast.error(t("common.error"), {
          description: "Please sign in to place an order",
        });
        navigate("/auth");
        return;
      }

      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const taxAmount = (subtotal - discount) * VAT_RATE;

      const order = await localData.createOrder({
        customer: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone: "N/A",
        },
        deliveryAddress: validated.address,
        deliveryCity: validated.city,
        deliveryPostalCode: validated.postalCode,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        items: cart,
      });

      toast.success(t('common.success'), {
        description: `Order ${order.orderNumber} created successfully! Payment: ${selectedPaymentLabel}`,
      });

      clearCart();
      navigate("/profile"); // Sipariş başarılı olunca profile git
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      let description = "Failed to place order.";
      if (error instanceof z.ZodError) {
        description = error.issues.map((issue) => issue.message).join(" ");
      } else if (error instanceof Error) {
        description = error.message;
      }
      toast.error(t('common.error'), {
        description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = (subtotal - discount) * VAT_RATE;
  const total = Math.max(0, subtotal - discount) + DELIVERY_FEE + tax;
  const vatPercentage = Math.round(VAT_RATE * 100);

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <Navigation />
      
      <div className="container px-4 md:px-6 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shopping
        </Button>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* SOL TARAF: FORM */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-[0_25px_60px_rgba(15,23,42,0.06)] rounded-[32px] border border-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {t('checkout.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="address">{t('checkout.address')}</Label>
                    <Input
                      id="address"
                      placeholder="Mannerheimintie 1"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">{t('checkout.city')}</Label>
                      <Input
                        id="city"
                        placeholder="Helsinki"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">{t('checkout.postalCode')}</Label>
                      <Input
                        id="postalCode"
                        placeholder="00100"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">{t('checkout.notes')}</Label>
                    <Textarea
                      id="notes"
                      placeholder={t('checkout.notesPlaceholder')}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">{t('checkout.paymentLabel')}</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethod: value as PaymentMethod,
                        }))
                      }
                    >
                      <SelectTrigger id="paymentMethod">
                        <SelectValue placeholder={t('checkout.paymentPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentOptions.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* SAĞ TARAF: ÖZET */}
          <div className="lg:col-span-2">
            <Card className="sticky top-24 shadow-[0_35px_80px_rgba(15,23,42,0.08)] rounded-[36px] border border-muted/30">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg">{t('order.details')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4 max-h-[300px] overflow-auto pr-2 mb-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 py-2">
                      <div className="h-16 w-16 rounded-md overflow-hidden border bg-white shrink-0">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-2">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.quantity} x €{item.price}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Decrease quantity for ${item.name}`}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Increase quantity for ${item.name}`}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right font-medium text-sm">
                        €{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.subtotal')}</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount:</span>
                      <span>-€{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('cart.delivery')}</span>
                    <span>€{DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('invoice.tax')} ({vatPercentage}%)</span>
                    <span>€{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('checkout.paymentLabel')}</span>
                    <span className="font-medium">{selectedPaymentLabel}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-lg">{t('cart.total')}</span>
                  <span className="font-bold text-2xl text-primary">€{total.toFixed(2)}</span>
                </div>

                <Button 
                  type="submit" 
                  form="checkout-form" 
                  className="w-full h-12 text-lg font-semibold shadow-lg" 
                  disabled={isLoading}
                >
                  {isLoading ? t('checkout.processing') : t('checkout.placeOrder')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
