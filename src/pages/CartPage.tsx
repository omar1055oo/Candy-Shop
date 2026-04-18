import { Minus, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import StoreHeader from "@/components/store/StoreHeader";
import ExistingOrderSummary from "@/components/store/ExistingOrderSummary";
import { useOrderDetails } from "@/hooks/useOrderDetails";
import { useToast } from "@/hooks/use-toast";
import { getStockShortageToast } from "@/lib/cartStock";

const CartPage = () => {
  const { toast } = useToast();
  const { items, removeItem, updateQuantity, totalPrice, clearCart, addToOrderId } = useCartStore();
  const { data: existingOrder, isLoading: isLoadingOrder } = useOrderDetails(addToOrderId);

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <StoreHeader />
        <div className="container py-16 text-center">
          <p className="text-lg text-muted-foreground mb-4">سلة التسوق فارغة</p>
          <Link to="/">
            <Button>العودة للتسوق</Button>
          </Link>
        </div>
      </div>
    );
  }

  // حساب الإجمالي النهائي (الجديد + القديم في حالة الإضافة لطلب)
  const finalDisplayPrice = addToOrderId && existingOrder 
    ? totalPrice() + (existingOrder.total_amount || 0) 
    : totalPrice();

  return (
    <div className="min-h-screen">
      <StoreHeader />
      <div className="container py-6">
        <h2 className="text-xl font-bold mb-6">سلة التسوق</h2>
        {addToOrderId && (
          <div className="mb-4">
            <ExistingOrderSummary order={existingOrder} newItems={items} isLoading={isLoadingOrder} />
          </div>
        )}
        {addToOrderId && items.length > 0 && (
          <div className="mb-3 text-sm text-muted-foreground">المنتجات التالية جديدة وسيتم إضافتها إلى الطلب القديم عند الإتمام.</div>
        )}
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.product.products_id} className="flex items-center gap-4 bg-card p-4 rounded-lg shadow-sm">
              <img
                src={item.product.image_url || "/placeholder.svg"}
                alt={item.product.product_name}
                className="h-20 w-20 shrink-0 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="truncate font-semibold text-card-foreground">{item.product.product_name}</h3>
                <p className="text-sm text-primary font-bold">{item.product.product_price.toFixed(2)} ج.م</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.product.products_id, item.quantity - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => {
                    const result = updateQuantity(item.product.products_id, item.quantity + 1);
                    if (!result.ok) toast(getStockShortageToast(result));
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button size="icon" variant="ghost" className="shrink-0 text-destructive" onClick={() => removeItem(item.product.products_id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-card p-6 rounded-lg shadow-sm">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>الإجمالي</span>
            <span className="text-primary">{finalDisplayPrice.toFixed(2)} ج.م</span>
          </div>
          <div className="flex gap-3">
            <Link to="/checkout" className="flex-1">
              <Button className="w-full" disabled={!!addToOrderId && !isLoadingOrder && !existingOrder}>
                {addToOrderId ? "إضافة إلى الطلب" : "إتمام الشراء"}
              </Button>
            </Link>
            <Button variant="outline" onClick={clearCart}>تفريغ السلة</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
