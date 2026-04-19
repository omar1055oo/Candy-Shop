import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/types";

const PAGE_SIZE = 50;

export const useProducts = (searchQuery?: string, categoryId?: string | null) => {
  return useQuery({
    queryKey: ["products", searchQuery, categoryId],
    queryFn: async (): Promise<Product[]> => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("status", "Active")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("product_name", `%${searchQuery}%`);
      }

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Product[];
    },
  });
};

export type AdminProductsStatus = "Active" | "Draft";

export type UseAdminProductsPageParams = {
  status: AdminProductsStatus;
  searchQuery?: string;
  currentPage: number;
  pageSize?: number;
};

export type AdminProductsPageResult = {
  products: Product[];
  totalCount: number;
  totalPages: number;
  pageSize: number;
  currentPage: number;
};

export const useAdminProductsPage = ({
  status,
  searchQuery,
  currentPage,
  pageSize = PAGE_SIZE,
}: UseAdminProductsPageParams) => {
  return useQuery({
    queryKey: ["admin-products-page", status, searchQuery, currentPage, pageSize],
    queryFn: async (): Promise<AdminProductsPageResult> => {
      const normalizedPage = Number.isFinite(currentPage) && currentPage > 0 ? Math.floor(currentPage) : 1;
      const from = (normalizedPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("status", status)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchQuery && searchQuery.trim()) {
        query = query.ilike("product_name", `%${searchQuery.trim()}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const totalCount = count ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

      return {
        products: (data || []) as Product[],
        totalCount,
        totalPages,
        pageSize,
        currentPage: normalizedPage,
      };
    },
  });
};

export const useBestSellers = () => {
  return useQuery({
    queryKey: ["best-sellers"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "Active")
        .eq("is_best_seller", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Product[];
    },
  });
};

export const useAllProducts = () => {
  return useQuery({
    queryKey: ["all-products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Product[];
    },
  });
};
