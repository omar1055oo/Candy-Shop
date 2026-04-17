import { useId, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
}

const ProductAddDialog = ({ open, onClose }: Props) => {
  const [form, setForm] = useState({
    product_name: "",
    product_price: "",
    description: "",
    image_url: "",
    category_id: "",
    product_quantity: "0",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();
  const formUid = useId();
  const ids = {
    productName: `${formUid}-product-name`,
    price: `${formUid}-price`,
    quantity: `${formUid}-quantity`,
    description: `${formUid}-description`,
    imageUrl: `${formUid}-image-url`,
    category: `${formUid}-category`,
  };

  const handleSave = async () => {
    if (!form.product_name.trim()) {
      toast({ title: "أدخل اسم المنتج", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("products").insert({
      product_name: form.product_name.trim(),
      product_price: Number(form.product_price) || 0,
      description: form.description || null,
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      product_quantity: Number(form.product_quantity) || 0,
    });

    setSaving(false);
    if (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
      return;
    }
    toast({ title: "تم إضافة المنتج" });
    queryClient.invalidateQueries({ queryKey: ["all-products"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    setForm({ product_name: "", product_price: "", description: "", image_url: "", category_id: "", product_quantity: "0" });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة منتج جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label htmlFor={ids.productName} className="text-sm font-medium mb-1 block">
              اسم المنتج
            </label>
            <Input id={ids.productName} value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
          </div>
          <div>
            <label htmlFor={ids.price} className="text-sm font-medium mb-1 block">
              السعر
            </label>
            <Input id={ids.price} type="number" value={form.product_price} onChange={(e) => setForm({ ...form, product_price: e.target.value })} />
          </div>
          <div>
            <label htmlFor={ids.quantity} className="text-sm font-medium mb-1 block">
              الكمية
            </label>
            <Input id={ids.quantity} type="number" value={form.product_quantity} onChange={(e) => setForm({ ...form, product_quantity: e.target.value })} />
          </div>
          <div>
            <label htmlFor={ids.description} className="text-sm font-medium mb-1 block">
              الوصف
            </label>
            <Textarea id={ids.description} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label htmlFor={ids.imageUrl} className="text-sm font-medium mb-1 block">
              رابط الصورة
            </label>
            <Input id={ids.imageUrl} value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label htmlFor={ids.category} className="text-sm font-medium mb-1 block">
              القسم
            </label>
            <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
              <SelectTrigger id={ids.category}>
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "جارٍ الإضافة..." : "إضافة المنتج"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAddDialog;
