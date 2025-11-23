import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { mockDb, CartItem as StoredCartItem } from '@/services/mockDb';

export type CartItem = StoredCartItem;

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => mockDb.getCartSnapshot());

  useEffect(() => {
    mockDb.saveCart(cart);
  }, [cart]);

  const syncCart = (updater: (items: CartItem[]) => CartItem[]) => {
    setCart((previous) => {
      const updated = updater(previous);
      return updated;
    });
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    syncCart((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          toast({
            title: "Updated Cart",
            description: `${item.name} quantity increased`,
          });
        }, 0);
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      setTimeout(() => {
        toast({
          title: "Added to Cart",
          description: `${item.name} added to your cart`,
        });
      }, 0);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    const item = cart.find((i) => i.id === id);
    if (item) {
      setTimeout(() => {
        toast({
          title: "Removed from Cart",
          description: `${item.name} removed from your cart`,
        });
      }, 0);
    }
    syncCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    syncCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    syncCart(() => []);
    setTimeout(() => {
      toast({
        title: "Cart Cleared",
        description: "All items removed from cart",
      });
    }, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
