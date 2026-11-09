"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Clock, AlertTriangle } from "lucide-react";
import type { CODAnalyticsResponse } from "@/lib/api/types";

export interface CodAgingCardProps {
  aging?: CODAnalyticsResponse["aging"];
  isLoading?: boolean;
}

export function CodAgingCard({ aging, isLoading }: CodAgingCardProps) {
  if (isLoading || !aging) {
    return (
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="h-5 bg-surface-subtle dark:bg-neutral-800 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-surface-subtle dark:bg-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const totalAgingOrders =
    aging.days0to7Count +
    aging.days8to14Count +
    aging.days15to30Count +
    aging.daysOver30Count;

  const buckets = [
    {
      label: "0 – 7 jours",
      count: aging.days0to7Count,
      status: "Normal",
      pct: totalAgingOrders > 0 ? (aging.days0to7Count / totalAgingOrders) * 100 : 0,
      badgeColor: "bg-positive-mint text-positive-emerald border-positive-border",
      barColor: "bg-positive-emerald",
    },
    {
      label: "8 – 14 jours",
      count: aging.days8to14Count,
      status: "À suivre",
      pct: totalAgingOrders > 0 ? (aging.days8to14Count / totalAgingOrders) * 100 : 0,
      badgeColor: "bg-warning-cream text-warning-amber border-warning-border",
      barColor: "bg-warning-amber",
    },
    {
      label: "15 – 30 jours",
      count: aging.days15to30Count,
      status: "Retard",
      pct: totalAgingOrders > 0 ? (aging.days15to30Count / totalAgingOrders) * 100 : 0,
      badgeColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-300",
      barColor: "bg-orange-500",
    },
    {
      label: "> 30 jours",
      count: aging.daysOver30Count,
      status: "Critique",
      pct: totalAgingOrders > 0 ? (aging.daysOver30Count / totalAgingOrders) * 100 : 0,
      badgeColor: "bg-negative-tint text-negative-red border-negative-border",
      barColor: "bg-negative-red",
    },
  ];

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-foreground">
            Analyse de l&apos;Âge des Créances COD (Aging)
          </h3>
        </div>
        {aging.daysOver30Count > 0 && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-negative-tint text-negative-red border border-negative-border self-start sm:self-auto">
            <AlertTriangle className="w-3.5 h-3.5" />
            {aging.daysOver30Count} colis en retard critique (&gt; 30j)
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {buckets.map((b, i) => (
          <div
            key={i}
            className="p-3.5 rounded-xl border border-border bg-surface-subtle space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">{b.label}</span>
              <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${b.badgeColor}`}>
                {b.status}
              </span>
            </div>

            <div className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
              {b.count}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted font-mono">
                <span>Part</span>
                <span>{b.pct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${b.barColor} rounded-full transition-all duration-300`}
                  style={{ width: `${b.pct}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
