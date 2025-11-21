import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'sonner'; // Sonner toast kullanıyoruz
import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  maxStock?: number; // Stok kontrolü için
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotalPrice: () => number;
  applyCoupon: (code: string) => Promise<boolean>;
  discount: number;
  couponCode: string | null;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Stok kontrolü ile sepete ekleme
  const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
    // Güncel stok bilgisini çek
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', item.id)
      .single();

    const currentStock = product?.stock_quantity || 0;
    const existingItem = cart.find((i) => i.id === item.id);
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + 1 > currentStock) {
      toast.error(`Üzgünüz, stokta sadece ${currentStock} adet ürün var.`);
      return;
    }

    setCart((prev) => {
      if (existingItem) {
        toast.success("Sepet güncellendi");
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1, maxStock: currentStock } : i
        );
      }
      toast.success("Sepete eklendi");
      return [...prev, { ...item, quantity: 1, maxStock: currentStock }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.info("Ürün sepetten çıkarıldı");
  };

  const updateQuantity = (id: string, quantity: number) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    if (item.maxStock && quantity > item.maxStock) {
      toast.error(`Maksimum stok: ${item.maxStock}`);
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCouponCode(null);
    localStorage.removeItem('cart');
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const getSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getTotalPrice = () => {
    const subtotal = getSubtotal();
    return Math.max(0, subtotal - discount);
  };

  const applyCoupon = async (code: string) => {
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      toast.error("Geçersiz veya süresi dolmuş kupon kodu.");
      return false;
    }

    // Süre ve kullanım limiti kontrolü
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      toast.error("Bu kuponun süresi dolmuş.");
      return false;
    }
    
    if (getSubtotal() < (coupon.min_order_amount || 0)) {
      toast.error(`Bu kuponu kullanmak için sepet tutarı en az ₺${coupon.min_order_amount} olmalı.`);
      return false;
    }

    let calculatedDiscount = 0;
    if (coupon.discount_type === 'percentage') {
      calculatedDiscount = (getSubtotal() * coupon.discount_value) / 100;
    } else {
      calculatedDiscount = coupon.discount_value;
    }

    setDiscount(calculatedDiscount);
    setCouponCode(code);
    toast.success("Kupon uygulandı!");
    return true;
  };

  const removeCoupon = () => {
    setDiscount(0);
    setCouponCode(null);
    toast.info("Kupon kaldırıldı.");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getSubtotal,
        getTotalPrice,
        applyCoupon,
        discount,
        couponCode,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
};
