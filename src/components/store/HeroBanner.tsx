import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBanners } from "@/hooks/useBanners";
import { Skeleton } from "@/components/ui/skeleton";

const HeroBanner = () => {
  const [current, setCurrent] = useState(0);
  const { data: banners = [], isLoading } = useBanners();

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const navigate = (dir: number) => {
    setCurrent((prev) => (prev + dir + banners.length) % banners.length);
  };

  if (isLoading) {
    return <Skeleton className="w-full aspect-[3/1] max-h-[400px] rounded-2xl my-4" />;
  }

  if (!banners.length) return null;

  return (
    <section className="relative w-full overflow-hidden rounded-2xl mx-auto my-4 aspect-[3/1] max-h-[400px] shadow-lg shadow-primary/5">
      <AnimatePresence mode="wait">
        <motion.div
          key={banners[current].id}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {banners[current].target_url ? (
            <a
              href={banners[current].target_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full w-full"
            >
              <img
                src={banners[current].image_url}
                alt="عرض"
                className="h-full w-full object-cover"
              />
            </a>
          ) : (
            <img
              src={banners[current].image_url}
              alt="عرض"
              className="h-full w-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => navigate(-1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/70 backdrop-blur-sm p-2 shadow-md hover:bg-card transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/70 backdrop-blur-sm p-2 shadow-md hover:bg-card transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-primary" : "w-2 bg-card/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroBanner;
