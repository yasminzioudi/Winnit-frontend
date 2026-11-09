"use client";

import React from "react";
import { Drawer } from "@/components/ui/Drawer";
import { ScoreRing } from "./ScoreRing";
import { StatusBadge } from "./StatusBadge";
import { formatMoney } from "@/lib/format/currency";
import type { WinnerAnalysis } from "@/lib/api/types";
import { TrendingUp, Truck, Target, BarChart3 } from "lucide-react";

export interface ScoreBreakdownDrawerProps {
  product: WinnerAnalysis | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScoreBreakdownDrawer({
  product,
  open,
  onOpenChange,
}: ScoreBreakdownDrawerProps) {
  if (!product) return null;

  const { breakdown } = product;

  const subScores = [
    {
      title: "Marge Nette",
      score: breakdown.netMarginScore,
      weight: "40%",
      description: "Rentabilité réelle après déduction du COGS, livraison et CPA",
      icon: TrendingUp,
      color: breakdown.netMarginScore >= 70 ? "bg-positive-emerald" : breakdown.netMarginScore >= 40 ? "bg-warning-amber" : "bg-negative-red",
      textColor: breakdown.netMarginScore >= 70 ? "text-positive-emerald" : breakdown.netMarginScore >= 40 ? "text-warning-amber" : "text-negative-red",
    },
    {
      title: "Taux de Livraison",
      score: breakdown.deliveryRateScore,
      weight: "25%",
      description: "Fiabilité logistique et proportion des colis effectivement livrés",
      icon: Truck,
      color: breakdown.deliveryRateScore >= 70 ? "bg-positive-emerald" : breakdown.deliveryRateScore >= 40 ? "bg-warning-amber" : "bg-negative-red",
      textColor: breakdown.deliveryRateScore >= 70 ? "text-positive-emerald" : breakdown.deliveryRateScore >= 40 ? "text-warning-amber" : "text-negative-red",
    },
    {
      title: "Performance ROAS",
      score: breakdown.roasScore,
      weight: "20%",
      description: "Efficacité publicitaire comparée au seuil de rentabilité",
      icon: Target,
      color: breakdown.roasScore >= 70 ? "bg-positive-emerald" : breakdown.roasScore >= 40 ? "bg-warning-amber" : "bg-negative-red",
      textColor: breakdown.roasScore >= 70 ? "text-positive-emerald" : breakdown.roasScore >= 40 ? "text-warning-amber" : "text-negative-red",
    },
    {
      title: "Tendance de Volume",
      score: breakdown.volumeTrendScore,
      weight: "15%",
      description: "Dynamique d'expansion des volumes sur la fenêtre glissante",
      icon: BarChart3,
      color: breakdown.volumeTrendScore >= 70 ? "bg-positive-emerald" : breakdown.volumeTrendScore >= 40 ? "bg-warning-amber" : "bg-negative-red",
      textColor: breakdown.volumeTrendScore >= 70 ? "text-positive-emerald" : breakdown.volumeTrendScore >= 40 ? "text-warning-amber" : "text-negative-red",
    },
  ];

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      title="Pourquoi ce score ?"
      description={`Analyse détaillée pour ${product.productName}`}
    >
      <div className="space-y-6">
        {/* Top Product Snapshot */}
        <div className="p-4 rounded-2xl border border-border bg-surface-subtle flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h4 className="text-base font-bold text-foreground truncate">
              {product.productName}
            </h4>
            <div className="flex items-center gap-2">
              <StatusBadge label={product.label} />
            </div>
          </div>
          <ScoreRing score={product.score} size="lg" className="shrink-0" />
        </div>

        {/* Operational Metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl border border-border bg-surface">
            <span className="text-muted block text-[11px]">Chiffre d&apos;affaires</span>
            <strong className="text-foreground text-sm font-bold">
              {formatMoney(product.grossRevenueMillimes / 1000)}
            </strong>
          </div>
          <div className="p-3 rounded-xl border border-border bg-surface">
            <span className="text-muted block text-[11px]">Commandes</span>
            <strong className="text-foreground text-sm font-bold">
              {product.totalOrders} ({product.deliveredOrders} livrées)
            </strong>
          </div>
        </div>

        {/* 4 Sub-Scores Breakdown */}
        <div className="space-y-4">
          <h5 className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
            Décomposition pondérée du score
          </h5>

          <div className="space-y-3.5">
            {subScores.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-border bg-surface space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted shrink-0" />
                      <span className="text-xs font-semibold text-foreground">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[10px] text-muted bg-surface-subtle px-1.5 py-0.5 rounded border border-border">
                        Poids {item.weight}
                      </span>
                      <span className={`text-sm font-bold tabular-nums ${item.textColor}`}>
                        {Math.round(item.score)}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-muted leading-relaxed">
                    {item.description}
                  </p>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-surface-subtle rounded-full overflow-hidden border border-border">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
