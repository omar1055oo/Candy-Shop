import { useMemo, useState } from "react";
import { AlertTriangle, Archive, Search } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAdminLowStockPage } from "@/hooks/useProducts";

const AdminLowStock = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useAdminLowStockPage(currentPage, search);

  const products = data?.products ?? [];
  const totalPages = data?.totalPages ?? 1;

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

  return (
    <AdminLayout>
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <h2 className="font-bold text-card-foreground">المنتجات الأقل من 5 قطع</h2>
      </div>

      <div className="relative w-full sm:w-80 mb-5">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث عن منتج..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="pr-10"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {products.map((product) => (
              <div key={product.products_id} className="bg-card rounded-lg p-3 shadow-sm flex items-start gap-3">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="h-14 w-14 rounded-md object-cover shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{product.product_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{product.products_id}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs font-bold text-primary">{Number(product.product_price).toFixed(2)} ج.م</span>
                    <Badge variant="destructive" className="text-[10px] h-5">
                      متبقي {Number(product.product_quantity)}
                    </Badge>
                    {!product.image_url && (
                      <Badge variant="outline" className="text-[10px] h-5">
                        بدون صورة
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">لا توجد منتجات مطابقة</div>
            )}
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
        </>
      )}
    </AdminLayout>
  );
};

export default AdminLowStock;
