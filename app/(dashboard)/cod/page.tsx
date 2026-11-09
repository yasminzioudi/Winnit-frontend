"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  CODAnalyticsResponse,
  SettlementsListResponse,
  CourierAnalyticsResponse,
  GovernorateAnalyticsResponse,
  SettlementResponse,
} from "@/lib/api/types";
import { ProfitOSContainer } from "@/components/profit-os/ProfitOSContainer";
import { ProfitOSSubNav } from "@/components/profit-os/SubNav";
import { PeriodPicker, getDatesForPeriod, type PeriodKey } from "@/components/profit-os/PeriodPicker";
import { CodKpiCards } from "@/components/cod/CodKpiCards";
import { CodAgingCard } from "@/components/cod/CodAgingCard";
import { CourierGovernorateBreakdown } from "@/components/cod/CourierGovernorateBreakdown";
import { SettlementsList } from "@/components/cod/SettlementsList";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/hooks/useToast";

function CODPageContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const periodParam = (searchParams.get("period") as PeriodKey) || "90d";
  const [defaultDates] = useState(() => getDatesForPeriod(periodParam));

  const from = searchParams.get("from") || defaultDates.from;
  const to = searchParams.get("to") || defaultDates.to;

  // 1. COD Analytics (KPIs + aging)
  const codQuery = useQuery({
    queryKey: queryKeys.analytics.cod({ from, to }),
    queryFn: () =>
      apiGet<CODAnalyticsResponse>(
        `/analytics/cod?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      ),
  });

  // 2. Courier Analytics
  const courierQuery = useQuery({
    queryKey: queryKeys.analytics.couriers({ from, to }),
    queryFn: () =>
      apiGet<CourierAnalyticsResponse>(
        `/analytics/by-courier?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      ),
  });

  // 3. Governorate Analytics
  const governorateQuery = useQuery({
    queryKey: queryKeys.analytics.geo({ from, to }),
    queryFn: () =>
      apiGet<GovernorateAnalyticsResponse>(
        `/analytics/by-governorate?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      ),
  });

  // 4. Settlements list
  const settlementsQuery = useQuery({
    queryKey: queryKeys.settlements.list(),
    queryFn: () => apiGet<SettlementsListResponse>("/settlements?limit=50"),
  });

  const settlements: SettlementResponse[] = settlementsQuery.data?.data || [];

  // Reconcile Mutation with optimistic update
  const reconcileMutation = useMutation({
    mutationFn: async () => {
      const pending = settlements.filter((s) => s.status === "pending");
      if (pending.length === 0) {
        throw new Error("Aucun règlement en attente à réconcilier.");
      }

      await Promise.all(
        pending.map((s) => apiPost(`/settlements/${s._id}/reconcile`, {}))
      );
    },
    onMutate: async () => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.settlements.list() });

      // Snapshot previous settlements
      const previous = queryClient.getQueryData<SettlementsListResponse>(
        queryKeys.settlements.list()
      );

      // Optimistically mark all pending settlements as settled
      if (previous) {
        queryClient.setQueryData<SettlementsListResponse>(
          queryKeys.settlements.list(),
          {
            ...previous,
            data: previous.data.map((s) =>
              s.status === "pending" ? { ...s, status: "settled" } : s
            ),
          }
        );
      }

      return { previous };
    },
    onError: (err: Error, _variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.settlements.list(), context.previous);
      }
      toastError(
        err.message || "Erreur lors de la réconciliation. Cliquez pour réessayer."
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      success("Réconciliation effectuée avec succès ! Les fonds sont marqués comme virés.");
    },
  });

  const handleReconcile = async () => {
    await reconcileMutation.mutateAsync();
  };

  if (codQuery.isError) {
    return (
      <ProfitOSContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Trésorerie COD & Transporteurs
            </h1>
            <p className="text-xs text-muted">
              Encaissements, règlements et rapprochement bancaire
            </p>
          </div>
          <PeriodPicker />
        </div>

        <ProfitOSSubNav />

        <ErrorState
          title="Erreur lors du chargement des analyses COD"
          message={
            codQuery.error instanceof Error ? codQuery.error.message : undefined
          }
          onRetry={() => {
            codQuery.refetch();
            courierQuery.refetch();
            governorateQuery.refetch();
            settlementsQuery.refetch();
          }}
        />
      </ProfitOSContainer>
    );
  }

  return (
    <ProfitOSContainer>
      {/* Header with Dashboard PeriodPicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Trésorerie COD & Transporteurs
          </h1>
          <p className="text-xs text-muted">
            Flux de règlement des transporteurs & encaissements réels
          </p>
        </div>
        <PeriodPicker />
      </div>

      {/* Shared Sub-Navigation */}
      <ProfitOSSubNav />

      {/* 3 KPI Cards with Progress Bar (settled / expected) */}
      <CodKpiCards
        data={codQuery.data}
        isLoading={codQuery.isLoading}
      />

      {/* Aging Analysis Cards (0-7j, 8-14j, 15-30j, >30j) */}
      <CodAgingCard
        aging={codQuery.data?.aging}
        isLoading={codQuery.isLoading}
      />

      {/* Couriers and Governorates Performance Bars */}
      <CourierGovernorateBreakdown
        couriers={courierQuery.data?.couriers}
        governorates={governorateQuery.data?.governorates}
        isLoading={courierQuery.isLoading || governorateQuery.isLoading}
      />

      {/* Settlements: Mobile Cards / Desktop Table with Badges + Optimistic Reconcile */}
      <SettlementsList
        settlements={settlements}
        isLoading={settlementsQuery.isLoading}
        onReconcile={handleReconcile}
        isReconciling={reconcileMutation.isPending}
      />
    </ProfitOSContainer>
  );
}

export default function CODPage() {
  return (
    <Suspense
      fallback={
        <ProfitOSContainer>
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-surface-subtle rounded w-1/4" />
            <div className="h-12 bg-surface-subtle rounded-2xl w-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-surface-subtle rounded-xl" />
              ))}
            </div>
          </div>
        </ProfitOSContainer>
      }
    >
      <CODPageContent />
    </Suspense>
  );
}
