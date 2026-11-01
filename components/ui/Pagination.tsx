import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={cn("flex items-center justify-between gap-4 py-3", className)}
    >
      <span className="text-xs text-muted font-mono">
        Page {currentPage} sur {totalPages}
      </span>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Page précédente"
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(
            (p) =>
              p === 1 ||
              p === totalPages ||
              Math.abs(p - currentPage) <= 1
          )
          .map((page, index, array) => {
            const prev = array[index - 1];
            const hasGap = prev && page - prev > 1;

            return (
              <React.Fragment key={page}>
                {hasGap && <span className="px-1 text-muted text-xs">…</span>}
                <Button
                  variant={page === currentPage ? "primary" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "h-8 w-8 p-0 text-xs font-mono",
                    page === currentPage && "pointer-events-none"
                  )}
                >
                  {page}
                </Button>
              </React.Fragment>
            );
          })}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Page suivante"
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
