"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { ScoreRing } from "./ScoreRing";
import { StatusBadge } from "./StatusBadge";
import { formatMoney } from "@/lib/format/currency";
import type { WinnerAnalysis } from "@/lib/api/types";
import { Crown, Medal, Award, Info } from "lucide-react";

export interface WinnersPodiumProps {
  winners: WinnerAnalysis[];
  onSelectProduct: (product: WinnerAnalysis) => void;
}

export function WinnersPodium({ winners, onSelectProduct }: WinnersPodiumProps) {
  if (!winners || winners.length === 0) return null;

  const first = winners[0];
  const second = winners[1];
  const third = winners[2];

  // Podium order: [Second (Silver), First (Gold), Third (Bronze)]
  const podiumSpots = [
    {
      product: second,
      rank: 2,
      pedestalHeight: "h-28 sm:h-36",
      pedestalBg: "bg-neutral-200/70 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-700",
      accentBorder: "border-neutral-300 dark:border-neutral-700",
      badgeText: "2ème Place",
      badgeColor: "bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
      icon: Medal,
      iconColor: "text-neutral-400",
      glow: "",
    },
    {
      product: first,
      rank: 1,
      pedestalHeight: "h-40 sm:h-48",
      pedestalBg: "bg-gradient-to-b from-amber-100 to-amber-200/80 dark:from-amber-950/40 dark:to-amber-900/40 border-amber-300 dark:border-amber-700/60",
      accentBorder: "border-amber-400 dark:border-amber-600 shadow-md",
      badgeText: "1ère Place (Leader)",
      badgeColor: "bg-amber-400 text-amber-950 font-bold shadow-xs",
      icon: Crown,
      iconColor: "text-amber-500",
      glow: "ring-2 ring-amber-400/30",
    },
    {
      product: third,
      rank: 3,
      pedestalHeight: "h-20 sm:h-28",
      pedestalBg: "bg-orange-100/70 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/60",
      accentBorder: "border-orange-300 dark:border-orange-800",
      badgeText: "3ème Place",
      badgeColor: "bg-orange-200/80 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200",
      icon: Award,
      iconColor: "text-amber-700 dark:text-amber-600",
      glow: "",
    },
  ];

  return (
    <Card className="p-4 sm:p-6 space-y-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-foreground">
            Podium des Meilleurs Produits
          </h2>
          <p className="text-xs text-muted">
            Top 3 basé sur le score multidimensionnel (Marge, Livraison, ROAS, Volume)
          </p>
        </div>
      </div>

      {/* Podium Display (All 3 aligned at the baseline) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 sm:pt-6">
        {podiumSpots.map((spot) => {
          const { product, rank, pedestalHeight, pedestalBg, badgeText, badgeColor, icon: Icon, iconColor, glow } = spot;
          if (!product) {
            return (
              <div key={rank} className="flex flex-col items-center justify-end">
                <div className={`w-full ${pedestalHeight} rounded-t-2xl border border-dashed border-border bg-surface-subtle flex items-center justify-center text-xs text-muted font-mono`}>
                  {rank}
                </div>
              </div>
            );
          }

          return (
            <div
              key={product.productId}
              className="flex flex-col items-center justify-end group cursor-pointer"
              onClick={() => onSelectProduct(product)}
            >
              {/* Product Info Card floating above the pedestal */}
              <div
                className={`w-full p-3 sm:p-4 rounded-2xl bg-surface border border-border shadow-xs hover:border-brand-lime transition-all duration-200 flex flex-col items-center text-center space-y-2 mb-2 ${glow}`}
              >
                {/* Rank Badge */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-semibold ${badgeColor}`}>
                  <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                  <span className="hidden sm:inline">{badgeText}</span>
                  <span className="sm:hidden">{rank}e</span>
                </span>

                {/* Clean Product Name (No UUID) */}
                <h3 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-full" title={product.productName}>
                  {product.productName}
                </h3>

                {/* Score Ring */}
                <div className="py-1">
                  <ScoreRing score={product.score} size={rank === 1 ? "md" : "sm"} />
                </div>

                {/* Status Badge */}
                <StatusBadge label={product.label} className="scale-90 sm:scale-100" />

                {/* Revenue */}
                <div className="text-[11px] font-mono text-muted truncate">
                  {formatMoney(product.grossRevenueMillimes / 1000)}
                </div>

                {/* Score breakdown trigger button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProduct(product);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-lime-text hover:text-foreground hover:underline pt-1 transition-colors"
                >
                  <Info className="w-3 h-3 text-muted" />
                  <span className="hidden sm:inline">Pourquoi ce score ?</span>
                  <span className="sm:hidden">Détails</span>
                </button>
              </div>

              {/* Physical Aligned Pedestal Block */}
              <div
                className={`w-full ${pedestalHeight} rounded-t-2xl border-t border-x ${pedestalBg} flex flex-col items-center justify-center select-none shadow-xs transition-transform group-hover:scale-[1.01]`}
              >
                <span className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-foreground/40">
                  {rank}
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-muted uppercase tracking-widest mt-0.5">
                  Rang
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

