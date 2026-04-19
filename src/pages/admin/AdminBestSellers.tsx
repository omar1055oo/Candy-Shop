import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, StarOff, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { useAdminBestSellersPage } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const AdminBestSellers = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useAdminBestSellersPage(currentPage, search);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;
  const bestSellersCount = data?.bestSellersCount ?? 0;

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
    queryClient.invalidateQueries({ queryKey: ["admin-best-sellers-page"] });
  };

  const paginationItems = useMemo(() => {
    const pages: Array<number | "ellipsis"> = [];
    const maxButtons = 7;

    if (totalPages <= maxButtons) {
      for (let p = 1; p <= totalPages; p++) pages.push(p);
      return pages;
    }

    const windowSize = 2;
    const start = Math.max(2, currentPage - windowSize);
    const end = Math.min(totalPages - 1, currentPage + windowSize);

    pages.push(1);
    if (start > 2) pages.push("ellipsis");
    for (let p = start; p <= end; p++) pages.push(p);
    if (end < totalPages - 1) pages.push("ellipsis");
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

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

  const ProductRow = ({ p }: { p: typeof products[0] }) => (
    <div className="flex items-center gap-2 bg-card p-2.5 rounded-lg shadow-sm">
      <Star className={`h-4 w-4 shrink-0 ${p.is_best_seller ? "text-primary fill-primary" : "text-muted-foreground"}`} />
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm block truncate">{p.product_name}</span>
        <Badge variant="outline" className="text-[10px] mt-0.5">{Number(p.product_price).toFixed(2)} ج.م</Badge>
      </div>
      <Button
        size="sm"
        variant={p.is_best_seller ? "ghost" : "outline"}
        className="shrink-0 text-xs h-7 px-2"
        onClick={() => toggleBestSeller(p.products_id, p.is_best_seller)}
      >
        {p.is_best_seller ? <><StarOff className="h-3 w-3 ml-1" />إزالة</> : <><Star className="h-3 w-3 ml-1" />تمييز</>}
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
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="pr-9"
        />
      </div>

      <h3 className="font-bold mb-3 text-card-foreground text-sm">المنتجات المميزة ({bestSellersCount})</h3>
      <div className="space-y-2">
        {products.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">لا توجد منتجات</p>
        )}
        {products.map((p) => (
          <ProductRow key={p.products_id} p={p} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <div className="sm:hidden flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              السابق
            </Button>
            <div className="text-sm text-muted-foreground">
              صفحة {currentPage} من {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              التالي
            </Button>
          </div>

          <div className="hidden sm:block overflow-x-auto pb-1">
            <Pagination className="justify-center">
              <PaginationContent className="flex-nowrap">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>

                {paginationItems.map((item, idx) => (
                  <PaginationItem key={`${item}-${idx}`}>
                    {item === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={item === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(item);
                        }}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBestSellers;
