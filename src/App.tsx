import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import ProductDetails from "./pages/ProductDetails";
import Profile from "@/pages/Profile";
import Wishlist from "@/pages/Wishlist";
import Checkout from "./pages/Checkout"; // <-- added

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} /> {/* <-- BU SATIRI EKLEYİN */}
            <Route path="/wishlist" element={<Wishlist />} /> {/* <-- BUNU DA EKLEYİN */}
            <Route path="/checkout" element={<Checkout />} /> {/* checkout route */}
            <Route path="/product/:id" element={<ProductDetails />} />
            {/* CATCH-ALL ROUTE EN SONDA OLMALI */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;