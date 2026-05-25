"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Search, X, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  /** Cabecera de la columna. */
  header: string;
  /** Render del valor de una fila. */
  cell: (row: T) => React.ReactNode;
  /** Ancho opcional (clase Tailwind). */
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  keyFor: (row: T) => string;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  loading?: boolean;
  emptyMessage?: string;
  /** Acciones por fila (botones, dropdown…). */
  actions?: (row: T) => React.ReactNode;
}

// Fila skeleton para el estado de carga
function SkeletonRow({ colCount }: { colCount: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div
            className="h-4 animate-pulse rounded bg-muted"
            style={{ width: `${55 + ((i * 23) % 35)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export function DataTable<T>({
  columns,
  rows,
  keyFor,
  search,
  onSearchChange,
  searchPlaceholder = "Buscar…",
  loading,
  emptyMessage = "No hay resultados.",
  actions,
}: DataTableProps<T>) {
  const totalCols = columns.length + (actions ? 1 : 0);

  return (
    <div className="space-y-4">
      {onSearchChange && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-lg pl-9 pr-9"
          />
          {search && search.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => onSearchChange("")}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-border bg-muted/50">
              <tr>
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                      col.className,
                    )}
                  >
                    {col.header}
                  </th>
                ))}
                {actions && <th className="w-12 px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} colCount={totalCols} />
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={totalCols} className="px-4 py-16">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <PackageOpen className="h-10 w-10 opacity-40" />
                      <p className="text-sm">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence initial={false}>
                  {rows.map((row, i) => (
                    <motion.tr
                      key={keyFor(row)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025, duration: 0.2 }}
                      className="transition-colors hover:bg-primary/[0.04]"
                    >
                      {columns.map((col, j) => (
                        <td key={j} className={cn("px-4 py-3.5", col.className)}>
                          {col.cell(row)}
                        </td>
                      ))}
                      {actions && (
                        <td className="px-4 py-3.5 text-right">{actions(row)}</td>
                      )}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
