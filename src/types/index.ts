export interface Product {
  products_id: string;
  product_name: string;
  product_price: number;
  price_cost: number;
  product_quantity: number;
  image_url: string | null;
  description: string | null;
  category_id: string | null;
  status: "Active" | "Draft";
  is_best_seller: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon_url: string | null;
  sort_order: number;
}

export interface Banner {
  id: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  products_id: string;
  quantity: number;
  price: number;
  product_name: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
