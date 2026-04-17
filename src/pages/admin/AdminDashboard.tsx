import AdminLayout from "@/components/admin/AdminLayout";
import { Package, ShoppingBag, TrendingUp, Archive, AlertTriangle } from "lucide-react";
import { useAllProducts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";

const AdminDashboard = () => {
  const { data: products = [] } = useAllProducts();
  const { data: orders = [] } = useOrders();

  const activeProducts = products.filter((p) => p.status === "Active");
  const archivedProducts = products.filter((p) => p.status === "Draft");
  const lowStock = products.filter((p) => Number(p.product_quantity) > 0 && Number(p.product_quantity) < 5);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const stats = [
    { label: "إجمالي المنتجات", value: activeProducts.length.toString(), icon: Package, color: "bg-primary/10 text-primary" },
    { label: "المنتجات المؤرشفة", value: archivedProducts.length.toString(), icon: Archive, color: "bg-muted text-muted-foreground" },
    { label: "الطلبات الجديدة", value: pendingOrders.toString(), icon: ShoppingBag, color: "bg-accent/20 text-accent-foreground" },
    { label: "إجمالي الطلبات", value: orders.length.toString(), icon: TrendingUp, color: "bg-blue-100 text-blue-700" },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-card-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-card rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-bold text-card-foreground">منتجات قاربت على النفاد (أقل من 5)</h3>
          </div>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.products_id} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
                <span className="font-medium text-sm">{p.product_name}</span>
                <span className="text-sm font-bold text-destructive">{Number(p.product_quantity)} متبقي</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
