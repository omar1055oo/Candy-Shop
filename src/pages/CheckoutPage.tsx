import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { useCreateOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import StoreHeader from "@/components/store/StoreHeader";
import { supabase } from "@/integrations/supabase/client";
import ExistingOrderSummary from "@/components/store/ExistingOrderSummary";
import { useOrderDetails } from "@/hooks/useOrderDetails";
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
import { fetchFirstCartStockViolation, getStockShortageToast } from "@/lib/cartStock";

const TURNSTILE_SITE_KEY = "0x4AAAAAAC-lPdvNlYWWU2Ar";
const blockedStatuses = new Set(["delivered", "cancelled"]);

function isExistingOrderBlocked(order: { status: string } | null | undefined): boolean {
  return !order || blockedStatuses.has(order.status);
}

const CheckoutPage = () => {
  const { items, totalPrice, clearCart, addToOrderId, setAddToOrderId } = useCartStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const [showConfirm, setShowConfirm] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const { data: existingOrder, isLoading: isLoadingOrder } = useOrderDetails(addToOrderId);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    honeypot: "",
  });
  const checkoutFormUid = useId();
  const fieldIds = {
    name: `${checkoutFormUid}-customer-name`,
    phone: `${checkoutFormUid}-customer-phone`,
    address: `${checkoutFormUid}-customer-address`,
    honeypot: `${checkoutFormUid}-website`,
  };

  useEffect(() => {
    const existing = document.querySelector('script[src*="turnstile"]');
    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if ((window as any).turnstile && turnstileRef.current && !turnstileRef.current.hasChildNodes()) {
        (window as any).turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(null),
          theme: "light",
          language: "ar",
        });
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const resetTurnstileWidget = () => {
    const w = window as any;
    if (w.turnstile && turnstileRef.current) {
      w.turnstile.reset(turnstileRef.current);
    }
  };

  const validateAddToOrderFlow = (): boolean => {
    if (isLoadingOrder) {
      toast({ title: "جارٍ تحميل بيانات الطلب", variant: "destructive" });
      return false;
    }
    if (isExistingOrderBlocked(existingOrder)) {
      setAddToOrderId(null);
      toast({ title: "هذا الطلب لم يعد متاحًا للإضافة", variant: "destructive" });
      return false;
    }
    return true;
  };

  const validateNewOrderFormFields = (): boolean => {
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast({ title: "يرجى ملء جميع الحقول", variant: "destructive" });
      return false;
    }
    if (form.phone.trim().length < 11) {
      toast({ title: "رقم الهاتف غير صالح، يجب أن يكون 11 رقمًا على الأقل", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.honeypot) return;

    if (addToOrderId) {
      if (!validateAddToOrderFlow()) return;
    } else {
      if (!validateNewOrderFormFields()) return;
    }

    try {
      const stockViolation = await fetchFirstCartStockViolation(items);
      if (stockViolation) {
        toast(getStockShortageToast(stockViolation));
        return;
      }
    } catch {
      toast({ title: "تعذر التحقق من المخزون", variant: "destructive" });
      return;
    }

    if (!turnstileToken) {
      toast({ title: "يرجى إكمال التحقق أولاً", variant: "destructive" });
      return;
    }

    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-turnstile", {
        body: { token: turnstileToken },
      });
      if (error || !data?.success) {
        toast({ title: "فشل التحقق، حاول مرة أخرى", variant: "destructive" });
        setTurnstileToken(null);
        resetTurnstileWidget();
        setVerifying(false);
        return;
      }
    } catch {
      toast({ title: "خطأ في التحقق", variant: "destructive" });
      setVerifying(false);
      return;
    }
    setVerifying(false);
    setShowConfirm(true);
  };

  const confirmOrder = async () => {
    setShowConfirm(false);
    try {
      let stockViolation: { productName: string; available: number } | null;
      try {
        stockViolation = await fetchFirstCartStockViolation(items);
      } catch {
        toast({ title: "تعذر التحقق من المخزون", variant: "destructive" });
        return;
      }
      if (stockViolation) {
        toast(getStockShortageToast(stockViolation));
        return;
      }

      if (addToOrderId) {
        if (isExistingOrderBlocked(existingOrder)) {
          setAddToOrderId(null);
          toast({ title: "هذا الطلب لم يعد متاحًا للإضافة", variant: "destructive" });
          return;
        }

        const orderItems = items.map((item) => ({
          order_id: addToOrderId,
          products_id: item.product.products_id,
          quantity: item.quantity,
          price: item.product.product_price,
          product_name: item.product.product_name,
        }));

        const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
        if (itemsError) throw itemsError;

        const { data: orderTotalData } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("id", addToOrderId)
          .single();

        if (orderTotalData) {
          const newTotal = Number(orderTotalData.total_amount) + totalPrice();
          await supabase.from("orders").update({ total_amount: newTotal }).eq("id", addToOrderId);
        }

        clearCart();
        toast({ title: "تمت إضافة المنتجات للطلب بنجاح! 🎉" });
        navigate("/account");
      } else {
        await createOrder.mutateAsync({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_address: form.address,
          total_amount: totalPrice(),
          items: items.map((item) => ({
            products_id: item.product.products_id,
            quantity: item.quantity,
            price: item.product.product_price,
            product_name: item.product.product_name,
          })),
        });
        clearCart();
        toast({ title: "تم إرسال طلبك بنجاح! 🎉" });
        navigate("/account");
      }
    } catch {
      toast({ title: "حدث خطأ أثناء إرسال الطلب", variant: "destructive" });
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  const pageHeading = addToOrderId ? "إضافة منتجات للطلب" : "إتمام الطلب";
  const phoneFieldShowsError = form.phone.length > 0 && form.phone.length < 11;
  const phoneInputClassName = phoneFieldShowsError
    ? "border-destructive focus-visible:ring-destructive"
    : "";
  const isSubmitDisabled =
    createOrder.isPending || verifying || !turnstileToken || isLoadingOrder;

  let submitButtonLabel = "تأكيد الطلب";
  if (verifying) {
    submitButtonLabel = "جارٍ التحقق...";
  } else if (createOrder.isPending) {
    submitButtonLabel = "جارٍ الإرسال...";
  } else if (addToOrderId) {
    submitButtonLabel = "تأكيد إضافة المنتجات";
  }

  return (
    <div className="min-h-screen">
      <StoreHeader />
      <div className="container max-w-lg py-8">
        <h2 className="text-xl font-bold mb-6">{pageHeading}</h2>
        {addToOrderId && (
          <div className="mb-4">
            <ExistingOrderSummary order={existingOrder} newItems={items} isLoading={isLoadingOrder} />
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            id={fieldIds.honeypot}
            type="text"
            name="website"
            value={form.honeypot}
            onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          {!addToOrderId && (
            <>
              <div>
                <label htmlFor={fieldIds.name} className="text-sm font-medium mb-1 block">
                  الاسم الكامل
                </label>
                <Input id={fieldIds.name} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} />
              </div>
              <div>
                <label htmlFor={fieldIds.phone} className="text-sm font-medium mb-1 block">
                  رقم الهاتف
                </label>
                <Input
                  id={fieldIds.phone}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  maxLength={20}
                  className={phoneInputClassName}
                />
                {phoneFieldShowsError && (
                  <p className="text-[10px] text-destructive mt-1 font-medium">
                    رقم الهاتف غير صالح (يجب أن يكون 11 رقمًا على الأقل)
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={fieldIds.address} className="text-sm font-medium mb-1 block">
                  العنوان
                </label>
                <Textarea id={fieldIds.address} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} maxLength={500} />
              </div>
            </>
          )}

          {!addToOrderId && (
            <div className="bg-card p-4 rounded-lg space-y-2">
              {items.map((item) => (
                <div key={item.product.products_id} className="flex justify-between text-sm">
                  <span>
                    {item.product.product_name} × {item.quantity}
                  </span>
                  <span className="font-bold">{(item.product.product_price * item.quantity).toFixed(2)} ج.م</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>الإجمالي</span>
                <span className="text-primary">{totalPrice().toFixed(2)} ج.م</span>
              </div>
            </div>
          )}

          <div className="flex justify-center" ref={turnstileRef}></div>

          <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
            {submitButtonLabel}
          </Button>
        </form>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent dir="rtl" className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الطلب</AlertDialogTitle>
            <AlertDialogDescription>
              بعد تأكيد الطلب، لن تتمكن من إلغائه بعد مرور 30 دقيقة. يمكنك إضافة منتجات إضافية فقط.
              <br />
              <br />
              هل تريد تأكيد الطلب؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmOrder} className="w-full sm:w-auto">
              تأكيد الطلب
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CheckoutPage;
