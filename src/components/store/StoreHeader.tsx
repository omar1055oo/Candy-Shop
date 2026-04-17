import { Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface StoreHeaderProps {
  onSearch?: (query: string) => void;
}

const StoreHeader = ({ onSearch }: StoreHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const totalItems = useCartStore((s) => s.totalItems());

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="container flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <Link to="/account">
            <Button variant="ghost" size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-muted/50 pr-10 text-foreground border-border/40 placeholder:text-muted-foreground rounded-full"
            />
          </div>
        </div>

        <Link to="/" className="flex-shrink-0">
          <img src="/assets/logo.jpg" alt="Candy Shop" className="h-10 w-auto rounded-lg" />
        </Link>
      </div>
    </header>
  );
};

export default StoreHeader;
