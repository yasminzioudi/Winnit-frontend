"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import type { SettlementResponse } from "@/lib/api/types";
import { Banknote, CheckCircle2, Clock, RefreshCw } from "lucide-react";

export interface SettlementsListProps {
  settlements: SettlementResponse[];
  isLoading?: boolean;
  onReconcile: () => Promise<void>;
  isReconciling?: boolean;
}

export function SettlementsList({
  settlements = [],
  isLoading = false,
  onReconcile,
  isReconciling = false,
}: SettlementsListProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const pendingCount = settlements.filter((s) => s.status === "pending").length;

  const handleConfirmReconcile = async () => {
    setIsConfirmOpen(false);
    await onReconcile();
  };

  return (
    <Card className="p-5 sm:p-6 space-y-4">
      {/* Header & Reconcile Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-muted" />
            <h3 className="text-base font-semibold text-foreground">
              Bordereaux de Règlement Transporteurs
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-subtle border border-border text-muted">
              {settlements.length}
            </span>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Historique des encaissements COD et statut de réconciliation bancaire
          </p>
        </div>

        <Button
          variant="brand"
          size="sm"
          disabled={pendingCount === 0 || isReconciling}
          isLoading={isReconciling}
          onClick={() => setIsConfirmOpen(true)}
          className="gap-2 font-bold shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReconciling ? "animate-spin" : ""}`} />
          Réconcilier ({pendingCount} en attente)
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 bg-surface-subtle rounded-xl animate-pulse" />
          ))}
        </div>
      ) : settlements.length === 0 ? (
        <div className="text-center py-10 text-muted text-xs">
          Aucun bordereau de règlement trouvé pour cette période.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-subtle border-b border-border text-muted uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3.5 font-semibold">Transporteur</th>
                  <th className="p-3.5 font-semibold">Date de Règlement</th>
                  <th className="p-3.5 font-semibold text-right">Montant Total</th>
                  <th className="p-3.5 font-semibold">Nb Commandes</th>
                  <th className="p-3.5 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {settlements.map((s) => (
                  <tr
                    key={s._id}
                    className="hover:bg-surface-subtle/60 transition-colors"
                  >
                    <td className="p-3.5 font-bold text-foreground capitalize">
                      {s.courier}
                    </td>
                    <td className="p-3.5 text-muted font-mono">
                      {formatDate(s.settlementDate)}
                    </td>
                    <td className="p-3.5 text-right font-bold tabular-nums text-foreground">
                      {formatMoney(s.totalAmountMillimes / 1000)}
                    </td>
                    <td className="p-3.5 text-muted font-mono">
                      {s.orderIds ? s.orderIds.length : 0} commandes
                    </td>
                    <td className="p-3.5">
                      {s.status === "settled" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-positive-mint text-positive-emerald border border-positive-border">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Réglé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning-cream text-warning-amber border border-warning-border">
                          <Clock className="w-3.5 h-3.5" />
                          En attente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View (Zero horizontal scroll) */}
          <div className="md:hidden space-y-3">
            {settlements.map((s) => (
              <div
                key={s._id}
                className="p-3.5 rounded-xl border border-border bg-surface-subtle space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground capitalize text-sm">
                    {s.courier}
                  </span>
                  {s.status === "settled" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-positive-mint text-positive-emerald border border-positive-border">
                      <CheckCircle2 className="w-3 h-3" />
                      Réglé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-warning-cream text-warning-amber border border-warning-border">
                      <Clock className="w-3 h-3" />
                      En attente
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between font-mono text-muted text-[11px]">
                  <span>{formatDate(s.settlementDate)}</span>
                  <span>{s.orderIds ? s.orderIds.length : 0} commandes</span>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-muted text-[11px]">Montant :</span>
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    {formatMoney(s.totalAmountMillimes / 1000)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent onClose={() => setIsConfirmOpen(false)}>
          <DialogHeader>
            <DialogTitle>Confirmer la réconciliation</DialogTitle>
            <DialogDescription>
              Voulez-vous réconcilier les {pendingCount} règlements actuellement en attente ? Les montants correspondants seront marqués comme virés.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
            >
              Annuler
            </Button>
            <Button
              variant="brand"
              onClick={handleConfirmReconcile}
              isLoading={isReconciling}
              className="font-bold"
            >
              Confirmer la réconciliation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

