'use client';

import { useState } from 'react';
import { ProfitOSSubNav } from '@/components/profit-os/SubNav';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { WinnerAnalysis } from '@/lib/api/types';
import { useSearchParams } from 'next/navigation';
import { PeriodPicker, getDatesForPeriod, type PeriodKey } from '@/components/profit-os/PeriodPicker';

export default function WinnersPage() {
  const searchParams = useSearchParams();
  const periodParam = (searchParams.get('period') as PeriodKey) || '90d';
  
  // Initialize dates in useState to avoid hydration issues
  const [defaultDates] = useState(() => getDatesForPeriod(periodParam));

  const from = searchParams.get('from') || defaultDates.from;
  const to = searchParams.get('to') || defaultDates.to;

  const { data: winners, isLoading, error } = useQuery({
    queryKey: ['winners', from, to],
    queryFn: () => apiClient.getWinners(from, to),
  });

  const topThree = winners?.slice(0, 3) || [];
  const allProducts = winners || [];

  return (
    <div className="space-y-6">
      {/* Sub Navigation */}
      <ProfitOSSubNav />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Podium des produits</h1>
          <p className="text-sm text-ink-muted mt-1">
            Classement par score de performance globale
          </p>
        </div>
        <PeriodPicker />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-layer-2 rounded-lg p-6 animate-pulse"
              >
                <div className="h-24 bg-layer-3 rounded mb-4" />
                <div className="h-6 bg-layer-3 rounded w-3/4 mb-2" />
                <div className="h-4 bg-layer-3 rounded w-1/2" />
              </div>
            ))}
          </div>
          <div className="bg-layer-2 rounded-lg p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-layer-3 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-sm text-red-800 dark:text-red-200">
            Impossible de charger les données. Vérifiez votre connexion.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && allProducts.length === 0 && (
        <div className="bg-layer-2 rounded-lg p-12 text-center">
          <p className="text-ink-muted">
            Aucune donnée disponible pour cette période.
          </p>
        </div>
      )}

      {/* Podium - Top 3 */}
      {!isLoading && !error && topThree.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {/* 2nd place */}
            {topThree[1] && (
              <PodiumCard
                product={topThree[1]}
                rank={2}
                label="2ème"
                bgClass="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
              />
            )}
            {/* 1st place */}
            {topThree[0] && (
              <PodiumCard
                product={topThree[0]}
                rank={1}
                label="1er"
                bgClass="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20"
              />
            )}
            {/* 3rd place */}
            {topThree[2] && (
              <PodiumCard
                product={topThree[2]}
                rank={3}
                label="3ème"
                bgClass="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/10"
              />
            )}
          </div>

          {/* Ranked table */}
          <div className="bg-layer-2 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-ink-muted uppercase tracking-wider">
                      Rang
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-ink-muted uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-ink-muted uppercase tracking-wider">
                      Score
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-ink-muted uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-ink-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allProducts.map((product, index) => (
                    <ProductRow
                      key={product.productId}
                      product={product}
                      rank={index + 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PodiumCard({
  product,
  rank,
  label,
  bgClass,
}: {
  product: WinnerAnalysis;
  rank: number;
  label: string;
  bgClass: string;
}) {
  const heightClass = rank === 1 ? 'h-40' : rank === 2 ? 'h-32' : 'h-28';

  return (
    <div className={`${bgClass} rounded-lg p-6 ${heightClass} flex flex-col justify-between`}>
      <div className="text-center">
        <div className="text-3xl font-bold text-ink mb-1">{label}</div>
        <div className="text-sm text-ink-muted truncate">{product.productName}</div>
      </div>
      <div className="flex items-center justify-center">
        <ScoreRing score={product.score} size="lg" />
      </div>
      <div className="flex justify-center">
        <StatusBadge label={product.label} />
      </div>
    </div>
  );
}

function ProductRow({ product, rank }: { product: WinnerAnalysis; rank: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b border-border hover:bg-layer-3/50 transition-colors">
        <td className="py-4 px-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-layer-3 text-sm font-semibold text-ink">
            {rank}
          </div>
        </td>
        <td className="py-4 px-4">
          <div className="font-medium text-ink">{product.productName}</div>
          <div className="text-xs text-ink-muted">ID: {product.productId}</div>
        </td>
        <td className="py-4 px-4">
          <ScoreRing score={product.score} size="sm" />
        </td>
        <td className="py-4 px-4">
          <StatusBadge label={product.label} />
        </td>
        <td className="py-4 px-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-accent hover:text-accent-hover transition-colors"
          >
            {expanded ? 'Masquer' : 'Pourquoi ce score ?'}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-layer-3/30">
          <td colSpan={5} className="py-4 px-4">
            <ScoreBreakdown breakdown={product.breakdown} />
          </td>
        </tr>
      )}
    </>
  );
}

function ScoreRing({ score, size }: { score: number; size: 'sm' | 'lg' }) {
  const radius = size === 'lg' ? 36 : 20;
  const stroke = size === 'lg' ? 6 : 4;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const sizeClass = size === 'lg' ? 'w-20 h-20' : 'w-12 h-12';
  const textClass = size === 'lg' ? 'text-xl' : 'text-sm';

  // Color based on score
  const strokeColor =
    score >= 70
      ? 'stroke-green-500'
      : score >= 40
        ? 'stroke-yellow-500'
        : 'stroke-red-500';

  return (
    <div className={`relative ${sizeClass}`}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="stroke-layer-3"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className={strokeColor}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${textClass} font-bold text-ink`}>{score}</span>
      </div>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  const styles: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    Winner: {
      bg: 'bg-green-100 dark:bg-green-950/30',
      text: 'text-green-800 dark:text-green-200',
      border: 'border-green-200 dark:border-green-800',
    },
    'À surveiller': {
      bg: 'bg-yellow-100 dark:bg-yellow-950/30',
      text: 'text-yellow-800 dark:text-yellow-200',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
    'À couper': {
      bg: 'bg-red-100 dark:bg-red-950/30',
      text: 'text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-800',
    },
    'Données insuffisantes': {
      bg: 'bg-gray-100 dark:bg-gray-950/30',
      text: 'text-gray-800 dark:text-gray-200',
      border: 'border-gray-200 dark:border-gray-800',
    },
  };

  const style = styles[label] || styles['Données insuffisantes'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
    >
      {label}
    </span>
  );
}

function ScoreBreakdown({
  breakdown,
}: {
  breakdown: WinnerAnalysis['breakdown'];
}) {
  const components = [
    {
      label: 'Marge nette',
      score: breakdown.netMarginScore,
      weight: 40,
      description: 'Rentabilité après tous les coûts',
    },
    {
      label: 'Taux de livraison',
      score: breakdown.deliveryRateScore,
      weight: 25,
      description: 'Fiabilité des expéditions',
    },
    {
      label: 'ROAS',
      score: breakdown.roasScore,
      weight: 20,
      description: 'Retour sur investissement publicitaire',
    },
    {
      label: 'Tendance de volume',
      score: breakdown.volumeTrendScore,
      weight: 15,
      description: 'Évolution des ventes',
    },
  ];

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-ink">Décomposition du score</h4>
      <div className="grid grid-cols-2 gap-4">
        {components.map((component) => (
          <div key={component.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink">
                  {component.label}
                </div>
                <div className="text-xs text-ink-muted">
                  {component.description} • Poids: {component.weight}%
                </div>
              </div>
              <div className="text-lg font-bold text-ink">{component.score}</div>
            </div>
            <div className="h-2 bg-layer-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  component.score >= 70
                    ? 'bg-green-500'
                    : component.score >= 40
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
                style={{ width: `${component.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
