import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoreHeader from "@/components/store/StoreHeader";
import CategoriesSection from "@/components/store/CategoriesSection";
import ProductGrid from "@/components/store/ProductGrid";
import StoreFooter from "@/components/store/StoreFooter";
import { useCartStore } from "@/store/cartStore";
import { useOrderDetails } from "@/hooks/useOrderDetails";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const statusLabels: Record<string, string> = {
  pending: "جارٍ التأكيد",
  processing: "تم التأكيد",
  shipped: "جارٍ التوصيل",
};

const AddToOrderPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { setAddToOrderId, items, totalItems } = useCartStore();
  const { data: order, isLoading } = useOrderDetails(orderId || null);

  useEffect(() => {
    if (orderId) {
      setAddToOrderId(orderId);
    }
    return () => {
      // Don't clear on unmount — keep it while navigating to cart/checkout
    };
  }, [orderId, setAddToOrderId]);

  // If order is delivered/cancelled, redirect back
  useEffect(() => {
    if (!isLoading && order && (order.status === "delivered" || order.status === "cancelled")) {
      navigate("/account", { replace: true });
    }
  }, [order, isLoading, navigate]);

  const itemCount = totalItems();

  return (
    <div className="min-h-screen">
      <StoreHeader onSearch={setSearchQuery} />

      {/* Order info banner */}
      <div className="sticky top-0 z-20 bg-primary/10 border-b border-primary/20 backdrop-blur-sm">
        <div className="container flex items-center justify-between gap-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Badge variant="secondary" className="shrink-0 text-xs">
              {isLoading ? "..." : statusLabels[order?.status || ""] || order?.status}
            </Badge>
            <p className="text-sm font-medium text-primary truncate">
              إضافة منتجات إلى طلب #{orderId?.slice(0, 8)}
            </p>
          </div>
          {itemCount > 0 && (
            <Link to="/cart">
              <Button size="sm" className="shrink-0 gap-1.5">
                <ShoppingCart className="h-4 w-4" />
                <span>السلة ({itemCount})</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <main className="container">
        {!searchQuery && (
          <CategoriesSection
            selectedCategory={selectedCategory}
            onSelectCategory={(id) => setSelectedCategory(id === selectedCategory ? null : id)}
          />
        )}
        <ProductGrid searchQuery={searchQuery} categoryId={selectedCategory} />
      </main>
      <StoreFooter />
    </div>
  );
};

export default AddToOrderPage;