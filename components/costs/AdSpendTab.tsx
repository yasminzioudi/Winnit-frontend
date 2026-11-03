"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { AdSpendListResponse, AdSpendResponse } from "@/lib/api/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/hooks/useToast";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { Plus, Trash2, Megaphone, DollarSign } from "lucide-react";

export function AdSpendTab() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form states
  const [platform, setPlatform] = useState("facebook");
  const [campaignName, setCampaignName] = useState("");
  const [productId, setProductId] = useState("prd_001");
  const [spendTnd, setSpendTnd] = useState("100");
  const [periodStart, setPeriodStart] = useState(
    new Date(Date.now() - 7 * 86400000).toISOString().substring(0, 10)
  );
  const [periodEnd, setPeriodEnd] = useState(
    new Date().toISOString().substring(0, 10)
  );

  const adSpendQuery = useQuery({
    queryKey: queryKeys.adSpend.list(),
    queryFn: () => apiGet<AdSpendListResponse>("/ad-spend?limit=50"),
  });

  const adSpends = adSpendQuery.data?.data || [];

  const createMutation = useMutation({
    mutationFn: () => {
      const payload = {
        platform,
        campaignName: campaignName || `Campagne ${platform.toUpperCase()}`,
        productId,
        periodStart: new Date(periodStart).toISOString(),
        periodEnd: new Date(periodEnd).toISOString(),
        spendMillimes: Math.round(parseFloat(spendTnd) * 1000),
        currency: "TND",
        notes: "Saisie manuelle interface Profit OS",
      };
      return apiPost("/ad-spend", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adSpend.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      success("Dépense publicitaire enregistrée");
      setIsDrawerOpen(false);
      setCampaignName("");
    },
    onError: (err: Error) => {
      toastError(err.message || "Erreur lors de la création");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/ad-spend/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adSpend.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      success("Dépense supprimée");
    },
    onError: (err: Error) => {
      toastError(err.message || "Erreur lors de la suppression");
    },
  });

  const totalSpendMillimes = adSpends.reduce(
    (acc, s) => acc + s.spendMillimes,
    0
  );

  const getPlatformBadge = (plat: string) => {
    switch (plat.toLowerCase()) {
      case "facebook":
      case "meta":
        return <Badge variant="info">Meta / Facebook</Badge>;
      case "tiktok":
        return <Badge variant="default" className="bg-neutral-900 text-white">TikTok</Badge>;
      case "google":
        return <Badge variant="warning">Google Ads</Badge>;
      case "instagram":
        return <Badge variant="danger">Instagram</Badge>;
      default:
        return <Badge variant="default">{plat}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action & metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
            <span className="text-xs text-neutral-500 block">Total Dépenses Listées</span>
            <span className="text-xl font-bold tabular-nums text-foreground">
              {formatMoney(totalSpendMillimes / 1000)}
            </span>
          </div>
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <span className="text-xs text-neutral-500 block">Nombre d'entrées</span>
            <span className="text-xl font-bold tabular-nums text-foreground">
              {adSpends.length}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsDrawerOpen(true)}
          className="gap-2 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Ajouter une dépense pub
        </Button>
      </div>

      {/* Ad Spend Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-surface dark:bg-neutral-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="p-3.5 font-semibold">Plateforme</th>
              <th className="p-3.5 font-semibold">Nom Campagne</th>
              <th className="p-3.5 font-semibold">Produit</th>
              <th className="p-3.5 font-semibold">Période</th>
              <th className="p-3.5 font-semibold text-right">Montant Payé</th>
              <th className="p-3.5 font-semibold text-center w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {adSpends.map((spend) => (
              <tr key={spend._id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40">
                <td className="p-3.5">{getPlatformBadge(spend.platform)}</td>
                <td className="p-3.5 font-medium text-foreground">{spend.campaignName}</td>
                <td className="p-3.5 text-neutral-500">{spend.productId || "Général"}</td>
                <td className="p-3.5 text-neutral-400">
                  {formatDate(spend.periodStart)} → {formatDate(spend.periodEnd)}
                </td>
                <td className="p-3.5 text-right font-bold tabular-nums text-foreground">
                  {formatMoney(spend.spendMillimes / 1000)}
                </td>
                <td className="p-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Supprimer cette dépense publicitaire ?")) {
                        deleteMutation.mutate(spend._id);
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
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} title="Enregistrer une dépense pub">
        <div className="space-y-4 p-4 sm:p-6 pb-20">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Plateforme</label>
            <Select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              options={[
                { value: "facebook", label: "Meta / Facebook" },
                { value: "tiktok", label: "TikTok Ads" },
                { value: "google", label: "Google Ads" },
                { value: "instagram", label: "Instagram" },
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Nom de la Campagne</label>
            <Input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="ex. Acquisition Parfum Mars"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Produit rattaché</label>
            <Select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              options={[
                { value: "prd_001", label: "Aura d'Ambre Extrait (50ml)" },
                { value: "prd_002", label: "Aura d'Ambre Duo Bundle" },
                { value: "prd_003", label: "Lumina Obsidian Articulated Lamp" },
                { value: "prd_004", label: "Saddle Leather Travel Duffle" },
                { value: "prd_005", label: "Velvet Rose Night Serum" },
                { value: "prd_008", label: "Sahara Gold Cuff Bracelet" },
              ]}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Dépense (TND)</label>
            <Input
              type="number"
              step="1"
              value={spendTnd}
              onChange={(e) => setSpendTnd(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Date début</label>
              <Input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Date fin</label>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
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

