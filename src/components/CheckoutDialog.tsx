import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const checkoutSchema = z.object({
  address: z.string().trim().min(5, { message: "Address is required" }),
  city: z.string().trim().min(2, { message: "City is required" }),
  postalCode: z.string().trim().min(3, { message: "Postal code is required" }),
});

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CheckoutDialog = ({ open, onOpenChange }: CheckoutDialogProps) => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validated = checkoutSchema.parse(formData);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to place an order",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc("generate_order_number");

      if (orderNumberError) throw orderNumberError;

      const subtotal = getTotalPrice();
      const deliveryFee = 5.00;
      const taxAmount = subtotal * 0.1; // 10% tax
      const totalAmount = subtotal + deliveryFee + taxAmount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          order_number: orderNumberData,
          status: "pending",
          total_amount: totalAmount,
          delivery_fee: deliveryFee,
          tax_amount: taxAmount,
          notes: formData.notes,
          delivery_address: validated.address,
          delivery_city: validated.city,
          delivery_postal_code: validated.postalCode,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_name: item.name,
        product_category: item.category,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Create delivery record
      const { error: deliveryError } = await supabase
        .from("deliveries")
        .insert({
          order_id: order.id,
          status: "pending",
          estimated_delivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // +24 hours
        });

      if (deliveryError) throw deliveryError;

      // Generate invoice number
      const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
        .rpc("generate_invoice_number");

      if (invoiceNumberError) throw invoiceNumberError;

      // Create invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          order_id: order.id,
          invoice_number: invoiceNumberData,
          status: "draft",
          subtotal: subtotal,
          tax_amount: taxAmount,
          delivery_fee: deliveryFee,
          total_amount: totalAmount,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 days
        });

      if (invoiceError) throw invoiceError;

      toast({
        title: "Order Placed Successfully!",
        description: `Your order ${orderNumberData} has been confirmed.`,
      });

      clearCart();
      onOpenChange(false);
      setFormData({ address: "", city: "", postalCode: "", notes: "" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        console.error("Checkout error:", error);
        toast({
          title: "Order Failed",
          description: error.message || "Failed to place order. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address</Label>
            <Input
              id="address"
              placeholder="123 Main Street"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="New York"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                placeholder="10001"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Delivery Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Leave at door, ring bell, etc."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery:</span>
              <span>$5.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (10%):</span>
              <span>${(getTotalPrice() * 0.1).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Total:</span>
              <span>${(getTotalPrice() + 5 + getTotalPrice() * 0.1).toFixed(2)}</span>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Place Order"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
