"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/profit-os/CountUp";
import { formatMoney } from "@/lib/format/currency";
import { Wallet, CheckCircle2, Clock } from "lucide-react";
import type { CODAnalyticsResponse } from "@/lib/api/types";

export interface CodKpiCardsProps {
  data?: CODAnalyticsResponse;
  isLoading?: boolean;
}

export function CodKpiCards({ data, isLoading }: CodKpiCardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-5 space-y-3 animate-pulse">
            <div className="h-4 bg-surface-subtle dark:bg-neutral-800 rounded w-1/3" />
            <div className="h-7 bg-surface-subtle dark:bg-neutral-800 rounded w-2/3" />
            <div className="h-2 bg-surface-subtle dark:bg-neutral-800 rounded-full w-full" />
          </Card>
        ))}
      </div>
    );
  }

  const { summary } = data;
  const expectedTnd = summary.expectedCashCollectionsMillimes / 1000;
  const settledTnd = summary.bankWireSettledMillimes / 1000;
  const pendingTnd = summary.pendingCourierPayoutsMillimes / 1000;

  const settledRatio =
    expectedTnd > 0 ? Math.min(100, Math.round((settledTnd / expectedTnd) * 100)) : 0;

  const kpis = [
    {
      title: "Encaissements Attendus (COD)",
      value: expectedTnd,
      formatter: (v: number) => formatMoney(v),
      icon: Wallet,
      tone: "text-foreground",
      iconBg: "bg-surface-subtle border-border",
      badge: `${summary.deliveredOrdersCount} colis livrés`,
      progressBar: false,
    },
    {
      title: "Virements Bancaires Reçus",
      value: settledTnd,
      formatter: (v: number) => formatMoney(v),
      icon: CheckCircle2,
      tone: "text-positive-emerald",
      iconBg: "bg-positive-mint border-positive-border text-positive-emerald",
      badge: `${settledRatio}% encaissés`,
      progressBar: true,
      progressPct: settledRatio,
    },
    {
      title: "En Attente de Virement",
      value: pendingTnd,
      formatter: (v: number) => formatMoney(v),
      icon: Clock,
      tone: pendingTnd > 0 ? "text-warning-amber" : "text-muted",
      iconBg: "bg-warning-cream border-warning-border text-warning-amber",
      badge: "Chez les transporteurs",
      progressBar: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={idx}
            className="p-5 flex flex-col justify-between hover:border-border-subtle transition-colors shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-medium text-muted">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl border ${kpi.iconBg}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
              </div>

              <div className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${kpi.tone}`}>
                <CountUp value={kpi.value} formatter={kpi.formatter} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-xs text-muted">
                <span className="font-mono text-[11px]">{kpi.badge}</span>
                {kpi.progressBar && (
                  <span className="font-mono font-semibold text-positive-emerald text-[11px]">
                    {kpi.progressPct}%
                  </span>
                )}
              </div>

              {kpi.progressBar && (
                <div className="w-full h-2 bg-surface-subtle dark:bg-neutral-800 rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-brand-lime transition-all duration-500 rounded-full"
                    style={{ width: `${kpi.progressPct}%` }}
                  />
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

