import { supabase } from "@/integrations/supabase/client";
import type { CartItem, Product } from "@/types";

export type CartStockResult = { ok: true } | { ok: false; productName: string; available: number };

/** وحدات قابلة للبيع (قطع كاملة، لا تقل عن صفر) */
export function effectiveStockUnits(product: Product): number {
  const n = Number(product.product_quantity);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n);
}

export function getStockShortageToast(violation: { productName: string; available: number }) {
  return {
    title: "الكمية أكبر من المخزون",
    description: `المنتج «${violation.productName}» متوفر في المخزون ${violation.available} قطعة فقط، وقد طلبت أو أضفت كمية أكبر. يرجى الرجوع واختيار عدد أقل.`,
    variant: "destructive" as const,
  };
}

/** يطابق السلة مع أحدث المخزون في قاعدة البيانات؛ يعيد أول مخالفة أو null */
export async function fetchFirstCartStockViolation(
  items: CartItem[],
): Promise<{ productName: string; available: number } | null> {
  if (items.length === 0) return null;

  const ids = [...new Set(items.map((i) => i.product.products_id))];
  const { data, error } = await supabase
    .from("products")
    .select("products_id, product_name, product_quantity")
    .in("products_id", ids);

  if (error) throw error;

  const map = new Map(
    (data || []).map((row) => [
      row.products_id,
      {
        name: row.product_name as string,
        qty: Number(row.product_quantity),
      },
    ]),
  );

  for (const item of items) {
    const row = map.get(item.product.products_id);
    const available = row ? Math.max(0, Math.floor(row.qty)) : 0;
    const productName = row?.name ?? item.product.product_name;
    if (item.quantity > available) {
      return { productName, available };
    }
  }

  return null;
}
