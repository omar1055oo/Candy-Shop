import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import StoreHeader from "@/components/store/StoreHeader";
import HeroBanner from "@/components/store/HeroBanner";
import CategoriesSection from "@/components/store/CategoriesSection";
import BestSellers from "@/components/store/BestSellers";
import ProductGrid from "@/components/store/ProductGrid";
import StoreFooter from "@/components/store/StoreFooter";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const setAddToOrderId = useCartStore((s) => s.setAddToOrderId);
  const { toast } = useToast();

  useEffect(() => {
    const orderId = searchParams.get("addToOrder");
    if (orderId) {
      setAddToOrderId(orderId);
      toast({ title: "اختر المنتجات لإضافتها للطلب الحالي" });
      searchParams.delete("addToOrder");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setAddToOrderId, setSearchParams, toast]);

  return (
    <div className="min-h-screen">
      <StoreHeader onSearch={setSearchQuery} />
      <main className="container">
        <HeroBanner />
        {!searchQuery && (
          <>
            <CategoriesSection
              selectedCategory={selectedCategory}
              onSelectCategory={(id) => setSelectedCategory(id === selectedCategory ? null : id)}
            />
            <BestSellers />
          </>
        )}
        <ProductGrid searchQuery={searchQuery} categoryId={selectedCategory} />
      </main>
      <StoreFooter />
    </div>
  );
};

export default Index;
