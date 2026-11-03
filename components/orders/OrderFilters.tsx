"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmée" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "refused", label: "Refusée" },
  { value: "cancelled", label: "Annulée" },
];

const COURIER_OPTIONS = [
  { value: "", label: "Tous les transporteurs" },
  { value: "yalidine", label: "Yalidine" },
  { value: "aramex", label: "Aramex" },
];

const GOV_OPTIONS = [
  { value: "", label: "Tous les gouvernorats" },
  { value: "Tunis", label: "Tunis" },
  { value: "Ariana", label: "Ariana" },
  { value: "Sousse", label: "Sousse" },
  { value: "Sfax", label: "Sfax" },
  { value: "Bizerte", label: "Bizerte" },
  { value: "Nabeul", label: "Nabeul" },
  { value: "Monastir", label: "Monastir" },
  { value: "Gabès", label: "Gabès" },
];

export function OrderFilters({ className = "" }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentCourier = searchParams.get("courier") || "";
  const currentGov = searchParams.get("governorate") || "";

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset cursor on filter change
    params.delete("cursor");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Debounced search input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== currentSearch) {
        updateFilter("search", searchTerm);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, currentSearch, updateFilter]);

  const hasActiveFilters = Boolean(
    currentSearch || currentStatus || currentCourier || currentGov
  );

  const clearFilters = () => {
    setSearchTerm("");
    router.push(window.location.pathname, { scroll: false });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {/* Search Input */}
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none z-10" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par n°, client, ville..."
            className="w-full pl-10"
          />
        </div>

        {/* Status Select */}
        <Select
          value={currentStatus}
          onChange={(e) => updateFilter("status", e.target.value)}
          options={STATUS_OPTIONS}
        />

        {/* Courier Select */}
        <Select
          value={currentCourier}
          onChange={(e) => updateFilter("courier", e.target.value)}
          options={COURIER_OPTIONS}
        />

        {/* Governorate Select */}
        <Select
          value={currentGov}
          onChange={(e) => updateFilter("governorate", e.target.value)}
          options={GOV_OPTIONS}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs text-neutral-500 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Filtres actifs
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs h-7 gap-1 text-danger hover:text-danger hover:bg-danger/10"
          >
            <X className="h-3 w-3" />
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}

