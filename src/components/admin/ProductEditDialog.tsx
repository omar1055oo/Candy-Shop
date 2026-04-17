import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "@/types";

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ProductEditDialog = ({ product, open, onClose }: Props) => {
  const [form, setForm] = useState({
    product_name: "",
    product_price: "",
    product_quantity: "",
    description: "",
    image_url: "",
    category_id: "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();

  // تحديث البيانات فقط عند فتح النافذة بمنتج جديد
  useEffect(() => {
    if (product && open) {
      setForm({
        product_name: product.product_name || "",
        product_price: product.product_price?.toString() || "",
        product_quantity: product.product_quantity?.toString() || "0",
        description: product.description || "",
        image_url: product.image_url || "",
        category_id: product.category_id || "",
      });
    }
  }, [product, open]);

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);

    const hasImage = !!form.image_url?.trim();
    const newStatus = product.status === "Draft" && hasImage ? "Active" : product.status;

    const { error } = await supabase
      .from("products")
      .update({
        product_name: form.product_name,
        product_price: Number(form.product_price) || 0,
        product_quantity: Number(form.product_quantity) || 0,
        description: form.description || null,
        image_url: form.image_url || null,
        category_id: form.category_id || null,
        status: newStatus,
      })
      .eq("products_id", product.products_id);

    setSaving(false);
    if (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
      return;
    }
    toast({ title: "تم التحديث بنجاح" });
    queryClient.invalidateQueries({ queryKey: ["all-products"] });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* تم إضافة rounded-xl لجعل الحواف دائرية */}
      <DialogContent className="max-w-md rounded-xl border-none shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">تعديل المنتج</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium mb-1 block">اسم المنتج</label>
            <Input 
              className="rounded-lg" 
              value={form.product_name} 
              onChange={(e) => setForm({ ...form, product_name: e.target.value })} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1 block">السعر</label>
              <Input 
                type="number" 
                className="rounded-lg" 
                value={form.product_price} 
                onChange={(e) => setForm({ ...form, product_price: e.target.value })} 
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">المخزون</label>
              <Input 
                type="number" 
                className="rounded-lg" 
                value={form.product_quantity} 
                onChange={(e) => setForm({ ...form, product_quantity: e.target.value })} 
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">الوصف</label>
            <Textarea 
              className="rounded-lg resize-none" 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">رابط الصورة</label>
            <Input 
              className="rounded-lg" 
              value={form.image_url} 
              onChange={(e) => setForm({ ...form, image_url: e.target.value })} 
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">القسم</label>
            <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.image_url && (
            <div className="flex justify-center pt-2">
              <img src={form.image_url} alt="معاينة" className="h-20 w-20 rounded-xl object-cover border shadow-sm" />
            </div>
          )}

          <Button className="w-full rounded-lg h-11 text-base font-bold" onClick={handleSave} disabled={saving}>
            {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
