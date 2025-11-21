-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  unit TEXT DEFAULT 'unit',
  image_url TEXT NOT NULL,
  description TEXT,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view active products
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- Admins can manage all products
CREATE POLICY "Admins can manage all products"
  ON public.products FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Admin can view all profiles for customer management
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert some sample products
INSERT INTO public.products (name, category, price, unit, image_url, description, stock_quantity) VALUES
('Fresh Apples', 'Fruits', 3.99, 'lb', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&h=500&fit=crop', 'Crisp and juicy red apples', 100),
('Organic Bananas', 'Fruits', 2.49, 'lb', 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&h=500&fit=crop', 'Sweet organic bananas', 150),
('Tomatoes', 'Vegetables', 4.29, 'lb', 'https://images.unsplash.com/photo-1546470427-e26264b0ed55?w=500&h=500&fit=crop', 'Fresh vine-ripened tomatoes', 80),
('Fresh Carrots', 'Vegetables', 2.99, 'lb', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&h=500&fit=crop', 'Organic carrots', 120),
('Premium Beef', 'Meat', 12.99, 'lb', 'https://images.unsplash.com/photo-1588347818036-be5e2bbf85c5?w=500&h=500&fit=crop', 'Premium quality beef', 50),
('Chicken Breast', 'Meat', 8.99, 'lb', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&h=500&fit=crop', 'Fresh chicken breast', 70),
('Fresh Milk', 'Dairy', 4.49, 'gal', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&h=500&fit=crop', 'Whole milk', 60),
('Greek Yogurt', 'Dairy', 5.99, 'pack', 'https://images.unsplash.com/photo-1625845478827-4e8a48e57090?w=500&h=500&fit=crop', 'Creamy Greek yogurt', 90),
('Orange Juice', 'Beverages', 6.49, 'bottle', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=500&fit=crop', 'Fresh squeezed orange juice', 45),
('Coffee Beans', 'Beverages', 14.99, 'lb', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&h=500&fit=crop', 'Premium coffee beans', 35),
('Sourdough Bread', 'Bakery', 5.49, 'loaf', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&h=500&fit=crop', 'Artisan sourdough bread', 40),
('Croissants', 'Bakery', 7.99, 'pack', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&h=500&fit=crop', 'Buttery croissants', 55);