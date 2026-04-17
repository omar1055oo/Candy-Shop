import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const PRODUCT_GRID_LOADING_PLACEHOLDER_IDS = Array.from(
  { length: 12 },
  (_, i) => `product-grid-loading-ph-${i}`,
) as readonly string[];

interface ProductGridProps {
  searchQuery?: string;
  categoryId?: string | null;
}

const ProductGrid = ({ searchQuery, categoryId }: ProductGridProps) => {
  const { data: products = [], isLoading } = useProducts(searchQuery, categoryId);

  if (isLoading) {
    return (
      <section className="py-6">
        <h2 className="mb-4 text-lg font-bold text-foreground">جميع المنتجات</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {PRODUCT_GRID_LOADING_PLACEHOLDER_IDS.map((placeholderId) => (
            <Skeleton key={placeholderId} className="aspect-square rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-6">
      <h2 className="mb-4 text-lg font-bold text-foreground">جميع المنتجات</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {products.map((product) => (
          <ProductCard key={product.products_id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          {searchQuery ? "لا توجد منتجات مطابقة للبحث" : "لا توجد منتجات بعد"}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
