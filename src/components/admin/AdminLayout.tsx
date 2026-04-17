import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Image,
  Star,
  LogOut,
  Menu,
  X,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { path: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { path: "/admin/products", label: "المنتجات", icon: Package },
  { path: "/admin/categories", label: "الأقسام", icon: Layers },
  { path: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { path: "/admin/banners", label: "البانرات", icon: Image },
  { path: "/admin/best-sellers", label: "الأكثر مبيعاً", icon: Star },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden">
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-40 bg-secondary/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSidebarOpen(false);
            }
          }}
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-50 w-64 max-w-[85vw] bg-secondary text-secondary-foreground transform transition-transform md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <h2 className="text-lg font-bold text-primary">لوحة الإدارة</h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-secondary-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-secondary-foreground/70 hover:bg-sidebar-accent hover:text-secondary-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 right-4 left-4 space-y-1">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3 text-secondary-foreground/50">
              <LogOut className="h-4 w-4" />
              العودة للمتجر
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive/70 hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-4 bg-card border-b px-4 py-3 md:px-6 shadow-sm min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-card-foreground truncate">
            {navItems.find((n) => n.path === location.pathname)?.label || "لوحة الإدارة"}
          </h1>
        </header>
        <main className="flex-1 p-4 md:p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
