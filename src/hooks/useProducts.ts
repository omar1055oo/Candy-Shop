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

export type AdminProductsCountsResult = {
  totalCount: number;
  activeCount: number;
  archivedCount: number;
  lowStockCount: number;
};

export type AdminLowStockPageResult = {
  products: Product[];
  totalCount: number;
  totalPages: number;
  pageSize: number;
  currentPage: number;
};

export type AdminBestSellersPageResult = {
  products: Product[];
  totalCount: number;
  totalPages: number;
  pageSize: number;
  currentPage: number;
  bestSellersCount: number;
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

export const useAdminProductsCounts = () => {
  return useQuery({
    queryKey: ["admin-products-counts"],
    queryFn: async (): Promise<AdminProductsCountsResult> => {
      const [totalRes, activeRes, archivedRes, lowStockRes] = await Promise.all([
        supabase.from("products").select("products_id", { count: "exact", head: true }),
        supabase.from("products").select("products_id", { count: "exact", head: true }).eq("status", "Active"),
        supabase.from("products").select("products_id", { count: "exact", head: true }).eq("status", "Draft"),
        supabase.from("products").select("products_id", { count: "exact", head: true }).gt("product_quantity", 0).lt("product_quantity", 5),
      ]);

      if (totalRes.error) throw totalRes.error;
      if (activeRes.error) throw activeRes.error;
      if (archivedRes.error) throw archivedRes.error;
      if (lowStockRes.error) throw lowStockRes.error;

      return {
        totalCount: totalRes.count ?? 0,
        activeCount: activeRes.count ?? 0,
        archivedCount: archivedRes.count ?? 0,
        lowStockCount: lowStockRes.count ?? 0,
      };
    },
  });
};

export const useAdminLowStockPage = (currentPage: number, searchQuery?: string, pageSize = PAGE_SIZE) => {
  return useQuery({
    queryKey: ["admin-low-stock-page", currentPage, searchQuery, pageSize],
    queryFn: async (): Promise<AdminLowStockPageResult> => {
      const normalizedPage = Number.isFinite(currentPage) && currentPage > 0 ? Math.floor(currentPage) : 1;
      const from = (normalizedPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .gt("product_quantity", 0)
        .lt("product_quantity", 5)
        .order("product_quantity", { ascending: true })
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

export const useAdminBestSellersPage = (currentPage: number, searchQuery?: string, pageSize = PAGE_SIZE) => {
  return useQuery({
    queryKey: ["admin-best-sellers-page", currentPage, searchQuery, pageSize],
    queryFn: async (): Promise<AdminBestSellersPageResult> => {
      const normalizedPage = Number.isFinite(currentPage) && currentPage > 0 ? Math.floor(currentPage) : 1;
      const from = (normalizedPage - 1) * pageSize;
      const to = from + pageSize - 1;

      let productsQuery = supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("status", "Active")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (searchQuery && searchQuery.trim()) {
        productsQuery = productsQuery.ilike("product_name", `%${searchQuery.trim()}%`);
      }

      const [productsRes, bestCountRes] = await Promise.all([
        productsQuery,
        supabase
          .from("products")
          .select("products_id", { count: "exact", head: true })
          .eq("status", "Active")
          .eq("is_best_seller", true),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (bestCountRes.error) throw bestCountRes.error;

      const totalCount = productsRes.count ?? 0;
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

      return {
        products: (productsRes.data || []) as Product[],
        totalCount,
        totalPages,
        pageSize,
        currentPage: normalizedPage,
        bestSellersCount: bestCountRes.count ?? 0,
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
