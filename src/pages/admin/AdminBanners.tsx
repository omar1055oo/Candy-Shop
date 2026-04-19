import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBanners } from "@/hooks/useBanners";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const AdminBanners = () => {
  const { data: banners = [], isLoading } = useBanners();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState("");
  const [editingTargetUrl, setEditingTargetUrl] = useState("");

  const isTargetUrlMissingColumnError = (message?: string) => {
    if (!message) return false;
    const lower = message.toLowerCase();
    return lower.includes("target_url") && (lower.includes("column") || lower.includes("schema cache"));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) {
      toast({ title: "حدث خطأ أثناء الحذف", variant: "destructive" });
      return;
    }
    toast({ title: "تم حذف البانر" });
    queryClient.invalidateQueries({ queryKey: ["banners"] });
  };

  const handleAdd = async () => {
    if (!newUrl.trim()) {
      toast({ title: "يرجى إدخال رابط الصورة", variant: "destructive" });
      return;
    }
    const payload = {
      image_url: newUrl,
      target_url: targetUrl.trim() || null,
      sort_order: banners.length,
    };

    const { error } = await supabase.from("banners").insert(payload);
    if (error) {
      if (isTargetUrlMissingColumnError(error.message)) {
        // تم إضافة target_url هنا لضمان عدم ضياعه في حالة الـ retry
        const retry = await supabase.from("banners").insert({
          image_url: newUrl,
          target_url: targetUrl.trim() || null,
          sort_order: banners.length,
        });

        if (retry.error) {
          toast({ title: "حدث خطأ أثناء الإضافة", description: retry.error.message, variant: "destructive" });
          return;
        }
      } else {
        toast({ title: "حدث خطأ أثناء الإضافة", description: error.message, variant: "destructive" });
        return;
      }
    }
    setNewUrl("");
    setTargetUrl("");
    toast({ title: "تم إضافة البانر" });
    queryClient.invalidateQueries({ queryKey: ["banners"] });
  };

  const startEdit = (id: string, imageUrl: string, bannerTargetUrl: string | null) => {
    setEditingBannerId(id);
    setEditingImageUrl(imageUrl);
    setEditingTargetUrl(bannerTargetUrl || "");
  };

  const cancelEdit = () => {
    setEditingBannerId(null);
    setEditingImageUrl("");
    setEditingTargetUrl("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingImageUrl.trim()) {
      toast({ title: "يرجى إدخال رابط الصورة", variant: "destructive" });
      return;
    }

    const payload = {
      image_url: editingImageUrl.trim(),
      target_url: editingTargetUrl.trim() || null,
    };

    const { error } = await supabase
      .from("banners")
      .update(payload)
      .eq("id", id);

    if (error) {
      if (isTargetUrlMissingColumnError(error.message)) {
        // تم إضافة target_url هنا لضمان عدم ضياعه في حالة الـ retry
        const retry = await supabase
          .from("banners")
          .update({ 
            image_url: editingImageUrl.trim(),
            target_url: editingTargetUrl.trim() || null 
          })
          .eq("id", id);

        if (retry.error) {
          toast({ title: "حدث خطأ أثناء التعديل", description: retry.error.message, variant: "destructive" });
          return;
        }
      } else {
        toast({ title: "حدث خطأ أثناء التعديل", description: error.message, variant: "destructive" });
        return;
      }
    }

    toast({ title: "تم تحديث البانر" });
    cancelEdit();
    queryClient.invalidateQueries({ queryKey: ["banners"] });
  };

  return (
    <AdminLayout>
      <p className="text-sm text-muted-foreground mb-4">إدارة بانرات الصفحة الرئيسية</p>

      <div className="flex flex-col gap-2 mb-6">
        <Input
          placeholder="رابط صورة البانر الجديد"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />
        <Input
          placeholder="الرابط عند الضغط على البانر (اختياري)"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
        />
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 ml-2" />
          إضافة بانر
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-card rounded-lg overflow-hidden shadow-sm">
              <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-muted">
                <img
                  src={banner.image_url}
                  alt="بانر"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-2 space-y-2">
                {editingBannerId === banner.id ? (
                  <>
                    <Input
                      value={editingImageUrl}
                      onChange={(e) => setEditingImageUrl(e.target.value)}
                      placeholder="رابط الصورة"
                    />
                    <Input
                      value={editingTargetUrl}
                      onChange={(e) => setEditingTargetUrl(e.target.value)}
                      placeholder="رابط التحويل (اختياري)"
                    />
                  </>
                ) : (
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs text-muted-foreground truncate">
                      صورة: {banner.image_url}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      رابط: {banner.target_url || "-"}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-1">
                  {editingBannerId === banner.id ? (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="shrink-0 h-8 w-8"
                        onClick={() => handleSaveEdit(banner.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="shrink-0 h-8 w-8"
                        onClick={cancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 h-8 w-8"
                      onClick={() => startEdit(banner.id, banner.image_url, banner.target_url)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive shrink-0 h-8 w-8"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">لا توجد بانرات بعد</div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminBanners;
