"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPatch, apiDelete } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/hooks/useToast";
import { formatMoney } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import type { OrderResponse, OrdersListResponse } from "@/lib/api/types";
import { StatusTimelineModal } from "./StatusTimelineModal";
import { Trash2, History, CheckCheck } from "lucide-react";

interface OrdersTableProps {
  orders: OrderResponse[];
  isLoading?: boolean;
}

const STATUS_SELECT_OPTIONS = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "refused", label: "Refusée" },
  { value: "cancelled", label: "Annulée" },
];

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const queryClient = useQueryClient();
  const { success, error: toastError, info } = useToast();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [timelineOrder, setTimelineOrder] = useState<OrderResponse | null>(null);

  // 1. Optimistic status change mutation
  const statusMutation = useMutation({
    mutationFn: ({ orderId, status, version }: { orderId: string; status: string; version: number }) =>
      apiPatch<OrderResponse>(`/orders/${orderId}/status`, { status, version }),
    onMutate: async ({ orderId, status }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.orders.all });

      // Snapshot previous data
      const previousData = queryClient.getQueryData<OrdersListResponse>(queryKeys.orders.all);

      // Optimistically update cache
      queryClient.setQueriesData<OrdersListResponse>(
        { queryKey: queryKeys.orders.all },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((o) =>
              o._id === orderId
                ? {
                    ...o,
                    status: status as OrderResponse['status'],
                    version: o.version + 1,
                  }
                : o
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (err: Error, _vars, context) => {
      // Rollback on failure
      if (context?.previousData) {
        queryClient.setQueriesData({ queryKey: queryKeys.orders.all }, context.previousData);
      }
      toastError(err.message || "Erreur lors de la mise à jour du statut", "Échec transition");
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      success(`Statut de ${updated.orderNumber} mis à jour avec succès`);
    },
  });

  // 2. Soft delete mutation with undo toast
  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => apiDelete(`/orders/${orderId}`),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      info("Commande supprimée", "Corbeille");
    },
    onError: (err: Error) => {
      toastError(err.message || "Erreur lors de la suppression");
    },
  });

  // 3. Bulk status change
  const bulkStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const selectedOrders = orders.filter((o) => selectedIds.includes(o._id));
      await Promise.all(
        selectedOrders.map((o) =>
          apiPatch(`/orders/${o._id}/status`, { status, version: o.version })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      success(`${selectedIds.length} commandes mises à jour`);
      setSelectedIds([]);
    },
    onError: (err: Error) => {
      toastError(err.message || "Erreur lors de la mise à jour groupée");
    },
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Bulk action toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-xl animate-in fade-in duration-150">
          <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <CheckCheck className="h-4 w-4" />
            {selectedIds.length} commande(s) sélectionnée(s)
          </span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 hidden sm:inline">Changer en:</span>
            <Button
              size="sm"
              variant="subtle"
              className="text-xs h-7"
              onClick={() => bulkStatusMutation.mutate({ status: "confirmed" })}
              disabled={bulkStatusMutation.isPending}
            >
              Confirmée
            </Button>
            <Button
              size="sm"
              variant="subtle"
              className="text-xs h-7"
              onClick={() => bulkStatusMutation.mutate({ status: "shipped" })}
              disabled={bulkStatusMutation.isPending}
            >
              Expédiée
            </Button>
            <Button
              size="sm"
              variant="subtle"
              className="text-xs h-7"
              onClick={() => bulkStatusMutation.mutate({ status: "delivered" })}
              disabled={bulkStatusMutation.isPending}
            >
              Livrée
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-7 text-neutral-400"
              onClick={() => setSelectedIds([])}
            >
              Désélectionner
            </Button>
          </div>
        </div>
      )}

      {/* Responsive table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-surface dark:bg-neutral-900 shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400">
            <tr>
              <th className="p-3.5 w-10">
                <input
                  type="checkbox"
                  checked={orders.length > 0 && selectedIds.length === orders.length}
                  onChange={toggleSelectAll}
                  className="rounded border-neutral-300 dark:border-neutral-700 text-primary cursor-pointer"
                  aria-label="Sélectionner tout"
                />
              </th>
              <th className="p-3.5 font-semibold">N° Commande & Date</th>
              <th className="p-3.5 font-semibold">Client & Région</th>
              <th className="p-3.5 font-semibold">Produit</th>
              <th className="p-3.5 font-semibold">Transporteur</th>
              <th className="p-3.5 font-semibold">Statut</th>
              <th className="p-3.5 font-semibold text-right">Net Réalisé</th>
              <th className="p-3.5 font-semibold text-center w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {orders.map((order) => {
              const isSelected = selectedIds.includes(order._id);
              const netTnd = order.netContributionMillimes / 1000;
              const isNetPositive = netTnd >= 0;

              return (
                <tr
                  key={order._id}
                  className={`hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors ${
                    isSelected ? "bg-primary/5 dark:bg-primary/10" : ""
                  }`}
                >
                  <td className="p-3.5">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(order._id)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-primary cursor-pointer"
                      aria-label={`Sélectionner ${order.orderNumber}`}
                    />
                  </td>

                  <td className="p-3.5">
                    <div className="font-semibold text-foreground">{order.orderNumber}</div>
                    <div className="text-[11px] text-neutral-400">
                      {formatDate(order.placedAt)}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="text-foreground font-medium">{order.customer.firstName}</div>
                    <div className="text-[11px] text-neutral-400">
                      {order.customer.city}, {order.customer.governorate}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <div className="text-foreground max-w-[200px] truncate" title={order.productNameSnapshot}>
                      {order.productNameSnapshot}
                    </div>
                    <div className="text-[11px] text-neutral-400 tabular-nums">
                      Qté: {order.quantity} • {formatMoney(order.unitPriceMillimes / 1000)}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <Badge variant={order.courier === "yalidine" ? "default" : "info"} className="capitalize">
                      {order.courier}
                    </Badge>
                  </td>

                  <td className="p-3.5">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        statusMutation.mutate({
                          orderId: order._id,
                          status: e.target.value,
                          version: order.version,
                        })
                      }
                      className="text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg px-2 py-1 font-medium cursor-pointer text-foreground focus:ring-1 focus:ring-primary outline-hidden"
                    >
                      {STATUS_SELECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-3.5 text-right font-bold tabular-nums">
                    <span className={isNetPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                      {formatMoney(netTnd, { showSign: true })}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setTimelineOrder(order)}
                        className="p-1.5 text-neutral-400 hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Historique des statuts"
                      >
                        <History className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Supprimer la commande ${order.orderNumber} ?`)) {
                            deleteMutation.mutate(order._id);
                          }
                        }}
                        className="p-1.5 text-neutral-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                        title="Supprimer la commande"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Timeline Modal */}
      <StatusTimelineModal
        order={timelineOrder}
        open={Boolean(timelineOrder)}
        onClose={() => setTimelineOrder(null)}
      />
    </div>
  );
}

