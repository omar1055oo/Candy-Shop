import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderDetailsItem {
  id: string;
  product_name: string;
  products_id: string;
  quantity: number;
  price: number;
}

export interface OrderDetails {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderDetailsItem[];
}

export const useOrderDetails = (orderId: string | null) => {
  return useQuery({
    queryKey: ["order-details", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      if (!orderId) {
        throw new Error("Order ID is required");
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .single();

      if (error) throw error;
      return data as OrderDetails;
    },
  });
};