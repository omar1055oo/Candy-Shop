import { MessageCircle } from "lucide-react";

const StoreFooter = () => {
  return (
    <footer className="bg-card border-t border-border/50 py-6 mt-8">
      <div className="container flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <span>صنع بواسطة</span>
        <a
          href="https://wa.me/201028551063"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors"
          style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.5px" }}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Omar Sayed
        </a>
      </div>
    </footer>
  );
};

export default StoreFooter;
