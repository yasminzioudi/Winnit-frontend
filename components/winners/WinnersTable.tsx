"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { ScoreRing } from "./ScoreRing";
import { StatusBadge } from "./StatusBadge";
import { formatMoney } from "@/lib/format/currency";
import type { WinnerAnalysis } from "@/lib/api/types";
import { Info, Trophy } from "lucide-react";

export interface WinnersTableProps {
  winners: WinnerAnalysis[];
  onSelectProduct: (product: WinnerAnalysis) => void;
  isLoading?: boolean;
}

export function WinnersTable({
  winners,
  onSelectProduct,
  isLoading = false,
}: WinnersTableProps) {
  if (isLoading) {
    return (
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="h-5 bg-surface-subtle rounded w-1/4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-surface-subtle rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  if (!winners || winners.length === 0) {
    return (
      <Card className="p-8 text-center space-y-2">
        <Trophy className="w-8 h-8 text-muted mx-auto" />
        <p className="text-sm font-semibold text-foreground">
          Aucun produit classé pour cette période
        </p>
        <p className="text-xs text-muted">
          Les scores de performance apparaîtront dès que des commandes seront livrées.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Classement Complet du Catalogue
          </h3>
          <p className="text-xs text-muted">
            {winners.length} produits évalués selon leur rentabilité réelle et vélocité
          </p>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-subtle border-b border-border text-muted font-mono uppercase text-[10px]">
            <tr>
              <th className="p-3.5 font-semibold text-center w-14">Rang</th>
              <th className="p-3.5 font-semibold">Produit</th>
              <th className="p-3.5 font-semibold text-center">Score Global</th>
              <th className="p-3.5 font-semibold">Statut</th>
              <th className="p-3.5 font-semibold text-right">Chiffre d&apos;Affaires</th>
              <th className="p-3.5 font-semibold text-right">Commandes</th>
              <th className="p-3.5 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {winners.map((product, idx) => (
              <tr
                key={product.productId}
                className="hover:bg-surface-subtle/70 transition-colors"
              >
                <td className="p-3.5 text-center">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs font-bold ${
                      idx === 0
                        ? "bg-amber-400 text-amber-950 shadow-xs"
                        : idx === 1
                        ? "bg-neutral-300 text-neutral-800"
                        : idx === 2
                        ? "bg-orange-300 text-orange-950"
                        : "bg-surface-subtle text-muted border border-border"
                    }`}
                  >
                    {idx + 1}
                  </span>
                </td>

                <td className="p-3.5">
                  <div className="font-semibold text-foreground text-sm">
                    {product.productName}
                  </div>
                </td>

                <td className="p-3.5 text-center">
                  <ScoreRing score={product.score} size="sm" />
                </td>

                <td className="p-3.5">
                  <StatusBadge label={product.label} />
                </td>

                <td className="p-3.5 text-right font-mono font-bold tabular-nums text-foreground">
                  {formatMoney(product.grossRevenueMillimes / 1000)}
                </td>

                <td className="p-3.5 text-right font-mono text-muted">
                  {product.totalOrders} ({product.deliveredOrders} livrées)
                </td>

                <td className="p-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-subtle hover:border-brand-lime transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-muted" />
                    <span>Pourquoi ce score ?</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View (Strictly no horizontal overflow) */}
      <div className="md:hidden space-y-3">
        {winners.map((product, idx) => (
          <div
            key={product.productId}
            className="p-4 rounded-xl border border-border bg-surface-subtle space-y-3 text-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center font-mono font-bold text-foreground text-xs shrink-0">
                  {idx + 1}
                </span>
                <span className="font-bold text-foreground truncate text-sm">
                  {product.productName}
                </span>
              </div>
              <ScoreRing score={product.score} size="sm" className="shrink-0" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <StatusBadge label={product.label} />
              <span className="font-mono font-bold tabular-nums text-foreground text-xs">
                {formatMoney(product.grossRevenueMillimes / 1000)}
              </span>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-muted text-[11px] font-mono">
                {product.totalOrders} cdes ({product.deliveredOrders} livrées)
              </span>

              <button
                type="button"
                onClick={() => onSelectProduct(product)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-lime-text hover:underline"
              >
                <Info className="w-3 h-3 text-muted" />
                Pourquoi ce score ?
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
