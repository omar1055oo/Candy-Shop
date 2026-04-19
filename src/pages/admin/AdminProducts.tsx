import { useMemo, useState, useRef } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Search, FileSpreadsheet, Loader2, Archive, Eye, Pencil } from "lucide-react";
import { useAdminProductsCounts, useAdminProductsPage, useAllProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ProductEditDialog from "@/components/admin/ProductEditDialog";
import ProductAddDialog from "@/components/admin/ProductAddDialog";
import type { Product } from "@/types";
import * as XLSX from "xlsx";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const AdminProducts = () => {
  const { data: allProducts = [] } = useAllProducts();
  const { data: counts } = useAdminProductsCounts();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ added: number; updated: number } | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const status = activeTab === "active" ? "Active" : "Draft";
  const { data, isLoading } = useAdminProductsPage({
    status,
    searchQuery: search,
    currentPage,
  });

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

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("products_id", id);
    if (error) {
      toast({ title: "حدث خطأ أثناء الحذف", variant: "destructive" });
      return;
    }
    toast({ title: "تم حذف المنتج" });
    invalidateAll();
  };

  const handleActivate = async (id: string) => {
    const { error } = await supabase.from("products").update({ status: "Active" }).eq("products_id", id);
    if (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
      return;
    }
    toast({ title: "تم تفعيل المنتج" });
    invalidateAll();
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["all-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["best-sellers"] });
    queryClient.invalidateQueries({ queryKey: ["admin-products-page"] });
    queryClient.invalidateQueries({ queryKey: ["admin-products-counts"] });
    queryClient.invalidateQueries({ queryKey: ["admin-low-stock-page"] });
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) {
        toast({ title: "الملف فارغ", variant: "destructive" });
        setUploading(false);
        return;
      }

      const productsToUpsert = rows.map((row) => ({
        products_id: String(row["products_id"] || "").trim(),
        product_name: String(row["product_name"] || "").trim(),
        product_price: Number(row["product_price"]) || 0,
        product_quantity: Number(row["product_quantity"]) || 0,
      })).filter((p) => p.products_id && p.product_name);

      if (productsToUpsert.length === 0) {
        toast({ title: "لم يتم العثور على بيانات صالحة", variant: "destructive" });
        setUploading(false);
        return;
      }

      const existingIds = new Set(allProducts.map((p) => p.products_id));

      const batchSize = 100;
      let added = 0;
      let updated = 0;

      for (let i = 0; i < productsToUpsert.length; i += batchSize) {
        const batch = productsToUpsert.slice(i, i + batchSize);

        const { error } = await supabase
          .from("products")
          .upsert(batch, { onConflict: "products_id" });

        if (error) {
          toast({ title: `خطأ في الدفعة ${Math.floor(i / batchSize) + 1}`, description: error.message, variant: "destructive" });
          continue;
        }

        batch.forEach((p) => {
          if (existingIds.has(p.products_id)) {
            updated++;
          } else {
            added++;
          }
        });
      }

      setUploadResult({ added, updated });
      toast({ title: `تم رفع ${productsToUpsert.length} منتج بنجاح`, description: `${added} جديد، ${updated} تم تحديثه` });
      invalidateAll();
    } catch (err) {
      toast({ title: "خطأ في قراءة الملف", description: String(err), variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const ProductCard = ({ product, showActivateBtn = false }: { product: Product; showActivateBtn?: boolean }) => (
    <div className="bg-card rounded-lg p-3 shadow-sm flex items-start gap-3">
      {product.image_url ? (
        <img src={product.image_url} alt={product.product_name} className="h-14 w-14 rounded-md object-cover shrink-0" loading="lazy" />
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
          <span className="text-xs text-muted-foreground">مخزون: {Number(product.product_quantity)}</span>
          <Badge variant={product.status === "Active" ? "default" : "secondary"} className="text-[10px] h-5">
            {product.status === "Active" ? "نشط" : "مؤرشف"}
          </Badge>
          {!product.image_url && (
            <Badge variant="outline" className="text-[10px] h-5">بدون صورة</Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditProduct(product)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        {showActivateBtn && product.image_url && (
          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleActivate(product.products_id)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.products_id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
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
        <div className="flex gap-2 w-full sm:w-auto">
          <input ref={fileRef} type="file" accept=".xls,.xlsx,.csv" className="hidden" onChange={handleExcelUpload} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex-1 sm:flex-none">
            {uploading ? <Loader2 className="h-4 w-4 ml-1 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 ml-1" />}
            {uploading ? "رفع..." : "Excel"}
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 ml-1" />
            إضافة
          </Button>
        </div>
      </div>

      {uploadResult && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 text-sm text-foreground">
          ✅ تم الرفع — <strong>{uploadResult.added}</strong> جديد، <strong>{uploadResult.updated}</strong> تحديث
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <Tabs
          value={activeTab}
          dir="rtl"
          onValueChange={(v) => {
            const next = v === "archived" ? "archived" : "active";
            setActiveTab(next);
            setCurrentPage(1);
          }}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="active">نشط ({counts?.activeCount ?? 0})</TabsTrigger>
            <TabsTrigger value="archived">
              <Archive className="h-4 w-4 ml-1" />
              مؤرشف ({counts?.archivedCount ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="space-y-2">
              {products.map((p) => (
                <ProductCard key={p.products_id} product={p} />
              ))}
              {products.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">لا توجد منتجات</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="archived">
            <div className="bg-muted/30 border border-dashed border-border rounded-lg p-3 mb-4 text-sm text-muted-foreground">
              <Archive className="h-4 w-4 inline ml-1" />
              أضف صورة ووصف من زر التعديل وسيتم تفعيله تلقائياً
            </div>
            <div className="space-y-2">
              {products.map((p) => (
                <ProductCard key={p.products_id} product={p} showActivateBtn />
              ))}
              {products.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">لا توجد منتجات</div>
              )}
            </div>
          </TabsContent>

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
        </Tabs>
      )}

      <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <p className="font-medium mb-1">📋 تنسيق Excel:</p>
        <p><code className="bg-muted px-1 rounded">products_id</code> | <code className="bg-muted px-1 rounded">product_name</code> | <code className="bg-muted px-1 rounded">product_price</code> | <code className="bg-muted px-1 rounded">product_quantity</code></p>
      </div>

      {editProduct && (
        <ProductEditDialog product={editProduct} open={!!editProduct} onClose={() => setEditProduct(null)} />
      )}
      <ProductAddDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </AdminLayout>
  );
};

export default AdminProducts;
