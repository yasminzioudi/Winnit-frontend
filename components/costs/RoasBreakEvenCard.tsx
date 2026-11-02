"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { ProductAnalyticsItem } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/format/currency";
import { getDatesForPeriod } from "@/components/profit-os/PeriodPicker";
import { TrendingUp, Target } from "lucide-react";

export function RoasBreakEvenCard() {
  const { from, to } = getDatesForPeriod("30d");

  const productAnalyticsQuery = useQuery({
    queryKey: queryKeys.analytics.all,
    queryFn: () =>
      apiGet<ProductAnalyticsItem[]>(
        `/analytics/by-product?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      ),
  });

  const products = productAnalyticsQuery.data || [];

  if (productAnalyticsQuery.isLoading) {
    return (
      <Card className="p-5 animate-pulse">
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Performance ROAS vs Seuil de Rentabilité
          </h3>
          <p className="text-xs text-neutral-500">
            Comparaison ROAS réel vs break-even théorique (30 derniers jours)
          </p>
        </div>
        <Badge variant="default" className="text-xs">
          {products.length} Produits
        </Badge>
      </div>

      <div className="space-y-3">
        {products.map((item) => {
          const beRoas = 1.5; // Standard break-even target
          const actualRoas = item.roas || 0;
          const isAbove = actualRoas >= beRoas;
          const pct = Math.min(100, Math.max(5, (actualRoas / (beRoas * 2)) * 100));

          return (
            <div
              key={item.productId}
              className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground block truncate max-w-[280px]">
                    {item.productName}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Ventes: {formatMoney(item.grossRevenueMillimes / 1000)} • Pub: {formatMoney(item.adSpendMillimes / 1000)}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold tabular-nums ${
                      isAbove
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    ROAS {actualRoas.toFixed(2)}x
                  </span>
                  <span className="text-[10px] text-neutral-400 block">
                    Seuil {beRoas.toFixed(2)}x
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="relative w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  style={{ width: `${pct}%` }}
                  className={`h-full rounded-full transition-all duration-300 ${
                    isAbove ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

