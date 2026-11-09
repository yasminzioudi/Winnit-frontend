"use client";

import React, { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  AnalyticsSummaryResponse,
  TimeseriesResponse,
  Insight,
  WinnerRankingItem,
  CODAnalyticsResponse,
} from "@/lib/api/types";
import { PeriodPicker, getDatesForPeriod, type PeriodKey } from "@/components/profit-os/PeriodPicker";
import { ProfitOSContainer } from "@/components/profit-os/ProfitOSContainer";
import { ProfitOSSubNav } from "@/components/profit-os/SubNav";
import { KpiTiles } from "@/components/profit-os/KpiTiles";
import { WaterfallChart } from "@/components/profit-os/WaterfallChart";
import { InsightsStrip } from "@/components/profit-os/InsightsStrip";
import { MiniLeaderboard } from "@/components/profit-os/MiniLeaderboard";
import { CodCashCard } from "@/components/profit-os/CodCashCard";
import { ErrorState } from "@/components/ui/ErrorState";

const TrendChart = dynamic(
  () => import("@/components/profit-os/TrendChart").then((mod) => mod.TrendChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-72 w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
    ),
  }
);

function ProfitOSDashboardContent() {
  const searchParams = useSearchParams();
  const periodParam = (searchParams.get("period") as PeriodKey) || "90d";
  
  // Initialize dates in useState to avoid hydration issues
  const [defaultDates] = useState(() => getDatesForPeriod(periodParam));

  const from = searchParams.get("from") || defaultDates.from;
  const to = searchParams.get("to") || defaultDates.to;

  // 1. Summary (Waterfall, KPIs, Expenses)
  const summaryQuery = useQuery({
    queryKey: queryKeys.analytics.summary({ from, to }),
    queryFn: () =>
      apiGet<AnalyticsSummaryResponse>(`/analytics/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  });

  // 2. Timeseries trend
  const timeseriesQuery = useQuery({
    queryKey: queryKeys.analytics.timeseries({ from, to, granularity: "daily", metrics: "revenue,net" }),
    queryFn: () =>
      apiGet<TimeseriesResponse>(
        `/analytics/timeseries?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&granularity=daily`
      ),
  });

  // 3. Insights
  const insightsQuery = useQuery({
    queryKey: queryKeys.analytics.insights({ from, to }),
    queryFn: () =>
      apiGet<Insight[]>(`/insights?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  });

  // 4. Winners
  const winnersQuery = useQuery({
    queryKey: queryKeys.analytics.winners({ from, to }),
    queryFn: () =>
      apiGet<WinnerRankingItem[]>(`/analytics/winners?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  });

  // 5. COD Cash status
  const codQuery = useQuery({
    queryKey: queryKeys.analytics.cod({ from, to }),
    queryFn: () =>
      apiGet<CODAnalyticsResponse>(`/analytics/cod?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  });

  if (summaryQuery.isError) {
    return (
      <ProfitOSContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Profit OS</h1>
            <p className="text-xs text-muted">Rentabilité réelle & grand livre par commande</p>
          </div>
          <PeriodPicker />
        </div>
        <ProfitOSSubNav />
        <ErrorState
          title="Erreur lors du chargement des analyses financières"
          message={summaryQuery.error instanceof Error ? summaryQuery.error.message : undefined}
          onRetry={() => {
            summaryQuery.refetch();
            timeseriesQuery.refetch();
            insightsQuery.refetch();
            winnersQuery.refetch();
            codQuery.refetch();
          }}
        />
      </ProfitOSContainer>
    );
  }

  return (
    <ProfitOSContainer>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Profit OS
          </h1>
          <p className="text-xs text-muted">
            Économie unitaire réelle, flux COD et cascade de rentabilité
          </p>
        </div>
        <PeriodPicker />
      </div>

      {/* Sub Navigation */}
      <ProfitOSSubNav />

      {/* KPI Tiles */}
      <KpiTiles data={summaryQuery.data} isLoading={summaryQuery.isLoading} />

      {/* Insights Strip */}
      <InsightsStrip
        insights={insightsQuery.data}
        isLoading={insightsQuery.isLoading}
      />

      {/* Waterfall & Trend Chart Grid */}
      <div className="space-y-6">
        <WaterfallChart data={summaryQuery.data} isLoading={summaryQuery.isLoading} />
        <TrendChart data={timeseriesQuery.data} isLoading={timeseriesQuery.isLoading} />
      </div>

      {/* Bottom Grid: Winners Leaderboard + COD Cash Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MiniLeaderboard winners={winnersQuery.data} isLoading={winnersQuery.isLoading} />
        <CodCashCard data={codQuery.data} isLoading={codQuery.isLoading} />
      </div>
    </ProfitOSContainer>
  );
}

export default function ProfitOSPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <ProfitOSDashboardContent />
    </Suspense>
  );
}
