"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/profit-os/CountUp";
import { formatMoney } from "@/lib/format/currency";
import type { ReportType } from "./ReportTypeCardGrid";
import type {
  ProfitOSMetrics,
  CODAnalyticsResponse,
  WinnerAnalysis,
  ExpenseResponse,
  AdSpendResponse,
} from "@/lib/api/types";
import { Eye, DollarSign, TrendingUp, CheckCircle2, ShoppingBag, Megaphone, Receipt } from "lucide-react";

export interface ReportFiguresPreviewProps {
  reportType: ReportType;
  summary?: ProfitOSMetrics;
  cod?: CODAnalyticsResponse;
  winners?: WinnerAnalysis[];
  expenses?: ExpenseResponse[];
  adSpends?: AdSpendResponse[];
  ordersCount?: number;
  isLoading?: boolean;
}

export function ReportFiguresPreview({
  reportType,
  summary,
  cod,
  winners = [],
  expenses = [],
  adSpends = [],
  ordersCount = 0,
  isLoading = false,
}: ReportFiguresPreviewProps) {
  if (isLoading) {
    return (
      <Card className="p-5 sm:p-6 space-y-3">
        <div className="h-4 bg-surface-subtle rounded w-1/4 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-surface-subtle rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  // Derive figures based on reportType
  let previewItems: {
    label: string;
    value: number;
    formatter: (v: number) => string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    tone?: string;
  }[] = [];

  const grossRev = summary ? summary.waterfall.grossRevenueMillimes / 1000 : 0;
  const netContribution = summary ? summary.waterfall.netRealizedContributionMillimes / 1000 : 0;
  const netMargin = summary ? summary.expenses.netProfitMarginPercent : 0;
  const deliveryRate = summary ? summary.kpis.deliveryRatePercent : 0;

  if (reportType === "summary" || reportType === "complete") {
    previewItems = [
      {
        label: "Chiffre d'Affaires Brut",
        value: grossRev,
        formatter: (v) => formatMoney(v),
        icon: DollarSign,
        badge: `${summary?.kpis.totalOrdersCount || 0} commandes`,
      },
      {
        label: "Bénéfice Net Réalisé",
        value: netContribution,
        formatter: (v) => formatMoney(v),
        icon: TrendingUp,
        tone: netContribution >= 0 ? "text-positive-emerald" : "text-negative-red",
        badge: `${netMargin.toFixed(1)}% marge nette`,
      },
      {
        label: "Taux de Livraison",
        value: deliveryRate,
        formatter: (v) => `${v.toFixed(1)}%`,
        icon: CheckCircle2,
        badge: `${summary?.kpis.deliveredCount || 0} livrées`,
        tone: "text-positive-emerald",
      },
      {
        label: "Fonds COD Attendus",
        value: cod ? cod.summary.expectedCashCollectionsMillimes / 1000 : 0,
        formatter: (v) => formatMoney(v),
        icon: ShoppingBag,
        badge: "Encaissements transporteurs",
      },
    ];
  } else if (reportType === "orders") {
    previewItems = [
      {
        label: "Commandes au Grand Livre",
        value: summary?.kpis.totalOrdersCount || ordersCount,
        formatter: (v) => `${v} cdes`,
        icon: ShoppingBag,
        badge: "Volume total",
      },
      {
        label: "Commandes Livrées",
        value: summary?.kpis.deliveredCount || 0,
        formatter: (v) => `${v}`,
        icon: CheckCircle2,
        tone: "text-positive-emerald",
        badge: `${deliveryRate.toFixed(1)}% livrées`,
      },
      {
        label: "Commandes Refusées",
        value: summary?.kpis.refusedCount || 0,
        formatter: (v) => `${v}`,
        icon: TrendingUp,
        tone: "text-negative-red",
        badge: "Colis retournés",
      },
      {
        label: "Panier Moyen (AOV)",
        value: summary ? summary.kpis.averageOrderValueMillimes / 1000 : 0,
        formatter: (v) => formatMoney(v),
        icon: DollarSign,
        badge: "Moyenne par panier",
      },
    ];
  } else if (reportType === "adSpend") {
    const totalAdSpendTnd = adSpends.reduce(
      (sum, item) => sum + item.spendMillimes / 1000,
      0
    );
    previewItems = [
      {
        label: "Dépenses Publicitaires Totales",
        value: totalAdSpendTnd,
        formatter: (v) => formatMoney(v),
        icon: Megaphone,
        badge: "Sur la période",
      },
      {
        label: "Campagnes Actives",
        value: adSpends.length,
        formatter: (v) => `${v} campagnes`,
        icon: TrendingUp,
        badge: "Facebook, TikTok, etc.",
      },
    ];
  } else if (reportType === "expenses") {
    const totalExpensesTnd = expenses.reduce(
      (sum, item) => sum + item.amountMillimes / 1000,
      0
    );
    previewItems = [
      {
        label: "Total Charges Fixes",
        value: totalExpensesTnd,
        formatter: (v) => formatMoney(v),
        icon: Receipt,
        badge: "Frais d'exploitation",
      },
      {
        label: "Lignes de Charges",
        value: expenses.length,
        formatter: (v) => `${v} postes`,
        icon: DollarSign,
        badge: "Charges récurrentes",
      },
    ];
  } else if (reportType === "winners") {
    const topWinner = winners[0];
    previewItems = [
      {
        label: "Produits Analysés",
        value: winners.length,
        formatter: (v) => `${v} références`,
        icon: ShoppingBag,
        badge: "Catalogue actif",
      },
      {
        label: "Score Produit N°1",
        value: topWinner ? topWinner.score : 0,
        formatter: (v) => `${Math.round(v)}/100`,
        icon: TrendingUp,
        tone: "text-positive-emerald",
        badge: topWinner ? topWinner.productName : "Aucun",
      },
    ];
  } else if (reportType === "cod") {
    const expected = cod ? cod.summary.expectedCashCollectionsMillimes / 1000 : 0;
    const settled = cod ? cod.summary.bankWireSettledMillimes / 1000 : 0;
    const pending = cod ? cod.summary.pendingCourierPayoutsMillimes / 1000 : 0;
    previewItems = [
      {
        label: "Encaissements Attendus",
        value: expected,
        formatter: (v) => formatMoney(v),
        icon: ShoppingBag,
        badge: "Total livraisons COD",
      },
      {
        label: "Virements Bancaires Reçus",
        value: settled,
        formatter: (v) => formatMoney(v),
        icon: CheckCircle2,
        tone: "text-positive-emerald",
        badge: "Fonds réconciliés",
      },
      {
        label: "En Attente de Virement",
        value: pending,
        formatter: (v) => formatMoney(v),
        icon: TrendingUp,
        tone: pending > 0 ? "text-warning-amber" : "text-muted",
        badge: "Chez les transporteurs",
      },
    ];
  }

  return (
    <Card className="p-5 sm:p-6 space-y-4 border-border">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4 text-muted" />
        <h3 className="text-sm font-semibold text-foreground">
          Aperçu des Chiffres Clés avant Exportation
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {previewItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-border bg-surface-subtle space-y-1.5"
            >
              <div className="flex items-center justify-between text-muted text-xs">
                <span className="truncate">{item.label}</span>
                <Icon className="w-3.5 h-3.5 shrink-0 ml-1" />
              </div>

              <div
                className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${
                  item.tone || "text-foreground"
                }`}
              >
                <CountUp value={item.value} formatter={item.formatter} />
              </div>

              {item.badge && (
                <div className="text-[11px] font-mono text-muted truncate">
                  {item.badge}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
