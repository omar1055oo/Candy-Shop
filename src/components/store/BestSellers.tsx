import ProductCard from "./ProductCard";
import { useBestSellers } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

const BEST_SELLERS_LOADING_PLACEHOLDER_IDS = [
  "best-sellers-loading-ph-0",
  "best-sellers-loading-ph-1",
  "best-sellers-loading-ph-2",
  "best-sellers-loading-ph-3",
] as const;

const BestSellers = () => {
  const { data: products = [], isLoading } = useBestSellers();

  if (isLoading) {
    return (
      <section className="py-6">
        <h2 className="mb-4 text-lg font-bold text-foreground">الأكثر مبيعاً</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {BEST_SELLERS_LOADING_PLACEHOLDER_IDS.map((placeholderId) => (
            <Skeleton key={placeholderId} className="aspect-square rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">الأكثر مبيعاً</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {products.map((product) => (
          <ProductCard key={product.products_id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
