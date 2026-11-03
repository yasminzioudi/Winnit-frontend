"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { CODAnalyticsResponse, SettlementsListResponse } from "@/lib/api/types";
import { ProfitOSSubNav } from "@/components/profit-os/SubNav";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/hooks/useToast";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { PeriodPicker, getDatesForPeriod, type PeriodKey } from "@/components/profit-os/PeriodPicker";
import { Banknote, Wallet, Clock, CheckCircle, AlertCircle } from "lucide-react";

function CODPageContent() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const [showReconcileConfirm, setShowReconcileConfirm] = useState(false);

  const periodParam = (searchParams.get("period") as PeriodKey) || "30d";
  const defaultDates = getDatesForPeriod(periodParam);
  const from = searchParams.get("from") || defaultDates.from;
  const to = searchParams.get("to") || defaultDates.to;

  // COD Analytics
  const codQuery = useQuery({
    queryKey: queryKeys.analytics.cod({ from, to }),
    queryFn: () =>
      apiGet<CODAnalyticsResponse>(`/analytics/cod?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  });

  // Settlements list
  const settlementsQuery = useQuery({
    queryKey: queryKeys.settlements.list(),
    queryFn: () => apiGet<SettlementsListResponse>("/settlements?limit=50"),
  });

  const reconcileMutation = useMutation({
    mutationFn: () => apiPost("/settlements/reconcile", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settlements.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      success("Réconciliation déclenchée avec succès");
      setShowReconcileConfirm(false);
    },
    onError: (err: Error) => {
      toastError(err.message || "Erreur lors de la réconciliation");
    },
  });

  const codData = codQuery.data;
  const settlements = settlementsQuery.data?.data || [];

  if (codQuery.isError) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Trésorerie COD</h1>
            <p className="text-xs text-neutral-500">Encaissements, règlements et virement bancaire</p>
          </div>
          <PeriodPicker />
        </div>
        <ProfitOSSubNav />
        <ErrorState
          title="Erreur lors du chargement des données COD"
          message={codQuery.error instanceof Error ? codQuery.error.message : undefined}
          onRetry={() => {
            codQuery.refetch();
            settlementsQuery.refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Trésorerie COD
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Flux de règlement des transporteurs & encaissements réels
          </p>
        </div>
        <PeriodPicker />
      </div>

      {/* Subnav */}
      <ProfitOSSubNav />

      {/* COD Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Expected Collections */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-surface">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-info/10 rounded-lg">
              <Wallet className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Collections Attendues</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {codData ? formatMoney(codData.summary.expectedCashCollectionsMillimes / 1000) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Wire Settled */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-surface">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-positive-mint rounded-lg">
              <CheckCircle className="h-5 w-5 text-positive-emerald" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">Virements Reçus</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {codData ? formatMoney(codData.summary.bankWireSettledMillimes / 1000) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Payouts */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-surface">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning-cream rounded-lg">
              <Clock className="h-5 w-5 text-warning-amber" />
            </div>
            <div>
              <p className="text-xs text-neutral-500">En Attente Transporteur</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {codData ? formatMoney(codData.summary.pendingCourierPayoutsMillimes / 1000) : "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reconcile Button */}
      <div className="flex justify-end gap-3">
        {showReconcileConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Confirmer la réconciliation ?</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReconcileConfirm(false)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => reconcileMutation.mutate()}
              isLoading={reconcileMutation.isPending}
            >
              Confirmer
            </Button>
          </div>
        ) : (
          <Button
            variant="subtle"
            onClick={() => setShowReconcileConfirm(true)}
            className="gap-2"
          >
            <Banknote className="h-4 w-4" />
            Réconcilier Maintenant
          </Button>
        )}
      </div>

      {/* Settlements Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-surface dark:bg-neutral-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="p-3.5 font-semibold">Transporteur</th>
              <th className="p-3.5 font-semibold">Date de Règlement</th>
              <th className="p-3.5 font-semibold text-right">Montant Total</th>
              <th className="p-3.5 font-semibold">Nb Commandes</th>
              <th className="p-3.5 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {settlementsQuery.isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  Chargement...
                </td>
              </tr>
            ) : settlements.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  Aucun règlement trouvé
                </td>
              </tr>
            ) : (
              settlements.map((settlement) => (
                <tr key={settlement._id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                  <td className="p-3.5 font-medium text-foreground capitalize">
                    {settlement.courier}
                  </td>
                  <td className="p-3.5 text-neutral-500">
                    {formatDate(settlement.settlementDate)}
                  </td>
                  <td className="p-3.5 text-right font-bold tabular-nums text-foreground">
                    {formatMoney(settlement.totalAmountMillimes / 1000)}
                  </td>
                  <td className="p-3.5 text-neutral-500">
                    {settlement.orderIds.length} commandes
                  </td>
                  <td className="p-3.5">
                    {settlement.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning-cream text-warning-amber">
                        <Clock className="h-3 w-3" />
                        En attente
                      </span>
                    ) : settlement.status === "settled" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-positive-mint text-positive-emerald">
                        <CheckCircle className="h-3 w-3" />
                        Réglé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {settlement.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {settlementsQuery.isError && (
        <div className="mt-4">
          <ErrorState
            title="Erreur lors du chargement des règlements"
            message={settlementsQuery.error instanceof Error ? settlementsQuery.error.message : undefined}
            onRetry={() => settlementsQuery.refetch()}
          />
        </div>
      )}
    </div>
  );
}

export default function CODPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <CODPageContent />
    </Suspense>
  );
}
