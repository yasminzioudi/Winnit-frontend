'use client';

import { Suspense, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProfitOSSubNav } from '@/components/profit-os/SubNav';
import { apiClient } from '@/lib/api/client';
import {
  calculateMaxTolerableCPA,
  calculateBreakEvenROAS,
  calculateNetProfitPerUnit,
} from '@/lib/finance/profit';
import type { Scenario, PricingCurvePoint } from '@/lib/api/types';

function SimulatorContent() {
  const queryClient = useQueryClient();

  // Input sliders (millimes)
  const [unitPrice, setUnitPrice] = useState(129_000);
  const [unitCogs, setUnitCogs] = useState(28_000);
  const [shippingCost, setShippingCost] = useState(14_000);
  const [adCpa, setAdCpa] = useState(22_000);
  const [refusalRate, setRefusalRate] = useState(21);

  // Advanced parameters for optimizer
  const [baseVolume, setBaseVolume] = useState(100);
  const [elasticity, setElasticity] = useState(-1.5);
  const [refusalSensitivity, setRefusalSensitivity] = useState(0.05);
  const [targetMarginPercent, setTargetMarginPercent] = useState(35);

  // Scenario management
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioNotes, setScenarioNotes] = useState('');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  // Calculated metrics
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

  // Fetch pricing curve
  const { data: curveData, isLoading: curveLoading } = useQuery({
    queryKey: [
      'pricing-curve',
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
    enabled: unitPrice >= 1000 && unitCogs >= 0 && shippingCost >= 0,
  });

  // Fetch scenarios
  const { data: scenarios = [] } = useQuery({
    queryKey: ['scenarios'],
    queryFn: () => apiClient.getScenarios(),
  });

  // Save scenario mutation
  const saveScenarioMutation = useMutation({
    mutationFn: (data: Omit<Scenario, '_id' | 'version'>) =>
      apiClient.createScenario(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      setScenarioName('');
      setScenarioNotes('');
    },
  });

  // Delete scenario mutation
  const deleteScenarioMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteScenario(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      setSelectedScenarios((prev) =>
        prev.filter((id) => id !== deleteScenarioMutation.variables)
      );
    },
  });

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) return;

    saveScenarioMutation.mutate({
      name: scenarioName,
      productId: 'sim_' + Date.now(),
      unitPriceMillimes: unitPrice,
      unitCogsMillimes: unitCogs,
      shippingMillimes: shippingCost,
      adCpaMillimes: adCpa,
      targetMarginPercent,
      notes: scenarioNotes,
    });
  };

  const handleLoadScenario = (scenario: Scenario) => {
    setUnitPrice(scenario.unitPriceMillimes);
    setUnitCogs(scenario.unitCogsMillimes);
    setShippingCost(scenario.shippingMillimes);
    setAdCpa(scenario.adCpaMillimes);
    setTargetMarginPercent(scenario.targetMarginPercent || 35);
  };

  const toggleScenarioSelection = (id: string) => {
    setSelectedScenarios((prev) => {
      if (prev.includes(id)) {
        return prev.filter((sid) => sid !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <ProfitOSSubNav />
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ink">Simulateur de rentabilité</h1>
        <p className="text-sm text-ink-muted mt-1">
          Testez différents scénarios de prix et coûts • Modèle basé sur vos hypothèses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sliders */}
          <div className="bg-layer-2 rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-semibold text-ink">Paramètres principaux</h2>

            <SliderInput
              label="Prix de vente unitaire"
              value={unitPrice}
              onChange={setUnitPrice}
              min={10_000}
              max={500_000}
              step={1_000}
              unit="TND"
            />

            <SliderInput
              label="Coût des marchandises (COGS)"
              value={unitCogs}
              onChange={setUnitCogs}
              min={1_000}
              max={300_000}
              step={1_000}
              unit="TND"
            />

            <SliderInput
              label="Coût de livraison"
              value={shippingCost}
              onChange={setShippingCost}
              min={1_000}
              max={50_000}
              step={500}
              unit="TND"
            />

            <SliderInput
              label="CPA publicitaire"
              value={adCpa}
              onChange={setAdCpa}
              min={0}
              max={200_000}
              step={1_000}
              unit="TND"
            />

            <SliderInput
              label="Taux de refus (%)"
              value={refusalRate}
              onChange={setRefusalRate}
              min={0}
              max={100}
              step={1}
              unit="%"
              isPercent
            />
          </div>

          {/* Advanced parameters */}
          <details className="bg-layer-2 rounded-lg p-6">
            <summary className="cursor-pointer text-sm font-semibold text-ink">
              Paramètres avancés
            </summary>
            <div className="mt-6 space-y-6">
              <SliderInput
                label="Volume de base"
                value={baseVolume}
                onChange={setBaseVolume}
                min={10}
                max={1000}
                step={10}
                unit="unités"
              />

              <SliderInput
                label="Élasticité-prix"
                value={elasticity}
                onChange={setElasticity}
                min={-5}
                max={0}
                step={0.1}
                unit=""
              />

              <SliderInput
                label="Sensibilité refus/prix"
                value={refusalSensitivity}
                onChange={setRefusalSensitivity}
                min={0}
                max={2}
                step={0.1}
                unit=""
              />

              <SliderInput
                label="Marge cible (%)"
                value={targetMarginPercent}
                onChange={setTargetMarginPercent}
                min={0}
                max={100}
                step={5}
                unit="%"
                isPercent
              />
            </div>
          </details>

          {/* Profit curve */}
          <div className="bg-layer-2 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">
              Courbe profit vs prix
            </h2>
            {curveLoading ? (
              <div className="h-64 bg-layer-3 rounded animate-pulse" />
            ) : curveData ? (
              <ProfitCurve
                curve={curveData.curve}
                currentPrice={unitPrice}
                breakEvenPrice={curveData.breakEvenPriceMillimes}
                optimumPrice={curveData.elasticOptimumMillimes}
                recommendedBand={curveData.recommendedBand}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-ink-muted">
                Aucune donnée disponible
              </div>
            )}
          </div>
        </div>

        {/* Right column - Metrics & Scenarios */}
        <div className="space-y-6">
          {/* Live metrics tiles */}
          <div className="space-y-3">
            <MetricTile
              label="CPA max tolérable"
              value={maxCpa}
              unit="TND"
              description="Au-delà, vous perdez de l'argent"
              status={adCpa <= maxCpa ? 'good' : 'bad'}
            />

            <MetricTile
              label="ROAS break-even"
              value={breakEvenRoas}
              unit="×"
              description="Seuil de rentabilité publicitaire"
              status={breakEvenRoas <= 2 ? 'good' : 'warning'}
            />

            <MetricTile
              label="Profit net unitaire"
              value={netProfit}
              unit="TND"
              description="Bénéfice par vente confirmée"
              status={netProfit > 0 ? 'good' : 'bad'}
            />
          </div>

          {/* Save scenario */}
          <div className="bg-layer-2 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-ink">
              Enregistrer le scénario
            </h3>
            <input
              type="text"
              placeholder="Nom du scénario"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full px-3 py-2 bg-layer-1 border border-border rounded-md text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <textarea
              placeholder="Notes (optionnel)"
              value={scenarioNotes}
              onChange={(e) => setScenarioNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-layer-1 border border-border rounded-md text-ink placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
            <button
              onClick={handleSaveScenario}
              disabled={!scenarioName.trim() || saveScenarioMutation.isPending}
              className="w-full px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveScenarioMutation.isPending
                ? 'Enregistrement...'
                : 'Enregistrer'}
            </button>
          </div>

          {/* Scenarios list */}
          <div className="bg-layer-2 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-ink mb-4">
              Scénarios enregistrés
            </h3>
            {scenarios.length === 0 ? (
              <p className="text-sm text-ink-muted text-center py-4">
                Aucun scénario enregistré
              </p>
            ) : (
              <div className="space-y-2">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario._id}
                    className="flex items-center justify-between p-3 bg-layer-3 rounded-lg hover:bg-layer-3/70 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink truncate">
                        {scenario.name}
                      </div>
                      <div className="text-xs text-ink-muted">
                        Prix: {(scenario.unitPriceMillimes / 1000).toFixed(2)} TND
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <button
                        onClick={() => toggleScenarioSelection(scenario._id)}
                        className={`p-1 rounded ${
                          selectedScenarios.includes(scenario._id)
                            ? 'bg-accent text-white'
                            : 'bg-layer-2 text-ink-muted hover:bg-layer-1'
                        }`}
                        disabled={
                          !selectedScenarios.includes(scenario._id) &&
                          selectedScenarios.length >= 3
                        }
                        title="Comparer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleLoadScenario(scenario)}
                        className="p-1 rounded bg-layer-2 text-ink-muted hover:bg-layer-1 hover:text-ink"
                        title="Charger"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteScenarioMutation.mutate(scenario._id)}
                        className="p-1 rounded bg-layer-2 text-[var(--negative-red)] hover:bg-[var(--negative-tint)]"
                        title="Supprimer"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comparison */}
          {selectedScenarios.length > 0 && (
            <div className="bg-layer-2 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-ink mb-4">
                Comparaison ({selectedScenarios.length}/3)
              </h3>
              <ScenarioComparison
                scenarios={scenarios.filter((s) =>
                  selectedScenarios.includes(s._id)
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  isPercent = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  isPercent?: boolean;
}) {
  const displayValue = isPercent ? value : value / 1000;
  const displayUnit = isPercent ? unit : unit;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-ink">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={displayValue.toFixed(isPercent ? 0 : 2)}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) {
                onChange(isPercent ? val : val * 1000);
              }
            }}
            className="w-24 px-2 py-1 text-sm bg-layer-1 border border-border rounded text-ink text-right"
            step={isPercent ? 1 : 0.01}
          />
          <span className="text-sm text-ink-muted min-w-[3rem]">
            {displayUnit}
          </span>
        </div>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 bg-layer-3 rounded-lg appearance-none cursor-pointer accent-accent"
      />
    </div>
  );
}

function MetricTile({
  label,
  value,
  unit,
  description,
  status,
}: {
  label: string;
  value: number;
  unit: string;
  description: string;
  status: 'good' | 'warning' | 'bad';
}) {
  const statusColors = {
    good: 'border-[var(--positive-emerald)] bg-[var(--positive-mint)]',
    warning: 'border-[var(--warning-amber)] bg-[var(--warning-cream)]',
    bad: 'border-[var(--negative-red)] bg-[var(--negative-tint)]',
  };

  const displayValue = unit === 'TND' ? (value / 1000).toFixed(2) : value.toFixed(2);

  return (
    <div
      className={`border-l-4 ${statusColors[status]} bg-layer-2 rounded-lg p-4`}
    >
      <div className="text-xs text-ink-muted uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold text-ink">
        {displayValue} <span className="text-lg font-normal">{unit}</span>
      </div>
      <div className="text-xs text-ink-muted mt-1">{description}</div>
    </div>
  );
}

function ProfitCurve({
  curve,
  currentPrice,
  breakEvenPrice,
  optimumPrice,
  recommendedBand,
}: {
  curve: PricingCurvePoint[];
  currentPrice: number;
  breakEvenPrice: number;
  optimumPrice: number;
  recommendedBand: { minMillimes: number; maxMillimes: number };
}) {
  if (curve.length === 0) {
    return (
      <div className="text-center text-ink-muted py-8">Aucune donnée</div>
    );
  }

  const maxProfit = Math.max(...curve.map((p) => p.profitMillimes));
  const minProfit = Math.min(...curve.map((p) => p.profitMillimes));
  const priceRange = curve[curve.length - 1].priceMillimes - curve[0].priceMillimes;

  return (
    <div className="relative h-64">
      <svg className="w-full h-full" viewBox="0 0 800 300">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const y = 280 - (pct / 100) * 260;
          return (
            <line
              key={pct}
              x1="40"
              y1={y}
              x2="780"
              y2={y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border opacity-30"
            />
          );
        })}

        {/* Recommended band */}
        {recommendedBand && (
          <rect
            x={
              40 +
              ((recommendedBand.minMillimes - curve[0].priceMillimes) /
                priceRange) *
                740
            }
            y="20"
            width={
              ((recommendedBand.maxMillimes - recommendedBand.minMillimes) /
                priceRange) *
              740
            }
            height="260"
            fill="currentColor"
            className="text-[var(--positive-emerald)] opacity-10"
          />
        )}

        {/* Break-even line */}
        <line
          x1={
            40 +
            ((breakEvenPrice - curve[0].priceMillimes) / priceRange) * 740
          }
          y1="20"
          x2={
            40 +
            ((breakEvenPrice - curve[0].priceMillimes) / priceRange) * 740
          }
          y2="280"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="text-[var(--negative-red)]"
        />

        {/* Optimum marker */}
        {optimumPrice && (
          <>
            <line
              x1={
                40 +
                ((optimumPrice - curve[0].priceMillimes) / priceRange) * 740
              }
              y1="20"
              x2={
                40 +
                ((optimumPrice - curve[0].priceMillimes) / priceRange) * 740
              }
              y2="280"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 3"
              className="text-[var(--positive-emerald)]"
            />
            <circle
              cx={
                40 +
                ((optimumPrice - curve[0].priceMillimes) / priceRange) * 740
              }
              cy={
                280 -
                ((curve.find((p) => p.priceMillimes === optimumPrice)
                  ?.profitMillimes || maxProfit) -
                  minProfit) /
                  (maxProfit - minProfit) *
                  260
              }
              r="5"
              fill="currentColor"
              className="text-[var(--positive-emerald)]"
            />
          </>
        )}

        {/* Profit curve */}
        <polyline
          points={curve
            .map((point, i) => {
              const x =
                40 +
                ((point.priceMillimes - curve[0].priceMillimes) / priceRange) *
                  740;
              const y =
                280 -
                ((point.profitMillimes - minProfit) /
                  (maxProfit - minProfit)) *
                  260;
              return `${x},${y}`;
            })
            .join(' ')}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-accent"
        />

        {/* Current price marker */}
        <circle
          cx={
            40 + ((currentPrice - curve[0].priceMillimes) / priceRange) * 740
          }
          cy={
            280 -
            ((curve.find((p) => p.priceMillimes === currentPrice)
              ?.profitMillimes || 0) -
              minProfit) /
              (maxProfit - minProfit) *
              260
          }
          r="6"
          fill="currentColor"
          className="text-accent"
        />

        {/* Axes */}
        <line
          x1="40"
          y1="280"
          x2="780"
          y2="280"
          stroke="currentColor"
          strokeWidth="2"
          className="text-ink"
        />
        <line
          x1="40"
          y1="20"
          x2="40"
          y2="280"
          stroke="currentColor"
          strokeWidth="2"
          className="text-ink"
        />

        {/* Labels */}
        <text
          x="400"
          y="295"
          textAnchor="middle"
          className="text-xs fill-ink-muted"
        >
          Prix (TND)
        </text>
        <text
          x="10"
          y="150"
          textAnchor="middle"
          transform="rotate(-90 10 150)"
          className="text-xs fill-ink-muted"
        >
          Profit net (TND)
        </text>
      </svg>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-ink-muted">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span>Prix actuel</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-0.5 border-t-2 border-dashed border-red-500" />
          <span>Break-even</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[var(--positive-emerald)] opacity-30" />
          <span>Zone recommandée</span>
        </div>
      </div>
    </div>
  );
}

