"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? (
          "0 resultados"
        ) : (
          <>
            Mostrando{" "}
            <span className="font-semibold text-foreground">
              {from}–{to}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-foreground">{total}</span>{" "}
            resultado{total === 1 ? "" : "s"}
          </>
        )}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <span className="px-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{page}</span> / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
