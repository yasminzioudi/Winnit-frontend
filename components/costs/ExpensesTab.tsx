"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { ExpensesListResponse } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/hooks/useToast";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { Plus, Trash2, Calendar, Receipt, Building, Layers } from "lucide-react";

const CATEGORIES = [
  { value: "rent", label: "Loyer & Entrepôt", icon: Building },
  { value: "salary", label: "Salaires & Équipe", icon: Layers },
  { value: "logistics", label: "Fournitures & Emballages", icon: Receipt },
  { value: "marketing", label: "Outils Marketing & SaaS", icon: Receipt },
  { value: "utilities", label: "Électricité & Internet", icon: Receipt },
  { value: "other", label: "Autre charge fixe", icon: Receipt },
];

export function ExpensesTab() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form states
  const [category, setCategory] = useState("rent");
  const [description, setDescription] = useState("");
  const [amountTnd, setAmountTnd] = useState("500");
  const [periodType, setPeriodType] = useState<"monthly" | "one-time">("monthly");
  const [startDate, setStartDate] = useState(() =>
    new Date(Date.now() - 30 * 86400000).toISOString().substring(0, 10)
  );

  const expensesQuery = useQuery({
    queryKey: queryKeys.expenses.list(),
    queryFn: () => apiGet<ExpensesListResponse>("/expenses?limit=50"),
  });

  const expenses = expensesQuery.data?.data || [];

  const createMutation = useMutation({
    mutationFn: () => {
      const payload = {
        category,
        description: description || `Charge fixe ${category}`,
        amountMillimes: Math.round(parseFloat(amountTnd) * 1000),
        periodType,
        startDate: new Date(startDate).toISOString(),
      };
      return apiPost("/expenses", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      success("Charge enregistrée avec succès");
      setIsDrawerOpen(false);
      setDescription("");
    },
    onError: (err: Error) => {
      toastError(err.message || "Erreur lors de la création");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/expenses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      success("Charge supprimée");
    },
    onError: (err: Error) => {
      toastError(err.message || "Erreur lors de la suppression");
    },
  });

  const monthlyTotalMillimes = expenses
    .filter((e) => e.periodType === "monthly")
    .reduce((acc, e) => acc + e.amountMillimes, 0);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "rent":
        return <Badge variant="info">Loyer</Badge>;
      case "salary":
        return <Badge variant="emerald">Salaire</Badge>;
      case "marketing":
        return <Badge variant="warning">Marketing</Badge>;
      case "logistics":
        return <Badge variant="default">Logistique</Badge>;
      case "utilities":
        return <Badge variant="default">Services</Badge>;
      default:
        return <Badge variant="default">{cat}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top summary & action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <span className="text-xs text-neutral-500 block">Total Mensuel Fixe</span>
            <span className="text-xl font-bold tabular-nums text-foreground">
              {formatMoney(monthlyTotalMillimes / 1000)} / mois
            </span>
          </div>

          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <span className="text-xs text-neutral-500 block">Nombre de Lignes</span>
            <span className="text-xl font-bold tabular-nums text-foreground">
              {expenses.length}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsDrawerOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Ajouter une charge fixe
        </Button>
      </div>

      {/* Monthly expansion preview box */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Expansion Mensuelle pour la période active (30 jours)
          </span>
          <span className="text-xs font-bold tabular-nums text-primary">
            {formatMoney(monthlyTotalMillimes / 1000)} imputés
          </span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Les charges récurrentes mensuelles sont proratisées ou imputées par mois selon la formule domain WINNIT OS (`expenseTotalForPeriod`).
        </p>
      </div>

      {/* Expenses Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-surface dark:bg-neutral-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="p-3.5 font-semibold">Catégorie</th>
              <th className="p-3.5 font-semibold">Description</th>
              <th className="p-3.5 font-semibold">Récurrence</th>
              <th className="p-3.5 font-semibold">Date de début</th>
              <th className="p-3.5 font-semibold text-right">Montant</th>
              <th className="p-3.5 font-semibold text-center w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {expenses.map((exp) => (
              <tr key={exp._id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                <td className="p-3.5">{getCategoryBadge(exp.category)}</td>
                <td className="p-3.5 font-medium text-foreground">{exp.description}</td>
                <td className="p-3.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    {exp.periodType === "monthly" ? "Mensuel" : "Ponctuel"}
                  </span>
                </td>
                <td className="p-3.5 text-neutral-400">{formatDate(exp.startDate)}</td>
                <td className="p-3.5 text-right font-bold tabular-nums text-foreground">
                  {formatMoney(exp.amountMillimes / 1000)}
                </td>
                <td className="p-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Supprimer cette dépense ?")) {
                        deleteMutation.mutate(exp._id);
                      }
                    }}
                    className="p-1.5 text-neutral-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        title="Ajouter une charge fixe"
      >
        <div className="space-y-4 p-4 sm:p-6 pb-20">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Catégorie</label>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={CATEGORIES}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Description</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ex. Loyer bureau La Marsa"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Type de période</label>
            <Select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as "monthly" | "one-time")}
              options={[
                { value: "monthly", label: "Mensuel récurrent" },
                { value: "one-time", label: "Dépense ponctuelle" },
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Montant (TND)</label>
            <Input
              type="number"
              step="1"
              value={amountTnd}
              onChange={(e) => setAmountTnd(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Date d&apos;effet</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button variant="ghost" onClick={() => setIsDrawerOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => createMutation.mutate()}
              isLoading={createMutation.isPending}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

