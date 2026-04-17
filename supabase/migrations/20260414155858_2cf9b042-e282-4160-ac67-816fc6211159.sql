CREATE POLICY "Anyone can delete order items"
ON public.order_items
FOR DELETE
USING (true);