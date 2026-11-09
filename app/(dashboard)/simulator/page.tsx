"use client";

import React, { Suspense, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfitOSContainer } from "@/components/profit-os/ProfitOSContainer";
import { ProfitOSSubNav } from "@/components/profit-os/SubNav";
import { Card } from "@/components/ui/Card";
import { SimulatorSlider } from "@/components/simulator/SimulatorSlider";
import { SimulatorStickyResults } from "@/components/simulator/SimulatorStickyResults";
import { ProfitPriceCurve } from "@/components/simulator/ProfitPriceCurve";
import { SavedScenariosCard } from "@/components/simulator/SavedScenariosCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import {
  calculateMaxTolerableCPA,
  calculateBreakEvenROAS,
  calculateNetProfitPerUnit,
} from "@/lib/finance/profit";
import type { Scenario, OptimizePriceResponse } from "@/lib/api/types";
import { Sliders, ChevronDown } from "lucide-react";

function SimulatorContent() {
  const queryClient = useQueryClient();

  // Primary input sliders (values in millimes, refusalRate in %)
  const [unitPrice, setUnitPrice] = useState(129_000);
  const [unitCogs, setUnitCogs] = useState(28_000);
  const [shippingCost, setShippingCost] = useState(14_000);
  const [adCpa, setAdCpa] = useState(22_000);
  const [refusalRate, setRefusalRate] = useState(21);

  // Advanced parameters for price elasticity and demand
  const [baseVolume, setBaseVolume] = useState(100);
  const [elasticity, setElasticity] = useState(-1.5);
  const [refusalSensitivity, setRefusalSensitivity] = useState(0.05);
  const [targetMarginPercent, setTargetMarginPercent] = useState(35);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Computed metrics (using pure finance functions)
  const maxCpa = calculateMaxTolerableCPA(
    unitPrice,
    unitCogs,
    shippingCost,
    refusalRate
  );

  const breakEvenRoas = calculateBreakEvenROAS(
    unitPrice,
    unitCogs,
    shippingCost,
    refusalRate
  );

  const netProfit = calculateNetProfitPerUnit(
    unitPrice,
    unitCogs,
    shippingCost,
    adCpa,
    refusalRate
  );

  // Optimize price curve query
  const curveQuery = useQuery<OptimizePriceResponse>({
    queryKey: [
      "pricing-curve",
      unitPrice,
      unitCogs,
      shippingCost,
      adCpa,
      baseVolume,
      elasticity,
      refusalRate,
      refusalSensitivity,
      targetMarginPercent,
    ],
    queryFn: () =>
      apiClient.optimizePrice({
        basePriceMillimes: unitPrice,
        cogsMillimes: unitCogs,
        logisticsMillimes: shippingCost,
        cpaMillimes: adCpa,
        baseVolume,
        elasticity,
        baseRefusalRate: refusalRate / 100,
        refusalSensitivity,
        targetMarginPercent,
      }),
    staleTime: 30_000,
    enabled: unitPrice >= 1_000 && unitCogs >= 0 && shippingCost >= 0,
  });

  // Saved scenarios query
  const scenariosQuery = useQuery({
    queryKey: queryKeys.scenarios.list(),
    queryFn: () => apiClient.getScenarios(),
  });

  const scenarios: Scenario[] = scenariosQuery.data || [];

  // Create scenario mutation
  const saveMutation = useMutation({
    mutationFn: (data: Omit<Scenario, "_id" | "version">) =>
      apiClient.createScenario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scenarios.list() });
    },
  });

  // Delete scenario mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteScenario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.scenarios.list() });
    },
  });

  const handleSaveScenario = async (name: string, notes: string) => {
    await saveMutation.mutateAsync({
      name,
      productId: "sim_" + Date.now(),
      unitPriceMillimes: unitPrice,
      unitCogsMillimes: unitCogs,
      shippingMillimes: shippingCost,
      adCpaMillimes: adCpa,
      targetMarginPercent,
      notes,
    });
  };

  const handleLoadScenario = (scenario: Scenario) => {
    setUnitPrice(scenario.unitPriceMillimes);
    setUnitCogs(scenario.unitCogsMillimes);
    setShippingCost(scenario.shippingMillimes);
    setAdCpa(scenario.adCpaMillimes);
    if (scenario.targetMarginPercent) {
      setTargetMarginPercent(scenario.targetMarginPercent);
    }
  };

  const handleDeleteScenario = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <ProfitOSContainer>
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Simulateur de Rentabilité
        </h1>
        <p className="text-xs text-muted">
          Testez différents scénarios de prix et de coûts • Modèle basé sur vos hypothèses
        </p>
      </div>

      {/* Shared Sub-Navigation */}
      <ProfitOSSubNav />

      {/* Main Grid: Controls & Curve on left, Sticky Results & Scenarios on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Sliders, Advanced, and Profit Curve */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Parameters Card */}
          <Card className="p-5 sm:p-6 space-y-6">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-lime-text bg-brand-lime p-0.5 rounded" />
              <h2 className="text-base font-semibold text-foreground">
                Paramètres Principaux
              </h2>
            </div>

            <div className="space-y-5">
              <SimulatorSlider
                label="Prix de vente unitaire"
                value={unitPrice}
                onChange={setUnitPrice}
                min={10_000}
                max={500_000}
                step={1_000}
                unit="TND"
                isCurrency
              />

              <SimulatorSlider
                label="Coût d'achat produit (COGS)"
                value={unitCogs}
                onChange={setUnitCogs}
                min={1_000}
                max={300_000}
                step={1_000}
                unit="TND"
                isCurrency
              />

              <SimulatorSlider
                label="Coût de livraison moyen"
                value={shippingCost}
                onChange={setShippingCost}
                min={1_000}
                max={50_000}
                step={500}
                unit="TND"
                isCurrency
              />

              <SimulatorSlider
                label="Coût par acquisition (CPA pub)"
                value={adCpa}
                onChange={setAdCpa}
                min={0}
                max={200_000}
                step={1_000}
                unit="TND"
                isCurrency
              />

              <SimulatorSlider
                label="Taux de refus prévisionnel"
                value={refusalRate}
                onChange={setRefusalRate}
                min={0}
                max={100}
                step={1}
                unit="%"
                isPercent
              />
            </div>
          </Card>

          {/* Advanced Elasticity Parameters */}
          <Card className="p-5 sm:p-6 space-y-4">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full flex items-center justify-between text-left cursor-pointer select-none group"
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground group-hover:text-brand-lime transition-colors">
                  Paramètres Avancés (Élasticité & Sensibilité)
                </h3>
                <p className="text-xs text-muted">
                  Élasticité-prix de la demande et sensibilité aux refus
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-muted transition-transform duration-200 ${
                  isAdvancedOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isAdvancedOpen && (
              <div className="pt-4 border-t border-border space-y-5 animate-in fade-in duration-150">
                <SimulatorSlider
                  label="Volume de base projeté"
                  value={baseVolume}
                  onChange={setBaseVolume}
                  min={10}
                  max={2000}
                  step={10}
                  unit="cdes"
                />

                <SimulatorSlider
                  label="Élasticité-prix de la demande"
                  value={elasticity}
                  onChange={setElasticity}
                  min={-5}
                  max={0}
                  step={0.1}
                  unit=""
                />

                <SimulatorSlider
                  label="Sensibilité du taux de refus au prix"
                  value={refusalSensitivity}
                  onChange={setRefusalSensitivity}
                  min={0}
                  max={2}
                  step={0.05}
                  unit=""
                />

                <SimulatorSlider
                  label="Marge cible souhaitée"
                  value={targetMarginPercent}
                  onChange={setTargetMarginPercent}
                  min={5}
                  max={80}
                  step={5}
                  unit="%"
                  isPercent
                />
              </div>
            )}
          </Card>

          {/* Profit vs Price Curve */}
          {curveQuery.isError ? (
            <ErrorState
              title="Impossible de calculer l'optimisation de prix"
              message={
                curveQuery.error instanceof Error
                  ? curveQuery.error.message
                  : undefined
              }
              onRetry={() => curveQuery.refetch()}
            />
          ) : (
            <ProfitPriceCurve
              curve={curveQuery.data?.curve || []}
              currentPriceMillimes={unitPrice}
              elasticOptimumMillimes={curveQuery.data?.elasticOptimumMillimes || 0}
              breakEvenPriceMillimes={curveQuery.data?.breakEvenPriceMillimes || 0}
              recommendedBand={
                curveQuery.data?.recommendedBand || {
                  minMillimes: 0,
                  maxMillimes: 0,
                }
              }
              isLoading={curveQuery.isLoading}
            />
          )}
        </div>

        {/* Right Column: Sticky Live Results & Saved Scenarios */}
        <div className="space-y-6">
          <SimulatorStickyResults
            maxCpaMillimes={maxCpa}
            breakEvenRoas={breakEvenRoas}
            netProfitMillimes={netProfit}
            currentAdCpaMillimes={adCpa}
          />

          <SavedScenariosCard
            scenarios={scenarios}
            onLoadScenario={handleLoadScenario}
            onSaveScenario={handleSaveScenario}
            onDeleteScenario={handleDeleteScenario}
            isSaving={saveMutation.isPending}
          />
        </div>
      </div>
    </ProfitOSContainer>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense
      fallback={
        <ProfitOSContainer>
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-surface-subtle rounded w-1/4" />
            <div className="h-12 bg-surface-subtle rounded-2xl w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-surface-subtle rounded-2xl" />
              <div className="h-96 bg-surface-subtle rounded-2xl" />
            </div>
          </div>
        </ProfitOSContainer>
      }
    >
      <SimulatorContent />
    </Suspense>
  );
}
