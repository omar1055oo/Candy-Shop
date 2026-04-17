import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, StarOff, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useAllProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const AdminBestSellers = () => {
  const { data: products = [], isLoading } = useAllProducts();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const toggleBestSeller = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ is_best_seller: !current })
      .eq("products_id", id);

    if (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
      return;
    }
    toast({ title: "تم تحديث الأكثر مبيعاً" });
    queryClient.invalidateQueries({ queryKey: ["all-products"] });
    queryClient.invalidateQueries({ queryKey: ["best-sellers"] });
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.trim().toLowerCase();
    return products.filter((p) => p.product_name.toLowerCase().includes(q));
  }, [products, search]);

  const bestSellers = filtered.filter((p) => p.is_best_seller);
  const others = filtered.filter((p) => !p.is_best_seller);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  const ProductRow = ({ p, isBest }: { p: typeof products[0]; isBest: boolean }) => (
    <div className="flex items-center gap-2 bg-card p-2.5 rounded-lg shadow-sm">
      <Star className={`h-4 w-4 shrink-0 ${isBest ? "text-primary fill-primary" : "text-muted-foreground"}`} />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm block truncate">{p.product_name}</span>
        <Badge variant="outline" className="text-[10px] mt-0.5">{Number(p.product_price).toFixed(2)} ج.م</Badge>
      </div>
      <Button
        size="sm"
        variant={isBest ? "ghost" : "outline"}
        className="shrink-0 text-xs h-7 px-2"
        onClick={() => toggleBestSeller(p.products_id, isBest)}
      >
        {isBest ? <><StarOff className="h-3 w-3 ml-1" />إزالة</> : <><Star className="h-3 w-3 ml-1" />تمييز</>}
      </Button>
    </div>
  );

  return (
    <AdminLayout>
      <p className="text-sm text-muted-foreground mb-4">
        اختر المنتجات التي تظهر في قسم "الأكثر مبيعاً"
      </p>

      <div className="relative mb-5">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9"
        />
      </div>

      <h3 className="font-bold mb-3 text-card-foreground text-sm">المنتجات المميزة ({bestSellers.length})</h3>
      <div className="space-y-2 mb-8">
        {bestSellers.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">لا توجد منتجات مميزة</p>
        )}
        {bestSellers.map((p) => (
          <ProductRow key={p.products_id} p={p} isBest />
        ))}
      </div>

      <h3 className="font-bold mb-3 text-card-foreground text-sm">جميع المنتجات ({others.length})</h3>
      <div className="space-y-2">
        {others.map((p) => (
          <ProductRow key={p.products_id} p={p} isBest={false} />
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminBestSellers;
