"use client";

import React from "react";
import { DollarSign, TrendingUp, Percent, CheckCircle2, XCircle, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "./CountUp";
import { formatMoney } from "@/lib/format/currency";
import type { AnalyticsSummaryResponse } from "@/lib/api/types";

interface KpiTilesProps {
  data?: AnalyticsSummaryResponse;
  isLoading?: boolean;
}

export function KpiTiles({ data, isLoading }: KpiTilesProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="p-3.5 flex flex-col justify-between animate-pulse min-h-[110px]">
            <div className="h-4 bg-surface-subtle dark:bg-neutral-800 rounded-md w-3/4 mb-3" />
            <div className="h-7 bg-surface-subtle dark:bg-neutral-800 rounded-md w-4/5" />
          </Card>
        ))}
      </div>
    );
  }

  const { waterfall, kpis, expenses } = data;

  const grossRevTnd = waterfall.grossRevenueMillimes / 1000;
  const netContributionTnd = waterfall.netRealizedContributionMillimes / 1000;
  const netMarginPct = expenses.netProfitMarginPercent;
  const deliveryRatePct = kpis.deliveryRatePercent;
  const refusalRatePct = kpis.refusalRatePercent;
  const aovTnd = kpis.averageOrderValueMillimes / 1000;

  const tiles = [
    {
      title: "Chiffre d'affaires",
      value: grossRevTnd,
      formatter: (v: number) => formatMoney(v),
      icon: DollarSign,
      tone: "text-foreground",
      badge: `${kpis.totalOrdersCount} cdes`,
    },
    {
      title: "Bénéfice Net Réalisé",
      value: netContributionTnd,
      formatter: (v: number) => formatMoney(v),
      icon: TrendingUp,
      tone: netContributionTnd >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
      badge: `${expenses.netProfitMarginPercent.toFixed(1)}% net`,
    },
    {
      title: "Marge Nette",
      value: netMarginPct,
      formatter: (v: number) => `${v.toFixed(1)}%`,
      icon: Percent,
      tone: netMarginPct >= 20 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
      badge: "Après charges",
    },
    {
      title: "Taux de Livraison",
      value: deliveryRatePct,
      formatter: (v: number) => `${v.toFixed(1)}%`,
      icon: CheckCircle2,
      tone: deliveryRatePct >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400",
      badge: `${kpis.deliveredCount} livrées`,
    },
    {
      title: "Taux de Refus",
      value: refusalRatePct,
      formatter: (v: number) => `${v.toFixed(1)}%`,
      icon: XCircle,
      tone: refusalRatePct <= 22 ? "text-foreground" : "text-rose-600 dark:text-rose-400",
      badge: `${kpis.refusedCount} refusées`,
    },
    {
      title: "Panier Moyen",
      value: aovTnd,
      formatter: (v: number) => formatMoney(v),
      icon: ShoppingBag,
      tone: "text-foreground",
      badge: "AOV",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {tiles.map((tile, i) => {
        const Icon = tile.icon;
        return (
          <Card
            key={i}
            className="p-3.5 flex flex-col justify-between hover:border-border-subtle transition-colors min-h-[110px]"
          >
            <div className="flex items-start justify-between gap-1 mb-2">
              <span className="text-xs font-medium text-muted leading-tight whitespace-normal break-words">
                {tile.title}
              </span>
              <Icon className="h-3.5 w-3.5 text-muted shrink-0 mt-0.5" />
            </div>
            <div>
              <div className={`text-[clamp(1.05rem,1.75vw,1.35rem)] font-bold tracking-tight tabular-nums leading-tight ${tile.tone}`}>
                <CountUp value={tile.value} formatter={tile.formatter} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 whitespace-normal break-words">
                {tile.badge}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
