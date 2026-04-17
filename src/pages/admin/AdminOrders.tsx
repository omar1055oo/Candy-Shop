import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useOrders } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const statusOptions = [
  { value: "pending", label: "جارٍ التأكيد", variant: "outline" as const },
  { value: "processing", label: "تم التأكيد", variant: "default" as const },
  { value: "shipped", label: "جارٍ التوصيل", variant: "secondary" as const },
  { value: "delivered", label: "تم التوصيل", variant: "secondary" as const },
  { value: "cancelled", label: "ملغي", variant: "destructive" as const },
];

const AdminOrders = () => {
  const { data: orders = [], isLoading } = useOrders();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
      return;
    }
    toast({ title: "تم تحديث حالة الطلب" });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  };

  return (
    <AdminLayout>
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">لا توجد طلبات بعد</div>
        ) : (
          orders.map((order) => {
            const st = statusOptions.find((s) => s.value === order.status) || statusOptions[0];
            const isExpanded = expandedOrderId === order.id;
            return (
              <div key={order.id} className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                {/* Order summary row */}
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-4 text-right hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                >
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-card-foreground truncate">{order.customer_name}</span>
                      <Badge variant={st.variant} className="shrink-0 text-xs">{st.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{order.id.slice(0, 8)}</span>
                      <span className="font-bold text-sm text-primary">{Number(order.total_amount).toFixed(2)} ج.م</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.customer_phone} · {new Date(order.created_at).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/50 p-4 space-y-4">
                        {/* Status change */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">تغيير الحالة:</span>
                          <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                            <SelectTrigger className="h-8 flex-1 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Customer info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground mb-0.5">الاسم</p>
                            <p className="font-medium">{order.customer_name}</p>
                          </div>
                          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground mb-0.5">الهاتف</p>
                            <p className="font-medium">{order.customer_phone}</p>
                          </div>
                          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 sm:col-span-2">
                            <p className="text-xs text-muted-foreground mb-0.5">العنوان</p>
                            <p className="font-medium break-words">{order.customer_address}</p>
                          </div>
                          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 sm:col-span-2">
                            <p className="text-xs text-muted-foreground mb-0.5">وقت الطلب</p>
                            <p className="font-medium">{new Date(order.created_at).toLocaleString("ar-EG")}</p>
                          </div>
                        </div>

                        {/* Products */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold">المنتجات</h4>
                            <span className="text-xs text-muted-foreground">{order.order_items?.length || 0} منتج</span>
                          </div>
                          {order.order_items?.length ? (
                            <div className="space-y-2">
                              {order.order_items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
                                  <div className="min-w-0">
                                    <p className="font-medium truncate">{item.product_name}</p>
                                    <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                                  </div>
                                  <p className="font-semibold shrink-0">{(Number(item.price) * item.quantity).toFixed(2)} ج.م</p>
                                </div>
                              ))}
                              <div className="flex items-center justify-between border-t border-border/60 pt-2 font-semibold text-sm">
                                <span>الإجمالي</span>
                                <span>{Number(order.total_amount).toFixed(2)} ج.م</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">لا توجد منتجات.</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
