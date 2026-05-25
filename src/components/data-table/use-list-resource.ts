"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PaginationInfo } from "@/lib/api";

interface UseListResourceParams {
  /** URL base del endpoint (sin querystring), p.ej. "/api/profesores". */
  url: string;
  initialPageSize?: number;
}

export interface ListResource<T> {
  rows: T[];
  loading: boolean;
  search: string;
  setSearch: (v: string) => void;
  page: number;
  setPage: (p: number) => void;
  pagination: PaginationInfo;
  refresh: () => Promise<void>;
}

/**
 * Hook genérico para listados con búsqueda y paginación contra una API REST.
 * - Hace debounce de la búsqueda (350 ms).
 * - Resetea a la página 1 cuando cambia la búsqueda.
 */
export function useListResource<T>({
  url,
  initialPageSize = 20,
}: UseListResourceParams): ListResource<T> {
  const [rows, setRows] = useState<T[]>([]);
  const [search, setSearchRaw] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
    totalPages: 1,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchDebounced, setSearchDebounced] = useState("");

  // Aplica debounce al search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchDebounced(search);
      setPage(1);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page: String(page),
        pageSize: String(initialPageSize),
      });
      if (searchDebounced) qs.set("search", searchDebounced);

      const res = await fetch(`${url}?${qs.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        console.error(json);
        setRows([]);
      } else {
        setRows(json.data ?? []);
        if (json.pagination) setPagination(json.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [url, page, initialPageSize, searchDebounced]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    rows,
    loading,
    search,
    setSearch: setSearchRaw,
    page,
    setPage,
    pagination,
    refresh: fetchData,
  };
}
