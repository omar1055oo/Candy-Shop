import { ShoppingCart, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getStockShortageToast } from "@/lib/cartStock";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((s) => s.addItem);
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (product.product_quantity <= 0) {
      toast({ title: "نفد المخزون", variant: "destructive" });
      return;
    }
    const result = addItem(product);
    if (!result.ok) {
      toast(getStockShortageToast(result));
      return;
    }
    setAdded(true);
    toast({ title: `تمت إضافة ${product.product_name} إلى السلة` });
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col bg-card rounded-xl border border-border/40 overflow-hidden hover:shadow-xl hover:shadow-primary/10 transition-shadow duration-300"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.product_name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {product.product_quantity <= 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
              نفذت الكمية
            </span>
          </div>
        )}

        {/* تعديل لون الأكثر مبيعاً ليكون متناسق مع لون نفذت الكمية */}
        {product.is_best_seller && product.product_quantity > 0 && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-10">
            الأكثر مبيعاً
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold text-card-foreground line-clamp-2 mb-2">
          {product.product_name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-primary">
            {product.product_price.toFixed(2)} ج.م
          </span>
          <motion.div whileTap={{ scale: 0.85 }}>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleAdd}
              disabled={product.product_quantity <= 0}
              className={`h-9 w-9 rounded-full transition-all duration-300 disabled:opacity-40 ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-primary/15 text-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <ShoppingCart className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
