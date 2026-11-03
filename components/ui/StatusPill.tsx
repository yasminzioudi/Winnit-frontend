import React from "react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/finance/types";

export interface StatusPillProps {
  status: OrderStatus | "active" | "suspended" | "pending";
  label?: string;
  className?: string;
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  const styles = {
    delivered:
      "bg-positive-mint text-positive-emerald border-positive-border",
    active:
      "bg-positive-mint text-positive-emerald border-positive-border",
    shipped:
      "bg-info-tint text-info-blue border-info-border",
    confirmed:
      "bg-warning-cream text-warning-amber border-warning-border",
    pending:
      "bg-warning-cream text-warning-amber border-warning-border",
    refused:
      "bg-negative-tint text-negative-red border-negative-border",
    suspended:
      "bg-negative-tint text-negative-red border-negative-border",
    cancelled:
      "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700",
  };

  const defaultLabels: Record<string, string> = {
    delivered: "delivered",
    shipped: "shipped",
    confirmed: "confirmed",
    refused: "refused",
    active: "actif",
    suspended: "suspendu",
    pending: "en attente",
    cancelled: "annulé",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border capitalize select-none transition-colors",
        styles[status] || styles.confirmed,
        className
      )}
    >
      {label || defaultLabels[status] || status}
    </span>
  );
}
