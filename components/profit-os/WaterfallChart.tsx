"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/format/currency";
import type { AnalyticsSummaryResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface WaterfallChartProps {
  data?: AnalyticsSummaryResponse;
  isLoading?: boolean;
}

interface Step {
  label: string;
  amountMillimes: number;
  type: "positive" | "negative" | "total";
  description: string;
}

export function WaterfallChart({ data, isLoading }: WaterfallChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (isLoading || !data) {
    return (
      <Card className="p-6">
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 mb-6 animate-pulse" />
        <div className="h-64 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
      </Card>
    );
  }

  const { waterfall } = data;
  const grossRev = waterfall.grossRevenueMillimes;

  const steps: Step[] = [
    {
      label: "Ventes Brutes",
      amountMillimes: waterfall.grossRevenueMillimes,
      type: "positive",
      description: "Montant total facturé sur les commandes du cycle",
    },
    {
      label: "Coût Marchandises (COGS)",
      amountMillimes: -waterfall.productCOGSMillimes,
      type: "negative",
      description: "Prix d'achat des produits livrés",
    },
    {
      label: "Expédition Aller",
      amountMillimes: -waterfall.outboundShippingMillimes,
      type: "negative",
      description: "Frais de livraison facturés par les transporteurs",
    },
    {
      label: "Dépenses Publicité",
      amountMillimes: -waterfall.paidAdSpendMillimes,
      type: "negative",
      description: "Budget publicitaire réel payé (Meta, TikTok, Google)",
    },
    {
      label: "Pénalité Retours COD",
      amountMillimes: -waterfall.codRefusalPenaltyMillimes,
      type: "negative",
      description: "Frais de retour et pertes sur commandes refusées",
    },
    {
      label: "Bénéfice Net Réalisé",
      amountMillimes: waterfall.netRealizedContributionMillimes,
      type: "total",
      description: "Contribution nette réelle générée par les ventes",
    },
  ];

  // Max value for scaling visual bars
  const maxVal = Math.max(
    grossRev,
    ...steps.map((s) => Math.abs(s.amountMillimes))
  );

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Cascade de Rentabilité (P&L Waterfall)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            De la vente brute au résultat net réalisé, identité comptable garantie
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Revenus
          </span>
          <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Coûts
          </span>
          <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Net
          </span>
        </div>
      </div>

      {/* Visual Bars Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
        {steps.map((step, idx) => {
          const absAmount = Math.abs(step.amountMillimes);
          const heightPercent = maxVal > 0 ? Math.min(100, Math.max(12, (absAmount / maxVal) * 100)) : 10;
          const pctOfGross = grossRev > 0 ? (absAmount / grossRev) * 100 : 0;
          const isHovered = hoveredIdx === idx;

          let barColor = "bg-rose-500/80 hover:bg-rose-500";
          if (step.type === "positive") barColor = "bg-emerald-500/80 hover:bg-emerald-500";
          if (step.type === "total") {
            barColor = step.amountMillimes >= 0 ? "bg-primary/90 hover:bg-primary" : "bg-rose-600 hover:bg-rose-500";
          }

          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="flex flex-col items-center group relative cursor-pointer"
            >
              {/* Amount Label */}
              <div className="text-xs font-semibold tabular-nums text-foreground mb-2 text-center">
                {formatMoney(step.amountMillimes / 1000, { showSign: step.type === "negative" })}
              </div>

              {/* Bar track */}
              <div className="w-full h-44 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl p-1.5 flex flex-col justify-end">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={cn(
                    "w-full rounded-lg transition-all duration-300 shadow-xs",
                    barColor,
                    isHovered && "ring-2 ring-primary/40 ring-offset-1"
                  )}
                />
              </div>

              {/* Step Title */}
              <div className="mt-2.5 text-center">
                <div className="text-xs font-medium text-foreground line-clamp-1">
                  {step.label}
                </div>
                <div className="text-[11px] text-neutral-400 dark:text-neutral-500 tabular-nums">
                  {step.type === "positive" ? "100%" : `${pctOfGross.toFixed(1)}%`}
                </div>
              </div>

              {/* Floating Tooltip */}
              {isHovered && (
                <div className="absolute -top-12 z-30 px-3 py-1.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs rounded-lg shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-100">
                  <div className="font-semibold">
                    {step.label}: {formatMoney(step.amountMillimes / 1000)}
                  </div>
                  <div className="text-[10px] opacity-80">{step.description}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

