-- Add restrictive RLS policies to user_roles table to prevent privilege escalation

-- Prevent all users from inserting roles directly
-- Role assignment should only happen through the handle_new_user trigger
CREATE POLICY "Only system can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (false);

-- Only admins can update roles
CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete roles
CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add database-level validation constraints for products table
-- to enforce server-side validation
ALTER TABLE public.products
ADD CONSTRAINT check_price_reasonable CHECK (price >= 0 AND price <= 999999),
ADD CONSTRAINT check_stock_reasonable CHECK (stock_quantity >= 0 AND stock_quantity <= 1000000),
ADD CONSTRAINT check_name_length CHECK (char_length(name) <= 200),
ADD CONSTRAINT check_description_length CHECK (char_length(description) <= 2000);