"use client";

import React from "react";
import {
  Calculator,
  ShoppingBag,
  Megaphone,
  Receipt,
  Trophy,
  Truck,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ReportType =
  | "summary"
  | "orders"
  | "adSpend"
  | "expenses"
  | "winners"
  | "cod"
  | "complete";

export interface ReportTypeItem {
  id: ReportType;
  title: string;
  description: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const REPORT_TYPES: ReportTypeItem[] = [
  {
    id: "summary",
    title: "Résumé P&L",
    description: "Cascade financière, marge nette, KPIs globaux et compte de résultat",
    badge: "Essentiel",
    icon: Calculator,
  },
  {
    id: "orders",
    title: "Commandes",
    description: "Grand livre détaillé des commandes, statut unitaire et clients",
    badge: "Opérations",
    icon: ShoppingBag,
  },
  {
    id: "adSpend",
    title: "Publicité",
    description: "Dépenses publicitaires par plateforme, campagnes et ROAS",
    badge: "Marketing",
    icon: Megaphone,
  },
  {
    id: "expenses",
    title: "Charges Fixes",
    description: "Dépenses d'exploitation, loyers, abonnements et coûts structurels",
    badge: "Finance",
    icon: Receipt,
  },
  {
    id: "winners",
    title: "Podium (Winners)",
    description: "Classement multi-facteurs, scores unitaires et rotation produit",
    badge: "Catalogue",
    icon: Trophy,
  },
  {
    id: "cod",
    title: "Trésorerie COD",
    description: "Encaissements transporteurs, bordereaux de virement et aging",
    badge: "Cash Flow",
    icon: Truck,
  },
  {
    id: "complete",
    title: "Rapport Complet",
    description: "Audit consolidé multi-onglets regroupant toutes les dimensions",
    badge: "Pack Global",
    icon: Layers,
  },
];

export interface ReportTypeCardGridProps {
  selectedType: ReportType;
  onSelectType: (type: ReportType) => void;
  className?: string;
}

export function ReportTypeCardGrid({
  selectedType,
  onSelectType,
  className = "",
}: ReportTypeCardGridProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
          Type de Rapport à Exporter
        </label>
        <span className="text-[11px] text-muted">
          {REPORT_TYPES.length} formats disponibles
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {REPORT_TYPES.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedType === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectType(item.id)}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between cursor-pointer select-none space-y-3 group",
                isSelected
                  ? "border-brand-lime bg-brand-lime/10 dark:bg-brand-lime/15 ring-2 ring-brand-lime/30 shadow-xs"
                  : "border-border bg-surface hover:bg-surface-subtle hover:border-border-subtle"
              )}
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div
                  className={cn(
                    "p-2 rounded-xl border transition-colors",
                    isSelected
                      ? "bg-brand-lime text-brand-lime-text border-brand-lime"
                      : "bg-surface-subtle border-border text-muted group-hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                </div>

                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full border",
                    isSelected
                      ? "bg-brand-lime/30 border-brand-lime/50 text-brand-lime-text font-bold"
                      : "bg-surface-subtle border-border text-muted"
                  )}
                >
                  {item.badge}
                </span>
              </div>

              <div>
                <h4
                  className={cn(
                    "text-sm font-bold tracking-tight mb-1",
                    isSelected ? "text-foreground" : "text-foreground"
                  )}
                >
                  {item.title}
                </h4>
                <p className="text-xs text-muted leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

