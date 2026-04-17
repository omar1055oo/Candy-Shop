import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, GripVertical, Pencil, Check, X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const AdminCategories = () => {
  const { data: categories = [], isLoading } = useCategories();
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast({ title: "أدخل اسم القسم", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("categories").insert({
      name: newName.trim(),
      icon_url: newIcon.trim() || null,
      sort_order: categories.length,
    });
    if (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
      return;
    }
    setNewName("");
    setNewIcon("");
    toast({ title: "تم إضافة القسم" });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "حدث خطأ أثناء الحذف", variant: "destructive" });
      return;
    }
    toast({ title: "تم حذف القسم" });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const startEdit = (cat: { id: string; name: string; icon_url: string | null }) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIcon(cat.icon_url || "");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) {
      toast({ title: "أدخل اسم القسم", variant: "destructive" });
      return;
    }
    const { error } = await supabase
      .from("categories")
      .update({ name: editName.trim(), icon_url: editIcon.trim() || null })
      .eq("id", editingId);
    if (error) {
      toast({ title: "حدث خطأ", variant: "destructive" });
      return;
    }
    setEditingId(null);
    toast({ title: "تم تحديث القسم" });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <AdminLayout>
      <p className="text-sm text-muted-foreground mb-6">إدارة أقسام المنتجات</p>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <Input
          placeholder="اسم القسم الجديد"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1"
        />
        <Input
          placeholder="رابط الأيقونة (اختياري)"
          value={newIcon}
          onChange={(e) => setNewIcon(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleAdd} className="shrink-0">
          <Plus className="h-4 w-4 ml-2" />
          إضافة
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-3 bg-card p-4 rounded-lg shadow-sm">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              {cat.icon_url && (
                <img src={cat.icon_url} alt={cat.name} className="h-10 w-10 rounded-full object-cover shrink-0" />
              )}
              {editingId === cat.id ? (
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    placeholder="اسم القسم"
                  />
                  <Input
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className="flex-1"
                    placeholder="رابط الأيقونة"
                  />
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="text-green-600 h-8 w-8" onClick={handleSaveEdit}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="flex-1 font-medium text-card-foreground">{cat.name}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(cat)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">لا توجد أقسام بعد</div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