function ScenarioComparison({ scenarios }: { scenarios: Scenario[] }) {
  if (scenarios.length === 0) return null;

  const metrics = scenarios.map((s) => {
    const maxCpa = calculateMaxTolerableCPA(
      s.unitPriceMillimes,
      s.unitCogsMillimes,
      s.shippingMillimes,
      21 // default refusal rate
    );
    const breakEvenRoas = calculateBreakEvenROAS(
      s.unitPriceMillimes,
      s.unitCogsMillimes,
      s.shippingMillimes,
      21
    );
    const netProfit = calculateNetProfitPerUnit(
      s.unitPriceMillimes,
      s.unitCogsMillimes,
      s.shippingMillimes,
      s.adCpaMillimes,
      21
    );

    return {
      name: s.name,
      price: s.unitPriceMillimes / 1000,
      maxCpa: maxCpa / 1000,
      breakEvenRoas,
      netProfit: netProfit / 1000,
    };
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 text-ink-muted font-medium">Métrique</th>
            {metrics.map((m, i) => (
              <th key={i} className="text-right py-2 text-ink font-medium">
                {m.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-ink">
          <tr className="border-b border-border">
            <td className="py-2 text-ink-muted">Prix</td>
            {metrics.map((m, i) => (
              <td key={i} className="text-right py-2">
                {m.price.toFixed(2)} TND
              </td>
            ))}
          </tr>
          <tr className="border-b border-border">
            <td className="py-2 text-ink-muted">CPA max</td>
            {metrics.map((m, i) => (
              <td key={i} className="text-right py-2">
                {m.maxCpa.toFixed(2)} TND
              </td>
            ))}
          </tr>
          <tr className="border-b border-border">
            <td className="py-2 text-ink-muted">ROAS B/E</td>
            {metrics.map((m, i) => (
              <td key={i} className="text-right py-2">
                {m.breakEvenRoas.toFixed(2)}×
              </td>
            ))}
          </tr>
          <tr>
            <td className="py-2 text-ink-muted">Profit net</td>
            {metrics.map((m, i) => (
              <td
                key={i}
                className={`text-right py-2 font-semibold ${
                  m.netProfit > 0 ? 'text-[var(--positive-emerald)]' : 'text-[var(--negative-red)]'
                }`}
              >
                {m.netProfit.toFixed(2)} TND
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}


export default function SimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-6 animate-pulse">
          <div className="h-10 bg-layer-3 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="h-96 bg-layer-2 rounded-lg" />
              <div className="h-64 bg-layer-2 rounded-lg" />
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-layer-2 rounded-lg" />
              <div className="h-32 bg-layer-2 rounded-lg" />
              <div className="h-32 bg-layer-2 rounded-lg" />
            </div>
          </div>
        </div>
      }
    >
      <SimulatorContent />
    </Suspense>
  );
}
