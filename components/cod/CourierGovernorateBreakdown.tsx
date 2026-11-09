"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Truck, MapPin } from "lucide-react";
import { formatMoney } from "@/lib/format/currency";
import type { CourierAnalyticsItem, GovernorateAnalyticsItem } from "@/lib/api/types";

export interface CourierGovernorateBreakdownProps {
  couriers?: CourierAnalyticsItem[];
  governorates?: GovernorateAnalyticsItem[];
  isLoading?: boolean;
}

export function CourierGovernorateBreakdown({
  couriers = [],
  governorates = [],
  isLoading = false,
}: CourierGovernorateBreakdownProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="h-5 bg-surface-subtle dark:bg-neutral-800 rounded w-1/3 animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-surface-subtle dark:bg-neutral-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </Card>
        <Card className="p-5 sm:p-6 space-y-4">
          <div className="h-5 bg-surface-subtle dark:bg-neutral-800 rounded w-1/3 animate-pulse" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-surface-subtle dark:bg-neutral-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // Sort governorates by gross revenue descending, top 6
  const topGovernorates = [...governorates]
    .sort((a, b) => b.grossRevenueMillimes - a.grossRevenueMillimes)
    .slice(0, 6);

  const maxGovRevenue = Math.max(
    ...topGovernorates.map((g) => g.grossRevenueMillimes),
    1
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Courier Performance Breakdown */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-foreground">
            Performance Transporteurs
          </h3>
        </div>

        {couriers.length === 0 ? (
          <p className="text-xs text-muted py-6 text-center">
            Aucun transporteur actif sur cette période.
          </p>
        ) : (
          <div className="space-y-3">
            {couriers.map((c) => {
              const totalOrders = c.deliveredOrders + c.refusedOrders;
              const deliveryRate =
                totalOrders > 0
                  ? Math.round((c.deliveredOrders / totalOrders) * 100)
                  : 0;

              return (
                <div
                  key={c.courier}
                  className="p-3.5 rounded-xl border border-border bg-surface-subtle space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground capitalize">
                      {c.courier}
                    </span>
                    <span className="text-xs font-mono font-semibold text-positive-emerald">
                      Taux: {deliveryRate}%
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono text-muted">
                    <div>
                      <span>Livrées: </span>
                      <strong className="text-foreground">{c.deliveredOrders}</strong>
                    </div>
                    <div>
                      <span>Refusées: </span>
                      <strong className="text-negative-red">{c.refusedOrders}</strong>
                    </div>
                    <div className="text-right">
                      <span>En attente: </span>
                      <strong className="text-foreground">
                        {formatMoney(c.pendingPayoutsMillimes / 1000)}
                      </strong>
                    </div>
                  </div>

                  {/* Visual Delivery Bar */}
                  <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-brand-lime transition-all duration-300"
                      style={{ width: `${deliveryRate}%` }}
                    />
                    <div
                      className="h-full bg-negative-red/70 transition-all duration-300"
                      style={{ width: `${100 - deliveryRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Governorate Distribution Breakdown */}
      <Card className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-foreground">
            Top Gouvernorats (Ventes & Livraison)
          </h3>
        </div>

        {topGovernorates.length === 0 ? (
          <p className="text-xs text-muted py-6 text-center">
            Aucune donnée régionale disponible.
          </p>
        ) : (
          <div className="space-y-3">
            {topGovernorates.map((g) => {
              const totalOrders = g.ordersCount || g.deliveredOrders + g.refusedOrders;
              const deliveryRate =
                totalOrders > 0
                  ? Math.round((g.deliveredOrders / totalOrders) * 100)
                  : 0;
              const revShare = Math.min(
                100,
                Math.round((g.grossRevenueMillimes / maxGovRevenue) * 100)
              );

              return (
                <div
                  key={g.governorate}
                  className="p-3.5 rounded-xl border border-border bg-surface-subtle space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground capitalize">
                      {g.governorate}
                    </span>
                    <span className="font-mono text-muted">
                      {formatMoney(g.grossRevenueMillimes / 1000)} •{" "}
                      <strong className="text-foreground">{deliveryRate}% livrées</strong>
                    </span>
                  </div>

                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-lime transition-all duration-300 rounded-full"
                      style={{ width: `${revShare}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
