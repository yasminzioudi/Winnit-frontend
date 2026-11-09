"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/format/currency";
import type { PricingCurvePoint } from "@/lib/api/types";
import { Sparkles } from "lucide-react";

export interface ProfitPriceCurveProps {
  curve: PricingCurvePoint[];
  currentPriceMillimes: number;
  elasticOptimumMillimes: number;
  breakEvenPriceMillimes: number;
  recommendedBand: { minMillimes: number; maxMillimes: number };
  isLoading?: boolean;
}

export function ProfitPriceCurve({
  curve,
  currentPriceMillimes,
  elasticOptimumMillimes,
  breakEvenPriceMillimes,
  recommendedBand,
  isLoading = false,
}: ProfitPriceCurveProps) {
  if (isLoading) {
    return (
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-surface-subtle dark:bg-neutral-800 rounded w-1/3 animate-pulse" />
          <div className="h-6 bg-surface-subtle dark:bg-neutral-800 rounded-full w-48 animate-pulse" />
        </div>
        <div className="h-72 bg-surface-subtle dark:bg-neutral-800 rounded-xl animate-pulse" />
      </Card>
    );
  }

  if (!curve || curve.length === 0) {
    return (
      <Card className="p-8 text-center space-y-2">
        <p className="text-sm font-medium text-foreground">
          Aucune courbe de rentabilité disponible
        </p>
        <p className="text-xs text-muted">
          Ajustez vos paramètres de prix et de coûts pour générer l&apos;optimisation.
        </p>
      </Card>
    );
  }

  const chartData = curve.map((pt) => ({
    priceTnd: pt.priceMillimes / 1000,
    profitTnd: pt.profitMillimes / 1000,
    refusalPct: Number((pt.refusalRate * 100).toFixed(1)),
  }));

  const optimumTnd = elasticOptimumMillimes / 1000;
  const breakEvenTnd = breakEvenPriceMillimes / 1000;
  const currentPriceTnd = currentPriceMillimes / 1000;
  const bandMinTnd = recommendedBand.minMillimes / 1000;
  const bandMaxTnd = recommendedBand.maxMillimes / 1000;

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              Courbe Profit vs Prix
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-brand-lime/20 text-brand-lime-text border border-brand-lime/40">
              <Sparkles className="w-3 h-3 text-brand-lime-text" />
              modèle basé sur vos hypothèses
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Optimisation élastique du profit total selon le volume projeté
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-brand-lime rounded" />
            <span className="text-muted text-[11px]">Profit projeté</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-positive-emerald" />
            <span className="text-muted text-[11px]">Optimum ({optimumTnd.toFixed(1)} TND)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-negative-red" />
            <span className="text-muted text-[11px]">Seuil ({breakEvenTnd.toFixed(1)} TND)</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 15, right: 15, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="profitCurveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-brand-lime)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-brand-lime)" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              opacity={0.5}
            />

            <XAxis
              dataKey="priceTnd"
              tickFormatter={(v) => `${v} TND`}
              tick={{ fontSize: 11, fill: "var(--color-muted)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border)" }}
            />

            <YAxis
              tickFormatter={(v) => `${v} TND`}
              tick={{ fontSize: 11, fill: "var(--color-muted)" }}
              tickLine={false}
              axisLine={false}
              width={65}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-surface border border-border rounded-xl p-3 shadow-lg text-xs space-y-1">
                    <p className="font-semibold text-foreground">
                      Prix : {d.priceTnd.toFixed(2)} TND
                    </p>
                    <p className="font-mono text-positive-emerald">
                      Profit net : {formatMoney(d.profitTnd)}
                    </p>
                    <p className="font-mono text-muted text-[11px]">
                      Refus projeté : {d.refusalPct}%
                    </p>
                  </div>
                );
              }}
            />

            {/* Recommended Band Area */}
            {bandMinTnd < bandMaxTnd && (
              <ReferenceArea
                x1={bandMinTnd}
                x2={bandMaxTnd}
                fill="var(--color-positive-mint)"
                fillOpacity={0.25}
                stroke="var(--color-positive-border)"
                strokeDasharray="2 2"
              />
            )}

            {/* Break-Even Reference Line */}
            {breakEvenTnd > 0 && (
              <ReferenceLine
                x={breakEvenTnd}
                stroke="var(--color-negative-red)"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: "Break-Even",
                  position: "insideTopLeft",
                  fill: "var(--color-negative-red)",
                  fontSize: 10,
                }}
              />
            )}

            {/* Elastic Optimum Reference Line */}
            {optimumTnd > 0 && (
              <ReferenceLine
                x={optimumTnd}
                stroke="var(--color-positive-emerald)"
                strokeWidth={2}
                label={{
                  value: "Optimum",
                  position: "insideTopRight",
                  fill: "var(--color-positive-emerald)",
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              />
            )}

            {/* Current Price Reference Line */}
            {currentPriceTnd > 0 && (
              <ReferenceLine
                x={currentPriceTnd}
                stroke="var(--color-ink)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: "Actuel",
                  position: "top",
                  fill: "var(--color-foreground)",
                  fontSize: 10,
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="profitTnd"
              stroke="var(--color-brand-lime)"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#profitCurveGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recommended Pricing Summary Band */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
          <div className="text-[11px] text-muted">Optimum Élastique</div>
          <div className="text-sm font-bold font-mono text-positive-emerald mt-0.5">
            {optimumTnd.toFixed(2)} TND
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
          <div className="text-[11px] text-muted">Bande Recommandée</div>
          <div className="text-sm font-bold font-mono text-foreground mt-0.5">
            {bandMinTnd.toFixed(2)} – {bandMaxTnd.toFixed(2)} TND
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border">
          <div className="text-[11px] text-muted">Prix Minimum (Break-Even)</div>
          <div className="text-sm font-bold font-mono text-negative-red mt-0.5">
            {breakEvenTnd.toFixed(2)} TND
          </div>
        </div>
      </div>
    </Card>
  );
}
