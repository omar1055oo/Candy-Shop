
-- Products: allow insert, update, delete publicly (temporary until auth)
CREATE POLICY "Anyone can insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update products" ON public.products FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete products" ON public.products FOR DELETE USING (true);

-- Banners: allow insert, update, delete publicly (temporary until auth)
CREATE POLICY "Anyone can insert banners" ON public.banners FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update banners" ON public.banners FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete banners" ON public.banners FOR DELETE USING (true);

-- Categories: allow insert, update, delete publicly (temporary until auth)
CREATE POLICY "Anyone can insert categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update categories" ON public.categories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete categories" ON public.categories FOR DELETE USING (true);

-- Orders: allow update publicly (for status changes)
CREATE POLICY "Anyone can update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
