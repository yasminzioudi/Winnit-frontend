"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { OrdersListResponse } from "@/lib/api/types";
import { ProfitOSSubNav } from "@/components/profit-os/SubNav";
import { OrderFilters } from "@/components/orders/OrderFilters";
import { OrdersTable } from "@/components/orders/OrdersTable";
import { CreateOrderDrawer } from "@/components/orders/CreateOrderDrawer";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Plus, ShoppingBag } from "lucide-react";

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const status = searchParams.get("status") || undefined;
  const courier = searchParams.get("courier") || undefined;
  const governorate = searchParams.get("governorate") || undefined;
  const search = searchParams.get("search") || undefined;
  const cursor = searchParams.get("cursor") || undefined;

  // Build query string
  const queryParams = new URLSearchParams();
  if (status) queryParams.set("status", status);
  if (courier) queryParams.set("courier", courier);
  if (governorate) queryParams.set("governorate", governorate);
  if (search) queryParams.set("search", search);
  if (cursor) queryParams.set("cursor", cursor);
  queryParams.set("limit", "50");

  const ordersQuery = useQuery({
    queryKey: queryKeys.orders.list({ status, courier, governorate, search, cursor }),
    queryFn: () => apiGet<OrdersListResponse>(`/orders?${queryParams.toString()}`),
  });

  const orders = ordersQuery.data?.data || [];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Gestion des Commandes
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Grand livre des commandes, calcul unitaire net et transitions de statuts
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsDrawerOpen(true)}
          className="gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Nouvelle Commande
        </Button>
      </div>

      {/* Subnav */}
      <ProfitOSSubNav />

      {/* Filters */}
      <OrderFilters />

      {/* Main Content */}
      {ordersQuery.isError ? (
        <ErrorState
          title="Erreur lors du chargement des commandes"
          message={ordersQuery.error instanceof Error ? ordersQuery.error.message : undefined}
          onRetry={() => ordersQuery.refetch()}
        />
      ) : !ordersQuery.isLoading && orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Aucune commande trouvée"
          description="Aucune commande ne correspond à vos filtres actuels ou la base est vide."
          actionLabel="Créer une commande"
          onAction={() => setIsDrawerOpen(true)}
        />
      ) : (
        <OrdersTable orders={orders} isLoading={ordersQuery.isLoading} />
      )}

      {/* Create Order Drawer */}
      <CreateOrderDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
          <div className="h-64 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  );
}

