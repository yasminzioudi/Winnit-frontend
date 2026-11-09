"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { WinnerAnalysis } from "@/lib/api/types";
import { ProfitOSContainer } from "@/components/profit-os/ProfitOSContainer";
import { ProfitOSSubNav } from "@/components/profit-os/SubNav";
import { PeriodPicker, getDatesForPeriod, type PeriodKey } from "@/components/profit-os/PeriodPicker";
import { WinnersPodium } from "@/components/winners/WinnersPodium";
import { WinnersTable } from "@/components/winners/WinnersTable";
import { ScoreBreakdownDrawer } from "@/components/winners/ScoreBreakdownDrawer";
import { ErrorState } from "@/components/ui/ErrorState";

function WinnersContent() {
  const searchParams = useSearchParams();
  const periodParam = (searchParams.get("period") as PeriodKey) || "90d";

  const [defaultDates] = useState(() => getDatesForPeriod(periodParam));
  const from = searchParams.get("from") || defaultDates.from;
  const to = searchParams.get("to") || defaultDates.to;

  const [selectedProduct, setSelectedProduct] = useState<WinnerAnalysis | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: winners = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.analytics.winners({ from, to }),
    queryFn: () => apiClient.getWinners(from, to),
  });

  const handleSelectProduct = (product: WinnerAnalysis) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
  };

  if (isError) {
    return (
      <ProfitOSContainer>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Podium des Produits (Winners)
            </h1>
            <p className="text-xs text-muted">
              Classement multi-facteurs de rentabilité et vitesse de rotation
            </p>
          </div>
          <PeriodPicker />
        </div>

        <ProfitOSSubNav />

        <ErrorState
          title="Erreur lors du calcul du classement des produits"
          message={error instanceof Error ? error.message : undefined}
          onRetry={() => refetch()}
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
            Podium des Produits (Winners)
          </h1>
          <p className="text-xs text-muted">
            Classement algorithmique des produits basé sur le score composite (Marge, Livraison, ROAS, Volume)
          </p>
        </div>
        <PeriodPicker />
      </div>

      {/* Shared Sub-Navigation */}
      <ProfitOSSubNav />

      {/* Top 3 on Physical Aligned Podium */}
      <WinnersPodium
        winners={winners.slice(0, 3)}
        onSelectProduct={handleSelectProduct}
      />

      {/* Full Catalogue Ranking Table */}
      <WinnersTable
        winners={winners}
        onSelectProduct={handleSelectProduct}
        isLoading={isLoading}
      />

      {/* Score Breakdown Drawer "Pourquoi ce score ?" */}
      <ScoreBreakdownDrawer
        product={selectedProduct}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </ProfitOSContainer>
  );
}

export default function WinnersPage() {
  return (
    <Suspense
      fallback={
        <ProfitOSContainer>
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-surface-subtle rounded w-1/4" />
            <div className="h-12 bg-surface-subtle rounded-2xl w-full" />
            <div className="h-64 bg-surface-subtle rounded-2xl w-full" />
            <div className="h-80 bg-surface-subtle rounded-2xl w-full" />
          </div>
        </ProfitOSContainer>
      }
    >
      <WinnersContent />
    </Suspense>
  );
}
