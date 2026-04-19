import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Package, ShoppingBag, TrendingUp, Archive, AlertTriangle } from "lucide-react";
import { useAdminProductsCounts } from "@/hooks/useProducts";
import { useOrders } from "@/hooks/useOrders";

const AdminDashboard = () => {
  const { data: counts } = useAdminProductsCounts();
  const { data: orders = [] } = useOrders();

  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const stats = [
    { label: "إجمالي المنتجات", value: (counts?.totalCount ?? 0).toString(), icon: Package, color: "bg-primary/10 text-primary", href: "/admin/products" },
    { label: "المنتجات المؤرشفة", value: (counts?.archivedCount ?? 0).toString(), icon: Archive, color: "bg-muted text-muted-foreground", href: "/admin/products?tab=archived" },
    { label: "منتجات أقل من 5 قطع", value: (counts?.lowStockCount ?? 0).toString(), icon: AlertTriangle, color: "bg-accent/20 text-accent-foreground", href: "/admin/low-stock" },
    { label: "الطلبات الجديدة", value: pendingOrders.toString(), icon: ShoppingBag, color: "bg-accent/20 text-accent-foreground", href: "/admin/orders?status=pending" },
    { label: "إجمالي الطلبات", value: orders.length.toString(), icon: TrendingUp, color: "bg-blue-100 text-blue-700", href: "/admin/orders" },
  ];

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const Card = (
            <div className="bg-card rounded-lg p-5 shadow-sm transition hover:shadow-md">
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

          return (
            <Link key={stat.label} to={stat.href} className="block">
              {Card}
            </Link>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
