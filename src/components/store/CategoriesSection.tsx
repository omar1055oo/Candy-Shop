import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/hooks/useCategories";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  selectedCategory: string | null;
  onSelectCategory: (id: string) => void;
}

const CategoriesSection = ({ selectedCategory, onSelectCategory }: Props) => {
  const { data: categories = [], isLoading } = useCategories();

  if (isLoading) {
    return (
      <section className="py-6">
        <h2 className="mb-4 text-lg font-bold text-foreground">تسوق حسب الفئة</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-16 w-16 rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-6">
      <h2 className="mb-4 text-lg font-bold text-foreground">تسوق حسب الفئة</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat, i) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelectCategory(cat.id)}
              className="flex flex-shrink-0 flex-col items-center gap-2"
            >
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full border-2 transition-all duration-300 overflow-hidden",
                  isSelected
                    ? "border-primary bg-primary/20 shadow-md shadow-primary/20"
                    : "border-primary/20 bg-primary/5 hover:bg-primary/10 hover:shadow-sm"
                )}
              >
                {cat.icon_url ? (
                  <img src={cat.icon_url} alt={cat.name} className="h-full w-full object-cover rounded-full" />
                ) : (
                  <Tag className="h-6 w-6 text-primary" />
                )}
              </div>
              <span className={cn(
                "text-xs font-medium",
                isSelected ? "text-primary font-bold" : "text-foreground"
              )}>{cat.name}</span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoriesSection;
