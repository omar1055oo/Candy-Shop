import { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Package, ShoppingBag, TrendingUp, Archive, AlertTriangle } from "lucide-react";
import { useAdminLowStockPage, useAdminProductsCounts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: counts } = useAdminProductsCounts();
  const { data: lowStockData } = useAdminLowStockPage(currentPage);
  const { data: orders = [] } = useOrders();

  const lowStock = lowStockData?.products ?? [];
  const totalLowStockPages = lowStockData?.totalPages ?? 1;
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const paginationItems = useMemo(() => {
    const pages: Array<number | "ellipsis"> = [];
    const totalPages = totalLowStockPages;
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
  }, [currentPage, totalLowStockPages]);

  const stats = [
    { label: "إجمالي المنتجات", value: (counts?.totalCount ?? 0).toString(), icon: Package, color: "bg-primary/10 text-primary" },
    { label: "المنتجات المؤرشفة", value: (counts?.archivedCount ?? 0).toString(), icon: Archive, color: "bg-muted text-muted-foreground" },
    { label: "الطلبات الجديدة", value: pendingOrders.toString(), icon: ShoppingBag, color: "bg-accent/20 text-accent-foreground" },
    { label: "إجمالي الطلبات", value: orders.length.toString(), icon: TrendingUp, color: "bg-blue-100 text-blue-700" },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-card rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-bold text-card-foreground">منتجات قاربت على النفاد (أقل من 5)</h3>
          </div>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.products_id} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
                <span className="font-medium text-sm">{p.product_name}</span>
                <span className="text-sm font-bold text-destructive">{Number(p.product_quantity)} متبقي</span>
              </div>
            ))}
          </div>

          {totalLowStockPages > 1 && (
            <div className="mt-4">
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
                  صفحة {currentPage} من {totalLowStockPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalLowStockPages, p + 1))}
                  disabled={currentPage >= totalLowStockPages}
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
                          setCurrentPage((p) => Math.min(totalLowStockPages, p + 1));
                        }}
                        className={currentPage >= totalLowStockPages ? "pointer-events-none opacity-50" : undefined}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
