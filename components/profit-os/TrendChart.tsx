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
} from "recharts";
import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/format/currency";
import type { TimeseriesResponse, TimeseriesBucket } from "@/lib/api/types";

interface TrendChartProps {
  data?: TimeseriesResponse;
  isLoading?: boolean;
}

export function TrendChart({ data, isLoading }: TrendChartProps) {
  if (isLoading || !data) {
    return (
      <Card className="p-6">
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 mb-4 animate-pulse" />
        <div className="h-64 bg-neutral-100 dark:bg-neutral-900 rounded-xl animate-pulse" />
      </Card>
    );
  }

  const chartData = data.buckets.map((b: TimeseriesBucket) => ({
    date: b.period.length > 10 ? b.period.substring(0, 10) : b.period,
    revenueTnd: Math.round(b.grossRevenueMillimes / 1000),
    netTnd: Math.round(b.netContributionMillimes / 1000),
    orders: b.ordersCount,
    adSpendTnd: Math.round(b.adSpendMillimes / 1000),
  }));

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Évolution Revenus & Contribution Nette
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Dynamique financière quotidienne / hebdomadaire
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Ventes Brutes
          </span>
          <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Contribution Nette
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-primary, #6366f1)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v} T`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const rev = payload[0]?.value as number;
                  const net = payload[1]?.value as number;
                  return (
                    <div className="bg-surface dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-xl shadow-lg text-xs">
                      <div className="font-semibold text-foreground mb-1.5">{label}</div>
                      <div className="flex items-center justify-between gap-4 text-primary font-medium">
                        <span>Ventes:</span>
                        <span className="tabular-nums">{formatMoney(rev)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Net:</span>
                        <span className="tabular-nums">{formatMoney(net)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenueTnd"
              stroke="var(--color-primary, #6366f1)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGrad)"
            />
            <Area
              type="monotone"
              dataKey="netTnd"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#netGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

