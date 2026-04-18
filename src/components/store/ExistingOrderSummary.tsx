import { Badge } from "@/components/ui/badge";
import type { CartItem } from "@/types";
import type { OrderDetails } from "@/hooks/useOrderDetails";

interface ExistingOrderSummaryProps {
  order?: OrderDetails;
  newItems: CartItem[];
  isLoading?: boolean;
}

const statusLabels: Record<string, string> = {
  pending: "جارٍ التأكيد",
  processing: "تم التأكيد",
  shipped: "جارٍ التوصيل",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

const formatMoney = (value: number) => `${Number(value).toFixed(2)} ج.م`;

const ExistingOrderSummary = ({ order, newItems, isLoading = false }: ExistingOrderSummaryProps) => {
  const additionsTotal = newItems.reduce(
    (sum, item) => sum + item.product.product_price * item.quantity,
    0
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
        جارٍ تحميل بيانات الطلب الحالي...
      </div>
    );
  }

  if (!order) return null;

  const currentItems = order.order_items || [];
  const mergedTotal = Number(order.total_amount) + additionsTotal;

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">إضافة إلى طلب قديم</p>
          <p className="text-xs text-muted-foreground">
            سيتم ضم المنتجات الجديدة إلى الطلب رقم {order.id.slice(0, 8)}
          </p>
        </div>
        <Badge variant="secondary" className="font-medium">
          {statusLabels[order.status] || order.status}
        </Badge>
      </div>

      <div className="grid gap-2 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-background/80 p-3">
          <p className="text-xs text-muted-foreground">العميل</p>
          <p className="font-medium text-foreground">{order.customer_name}</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/80 p-3">
          <p className="text-xs text-muted-foreground">رقم الهاتف</p>
          <p className="font-medium text-foreground">{order.customer_phone}</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/80 p-3">
          <p className="text-xs text-muted-foreground">العنوان</p>
          <p className="font-medium text-foreground line-clamp-2">{order.customer_address}</p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-background/80 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">المنتجات الحالية في الطلب</p>
            <span className="text-xs text-muted-foreground">قديم</span>
          </div>
          {currentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد منتجات محفوظة في هذا الطلب حالياً.</p>
          ) : (
            <div className="space-y-2">
              {currentItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate text-foreground">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium text-foreground">{formatMoney(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border/60 bg-background/80 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground">المنتجات الجديدة في السلة</p>
            <span className="text-xs text-primary">جديد</span>
          </div>
          {newItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">لم تضف منتجات جديدة بعد.</p>
          ) : (
            <div className="space-y-2">
              {newItems.map((item) => (
                <div key={item.product.products_id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 flex-1 truncate text-foreground">
                    {item.product.product_name} × {item.quantity}
                  </span>
                  <span className="shrink-0 font-medium text-primary">
                    {formatMoney(item.product.product_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-2 border-t border-border/60 pt-4 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">إجمالي الطلب الحالي</p>
          <p className="font-semibold text-foreground">{formatMoney(Number(order.total_amount))}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">إجمالي الإضافات الجديدة</p>
          <p className="font-semibold text-primary">{formatMoney(additionsTotal)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">الإجمالي بعد الإضافة</p>
          <p className="font-semibold text-foreground">{formatMoney(mergedTotal)}</p>
        </div>
      </div>
    </div>
  );
};

export default ExistingOrderSummary;