import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import StoreHeader from "@/components/store/StoreHeader";
import { Search, Package, Clock, CheckCircle, Truck, XCircle, ShoppingBag, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: "جارٍ التأكيد", icon: Clock, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  processing: { label: "تم التأكيد", icon: CheckCircle, color: "bg-blue-100 text-blue-700 border-blue-200" },
  shipped: { label: "جارٍ التوصيل", icon: Truck, color: "bg-purple-100 text-purple-700 border-purple-200" },
  delivered: { label: "تم التوصيل", icon: CheckCircle, color: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "ملغي", icon: XCircle, color: "bg-red-100 text-red-700 border-red-200" },
};

const AccountPage = () => {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<{ id: string; createdAt: string } | null>(null);
  const { toast } = useToast();
  const setAddToOrderId = useCartStore((state) => state.setAddToOrderId);

  const handleSearch = async () => {
    if (!phone.trim()) {
      toast({ title: "أدخل رقم هاتفك", variant: "destructive" });
      return;
    }
    setLoading(true);
    setSearched(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_phone", phone.trim())
      .order("created_at", { ascending: false })
      .limit(3);

    setLoading(false);
    if (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
      return;
    }
    setOrders(data || []);
  };

  const within30Min = (createdAt: string) => {
    return Date.now() - new Date(createdAt).getTime() < 30 * 60 * 1000;
  };

  const isDelivered = (status: string) => status === "delivered";

  const handleCancel = async () => {
    if (!cancelTarget) return;
    if (!within30Min(cancelTarget.createdAt)) {
      toast({ title: "لا يمكن إلغاء الطلب بعد مرور 30 دقيقة", variant: "destructive" });
      setCancelTarget(null);
      return;
    }
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", cancelTarget.id);
    setCancelTarget(null);
    if (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
      return;
    }
    toast({ title: "تم إلغاء الطلب" });
    handleSearch();
  };

  const handleRemoveItem = async (orderId: string, itemId: string, orderCreatedAt: string, itemPrice: number, itemQty: number) => {
    if (!within30Min(orderCreatedAt)) {
      toast({ title: "لا يمكن حذف المنتج بعد مرور 30 دقيقة", variant: "destructive" });
      return;
    }
    const { error: itemError } = await supabase.from("order_items").delete().eq("id", itemId);
    if (itemError) {
      toast({ title: "حدث خطأ", variant: "destructive" });
      return;
    }
    // Update total
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      const newTotal = Math.max(0, Number(order.total_amount) - itemPrice * itemQty);
      await supabase.from("orders").update({ total_amount: newTotal }).eq("id", orderId);
    }
    toast({ title: "تم حذف المنتج من الطلب" });
    handleSearch();
  };

  return (
    <div className="min-h-screen">
      <StoreHeader />
      <div className="container max-w-lg py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">تتبع طلباتك</h2>
            <p className="text-sm text-muted-foreground">أدخل رقم هاتفك لعرض طلباتك</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="رقم الهاتف"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1"
            type="tel"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 ml-2" />
            {loading ? "جارٍ البحث..." : "بحث"}
          </Button>
        </div>

        <p className="mb-4 text-xs text-muted-foreground">يتم عرض آخر 3 طلبات فقط لتسريع الصفحة.</p>

        <AnimatePresence mode="wait">
          {searched && !loading && orders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد طلبات لهذا الرقم</p>
            </motion.div>
          )}

          {orders.map((order, i) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const canModify = within30Min(order.created_at) && !isDelivered(order.status) && order.status !== "cancelled";
            const canAddItems = !isDelivered(order.status) && order.status !== "cancelled";

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border/50 p-4 mb-3 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" />
                    <Badge className={`${status.color} border`}>{status.label}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="space-y-1.5 mb-3">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-card-foreground">{item.product_name} × {item.quantity}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                        {canModify && order.order_items.length > 1 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleRemoveItem(order.id, item.id, order.created_at, item.price, item.quantity)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="font-bold text-primary">{Number(order.total_amount).toFixed(2)} ج.م</span>
                  <div className="flex gap-1.5">
                    {canAddItems && (
                        <Link to={`/add-to-order/${order.id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-8">
                          <Plus className="h-3.5 w-3.5 ml-1" />
                          إضافة منتج
                        </Button>
                      </Link>
                    )}
                    {canModify && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive text-xs h-8"
                        onClick={() => setCancelTarget({ id: order.id, createdAt: order.created_at })}
                      >
                        <XCircle className="h-3.5 w-3.5 ml-1" />
                        إلغاء الطلب
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AlertDialog open={!!cancelTarget} onOpenChange={(v) => !v && setCancelTarget(null)}>
        <AlertDialogContent dir="rtl" className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد إلغاء الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من إلغاء هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">تراجع</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90">
              إلغاء الطلب
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountPage;
