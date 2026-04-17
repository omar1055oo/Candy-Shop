import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
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
    const { error } = await supabase.from("banners").insert({
      image_url: newUrl,
      sort_order: banners.length,
    });
    if (error) {
      toast({ title: "حدث خطأ أثناء الإضافة", variant: "destructive" });
      return;
    }
    setNewUrl("");
    toast({ title: "تم إضافة البانر" });
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
              <div className="flex items-center justify-between p-2 gap-2">
                <p className="text-xs text-muted-foreground truncate flex-1 min-w-0">
                  {banner.image_url}
                </p>
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
