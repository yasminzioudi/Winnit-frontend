"use client";

import React, { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type PeriodKey = "7d" | "30d" | "90d" | "month";

interface PeriodOption {
  key: PeriodKey;
  label: string;
}

const PERIOD_OPTIONS: PeriodOption[] = [
  { key: "7d", label: "7 jours" },
  { key: "30d", label: "30 jours" },
  { key: "90d", label: "90 jours" },
  { key: "month", label: "Ce mois" },
];

export function getDatesForPeriod(period: PeriodKey): { from: string; to: string } {
  // Get current time in Africa/Tunis timezone (UTC+1)
  // Using Date() directly here is safe - this function is only called in event handlers or useState initializers
  const now = new Date();
  const to = now.toISOString();

  let fromDate: Date;
  switch (period) {
    case "7d":
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      // First day of current month to now
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }

  return { from: fromDate.toISOString(), to };
}

export function PeriodPicker({ className = "" }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentPeriod = (searchParams.get("period") as PeriodKey) || "90d";

  const handleSelect = (key: PeriodKey) => {
    const { from, to } = getDatesForPeriod(key);
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", key);
    params.set("from", from);
    params.set("to", to);

    startTransition(() => {
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 p-1 bg-surface dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs",
        className
      )}
    >
      <div className="flex items-center px-2 text-neutral-400">
        <Calendar className="h-4 w-4" />
      </div>
      {PERIOD_OPTIONS.map((opt) => {
        const isActive = currentPeriod === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            disabled={isPending}
            onClick={() => handleSelect(opt.key)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer select-none",
              isActive
                ? "bg-primary text-white shadow-xs font-semibold"
                : "text-neutral-600 dark:text-neutral-400 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

