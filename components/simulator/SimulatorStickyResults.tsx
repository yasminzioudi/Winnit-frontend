"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/profit-os/CountUp";
import { Target, TrendingUp, DollarSign } from "lucide-react";
import { formatMoney } from "@/lib/format/currency";

export interface SimulatorStickyResultsProps {
  maxCpaMillimes: number;
  breakEvenRoas: number;
  netProfitMillimes: number;
  currentAdCpaMillimes: number;
  className?: string;
}

export function SimulatorStickyResults({
  maxCpaMillimes,
  breakEvenRoas,
  netProfitMillimes,
  currentAdCpaMillimes,
  className = "",
}: SimulatorStickyResultsProps) {
  const maxCpaTnd = maxCpaMillimes / 1000;
  const netProfitTnd = netProfitMillimes / 1000;
  const isCpaOk = currentAdCpaMillimes <= maxCpaMillimes;
  const isNetProfitOk = netProfitMillimes > 0;
  const isRoasOk = breakEvenRoas <= 2.2;

  const tiles = [
    {
      title: "CPA Max Tolérable",
      value: maxCpaTnd,
      formatter: (v: number) => formatMoney(v),
      description: isCpaOk ? "CPA actuel viable" : "CPA supérieur au seuil",
      icon: Target,
      tone: isCpaOk
        ? "text-positive-emerald dark:text-positive-emerald"
        : "text-negative-red dark:text-negative-red",
      badgeColor: isCpaOk
        ? "bg-positive-mint text-positive-emerald border-positive-border"
        : "bg-negative-tint text-negative-red border-negative-border",
    },
    {
      title: "ROAS Break-Even",
      value: breakEvenRoas,
      formatter: (v: number) => `${v.toFixed(2)}×`,
      description: "Seuil de rentabilité pub",
      icon: TrendingUp,
      tone: isRoasOk
        ? "text-positive-emerald dark:text-positive-emerald"
        : "text-warning-amber dark:text-warning-amber",
      badgeColor: isRoasOk
        ? "bg-positive-mint text-positive-emerald border-positive-border"
        : "bg-warning-cream text-warning-amber border-warning-border",
    },
    {
      title: "Profit Net Unitaire",
      value: netProfitTnd,
      formatter: (v: number) => formatMoney(v),
      description: isNetProfitOk ? "Bénéfice par vente confirmée" : "Vente à perte",
      icon: DollarSign,
      tone: isNetProfitOk
        ? "text-positive-emerald dark:text-positive-emerald"
        : "text-negative-red dark:text-negative-red",
      badgeColor: isNetProfitOk
        ? "bg-positive-mint text-positive-emerald border-positive-border"
        : "bg-negative-tint text-negative-red border-negative-border",
    },
  ];

  return (
    <div className={`space-y-3 sticky top-4 z-20 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
          Résultats en direct
        </h3>
        <span className="text-[10px] font-mono text-muted bg-surface-subtle px-2 py-0.5 rounded border border-border">
          Temps réel
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
        {tiles.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <Card
              key={i}
              className="p-4 flex flex-col justify-between hover:border-border-subtle transition-shadow shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-medium text-muted">
                  {tile.title}
                </span>
                <Icon className="h-4 w-4 text-muted shrink-0" />
              </div>

              <div>
                <div className={`text-2xl font-bold tracking-tight tabular-nums ${tile.tone}`}>
                  <CountUp value={tile.value} formatter={tile.formatter} />
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border ${tile.badgeColor}`}
                  >
                    {tile.description}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
