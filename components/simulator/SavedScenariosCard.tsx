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
import { useToast } from "@/hooks/useToast";
import type { Scenario } from "@/lib/api/types";
import { Bookmark, Trash2, ArrowUpRight, BarChart2, Plus } from "lucide-react";
import { formatMoney } from "@/lib/format/currency";

export interface SavedScenariosCardProps {
  scenarios: Scenario[];
  onLoadScenario: (scenario: Scenario) => void;
  onSaveScenario: (name: string, notes: string) => Promise<void>;
  onDeleteScenario: (id: string) => Promise<void>;
  isSaving?: boolean;
}

export function SavedScenariosCard({
  scenarios,
  onLoadScenario,
  onSaveScenario,
  onDeleteScenario,
  isSaving = false,
}: SavedScenariosCardProps) {
  const { success, error: toastError } = useToast();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [scenarioToDelete, setScenarioToDelete] = useState<Scenario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await onSaveScenario(name.trim(), notes.trim());
      success(`Scénario "${name.trim()}" enregistré avec succès !`);
      setName("");
      setNotes("");
    } catch (err) {
      toastError(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'enregistrement du scénario"
      );
    }
  };

  const handleConfirmDelete = async () => {
    if (!scenarioToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteScenario(scenarioToDelete._id);
      success(`Scénario "${scenarioToDelete.name}" supprimé.`);
      setSelectedIds((prev) => prev.filter((id) => id !== scenarioToDelete._id));
      setScenarioToDelete(null);
    } catch (err) {
      toastError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression du scénario"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectScenario = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const selectedScenarios = scenarios.filter((s) => selectedIds.includes(s._id));

  return (
    <div className="space-y-6">
      {/* Save Scenario Card */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-brand-lime-text bg-brand-lime p-0.5 rounded" />
          <h3 className="text-base font-semibold text-foreground">
            Enregistrer le Scénario Actuel
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Nom du scénario *
            </label>
            <input
              type="text"
              placeholder="Ex : Prix promo Ramadan 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-lime"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Notes (optionnel)
            </label>
            <input
              type="text"
              placeholder="Hypothèses, tests, canaux..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-xl text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-lime"
            />
          </div>

          <Button
            type="submit"
            variant="brand"
            isLoading={isSaving}
            disabled={!name.trim() || isSaving}
            className="w-full font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Enregistrer le scénario
          </Button>
        </form>
      </Card>

      {/* Saved Scenarios List */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              Scénarios Enregistrés
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 bg-surface-subtle border border-border rounded-full text-muted">
              {scenarios.length}
            </span>
          </div>

          {selectedIds.length > 0 && (
            <span className="text-xs font-medium text-brand-lime-text bg-brand-lime/20 px-2 py-0.5 rounded-full border border-brand-lime/40">
              {selectedIds.length}/3 sélectionnés
            </span>
          )}
        </div>

        {scenarios.length === 0 ? (
          <div className="text-center py-6 text-muted text-xs">
            Aucun scénario enregistré pour le moment. Enregistrez vos simulations pour les comparer.
          </div>
        ) : (
          <div className="space-y-2.5">
            {scenarios.map((sc) => {
              const isSelected = selectedIds.includes(sc._id);
              const priceTnd = sc.unitPriceMillimes / 1000;
              const cogsTnd = sc.unitCogsMillimes / 1000;
              const cpaTnd = sc.adCpaMillimes / 1000;

              return (
                <div
                  key={sc._id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "border-brand-lime bg-brand-lime/5 dark:bg-brand-lime/10"
                      : "border-border bg-surface-subtle/50 hover:bg-surface-subtle"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground truncate">
                          {sc.name}
                        </span>
                        {sc.targetMarginPercent && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border text-muted">
                            Marge {sc.targetMarginPercent}%
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted mt-1 font-mono">
                        <span>Prix: <strong className="text-foreground">{priceTnd.toFixed(2)} TND</strong></span>
                        <span>COGS: {cogsTnd.toFixed(2)} TND</span>
                        <span>CPA: {cpaTnd.toFixed(2)} TND</span>
                      </div>

                      {sc.notes && (
                        <p className="text-[11px] text-muted-foreground mt-1 truncate">
                          {sc.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Compare toggle */}
                      <button
                        type="button"
                        onClick={() => toggleSelectScenario(sc._id)}
                        disabled={!isSelected && selectedIds.length >= 3}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          isSelected
                            ? "bg-brand-lime text-brand-lime-text border-brand-lime font-bold"
                            : "bg-surface border-border text-muted hover:text-foreground disabled:opacity-40"
                        }`}
                        title="Comparer (jusqu'à 3)"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Load */}
                      <button
                        type="button"
                        onClick={() => {
                          onLoadScenario(sc);
                          success(`Scénario "${sc.name}" appliqué aux paramètres.`);
                        }}
                        className="p-1.5 rounded-lg border border-border bg-surface text-muted hover:text-foreground transition-colors"
                        title="Charger dans le simulateur"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setScenarioToDelete(sc)}
                        className="p-1.5 rounded-lg border border-border bg-surface text-muted hover:text-negative-red transition-colors"
                        title="Supprimer le scénario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Comparison Drawer / Card if scenarios are selected */}
      {selectedScenarios.length > 0 && (
        <Card className="p-5 sm:p-6 space-y-4 border-brand-lime/50 bg-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-lime-text bg-brand-lime p-0.5 rounded" />
              <h3 className="text-base font-semibold text-foreground">
                Comparaison de Scénarios ({selectedScenarios.length}/3)
              </h3>
            </div>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-muted hover:text-foreground underline"
            >
              Réinitialiser
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {selectedScenarios.map((sc) => {
              const price = sc.unitPriceMillimes / 1000;
              const cogs = sc.unitCogsMillimes / 1000;
              const ship = sc.shippingMillimes / 1000;
              const cpa = sc.adCpaMillimes / 1000;
              const grossProfit = price - cogs - ship - cpa;

              return (
                <div
                  key={sc._id}
                  className="p-4 rounded-xl border border-border bg-surface-subtle space-y-2 text-xs"
                >
                  <div className="font-semibold text-foreground truncate">
                    {sc.name}
                  </div>
                  <div className="space-y-1 font-mono text-muted">
                    <div className="flex justify-between">
                      <span>Prix :</span>
                      <strong className="text-foreground">{price.toFixed(2)} TND</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>COGS :</span>
                      <span>{cogs.toFixed(2)} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Livraison :</span>
                      <span>{ship.toFixed(2)} TND</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CPA :</span>
                      <span>{cpa.toFixed(2)} TND</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border">
                      <span className="font-sans">Marge brute :</span>
                      <span className={grossProfit >= 0 ? "text-positive-emerald font-bold" : "text-negative-red font-bold"}>
                        {formatMoney(grossProfit)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(scenarioToDelete)}
        onOpenChange={(open) => !open && setScenarioToDelete(null)}
      >
        <DialogContent onClose={() => setScenarioToDelete(null)}>
          <DialogHeader>
            <DialogTitle>Supprimer le scénario</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement le scénario &quot;{scenarioToDelete?.name}&quot; ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScenarioToDelete(null)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
