import React from "react";
import Link from "next/link";
import {
  Package,
  Calendar,
  Calculator,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { formatMoney } from "@/lib/format/currency";
import type { OrderItem } from "@/lib/finance/types";
import { calculateOrderNetContribution } from "@/lib/finance/profit";
import { TrialReminderBanner } from "@/components/dashboard/TrialReminderBanner";

// Seed sample orders matching Screenshot 2
const RECENT_ORDERS: OrderItem[] = [
  {
    id: "ord-9841",
    orderNumber: "ORD-9841",
    customerName: "Yassine M.",
    city: "Tunis / Marsa",
    productName: "Aura d'Ambre Extrait (50ml)",
    salePrice: 129,
    cogs: 28,
    shipping: 7,
    adCpa: 21.4,
    status: "delivered",
    createdAt: "2026-10-26T10:00:00Z",
  },
  {
    id: "ord-9840",
    orderNumber: "ORD-9840",
    customerName: "Sarra B.",
    city: "Sousse",
    productName: "Aura d'Ambre Extrait (50ml)",
    salePrice: 129,
    cogs: 28,
    shipping: 8,
    adCpa: 21.4,
    status: "delivered",
    createdAt: "2026-10-26T09:30:00Z",
  },
  {
    id: "ord-9839",
    orderNumber: "ORD-9839",
    customerName: "Karim T.",
    city: "Sfax",
    productName: "Lumina Obsidian Articulated Desk Lamp",
    salePrice: 249,
    cogs: 65,
    shipping: 12,
    adCpa: 38,
    courierFee: 3.5,
    status: "shipped",
    createdAt: "2026-10-26T08:15:00Z",
  },
  {
    id: "ord-9838",
    orderNumber: "ORD-9838",
    customerName: "Amine K.",
    city: "Bizerte",
    productName: "Aura d'Ambre Extrait (50ml)",
    salePrice: 129,
    cogs: 28,
    shipping: 8,
    adCpa: 21.4,
    status: "refused",
    createdAt: "2026-10-25T14:20:00Z",
  },
  {
    id: "ord-9837",
    orderNumber: "ORD-9837",
    customerName: "Nadia F.",
    city: "Nabeul",
    productName: "Aura d'Ambre Duo Bundle",
    salePrice: 229,
    cogs: 52,
    shipping: 7,
    adCpa: 26,
    status: "confirmed",
    createdAt: "2026-10-25T11:00:00Z",
  },
  {
    id: "ord-9836",
    orderNumber: "ORD-9836",
    customerName: "Mehdi Z.",
    city: "Tunis / Ennasr",
    productName: "Saddle Leather Travel Duffle",
    salePrice: 320,
    cogs: 98,
    shipping: 10,
    adCpa: 45,
    courierFee: 5.2,
    status: "delivered",
    createdAt: "2026-10-24T16:45:00Z",
  },
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Trial reminder banner if not activated */}
      <TrialReminderBanner />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Vue d&apos;ensemble
            </h1>
            <Badge variant="emerald" size="sm" dot>
              Direct COD
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-muted">
            Maison Ambre Parfums · Suivi temps réel des encaissements et de la marge nette.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/profit-os">
            <Button variant="primary" size="md" className="gap-2">
              <Calculator className="w-4 h-4 text-brand-lime" />
              <span>Ouvrir Profit OS</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Summary KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Tile 1: Gross Revenue */}
        <div className="p-4 md:p-5 rounded-2xl border border-border bg-surface shadow-2xs">
          <span className="text-[10px] md:text-xs font-mono uppercase text-muted tracking-wider block mb-1">
            1. Chiffre d&apos;Affaires Brut
          </span>
          <div className="text-xl md:text-2xl font-mono font-bold text-foreground">
            {formatMoney(16420)}
          </div>
          <span className="text-[10px] font-mono text-muted mt-1 block">
            Derniers 30 jours
          </span>
        </div>

        {/* Tile 2: True Net Profit (Highlighted) */}
        <div className="p-4 md:p-5 rounded-2xl border border-positive-border bg-positive-mint/60 shadow-2xs">
          <span className="text-[10px] md:text-xs font-mono uppercase text-positive-emerald tracking-wider block mb-1">
            2. Bénéfice Net Réel
          </span>
          <div className="text-xl md:text-2xl font-mono font-bold text-positive-emerald">
            {formatMoney(6950, { showSign: true })}
          </div>
          <span className="text-[10px] font-mono font-semibold text-positive-emerald mt-1 block">
            42.3% Contribution nette
          </span>
        </div>

        {/* Tile 3: COD Delivery Rate */}
        <div className="p-4 md:p-5 rounded-2xl border border-border bg-surface shadow-2xs">
          <span className="text-[10px] md:text-xs font-mono uppercase text-muted tracking-wider block mb-1">
            3. Taux de Livraison COD
          </span>
          <div className="text-xl md:text-2xl font-mono font-bold text-foreground">
            92.0%
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-positive-emerald font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>Objectif &gt;85% atteint</span>
          </div>
        </div>

        {/* Tile 4: Pending Payouts */}
        <div className="p-4 md:p-5 rounded-2xl border border-warning-border bg-warning-cream/60 shadow-2xs">
          <span className="text-[10px] md:text-xs font-mono uppercase text-warning-amber tracking-wider block mb-1">
            4. En Transit Transporteurs
          </span>
          <div className="text-xl md:text-2xl font-mono font-bold text-warning-amber">
            {formatMoney(1340)}
          </div>
          <span className="text-[10px] font-mono text-muted mt-1 block">
            Aramex &amp; Yalidine (Virement proche)
          </span>
        </div>
      </div>

      {/* Link Cards to Core Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Profit OS */}
        <Link href="/dashboard/profit-os" className="group">
          <Card className="h-full p-5 hover:border-brand-lime transition-all duration-200 hover:shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-ink text-brand-lime flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">
              Profit OS &amp; Waterfall
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              P&amp;L complet en 6 étapes, simulateur de prix et marge unitaire, réconciliation bancaire des transporteurs.
            </p>
          </Card>
        </Link>

        {/* Card 2: Catalogue Produits */}
        <Link href="/dashboard/products" className="group">
          <Card className="h-full p-5 hover:border-brand-lime transition-all duration-200 hover:shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-surface-subtle text-foreground flex items-center justify-center border border-border">
                <Package className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">
              Catalogue Produits
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Coordonnées financières (COGS, expédition, CPA cible, taux de refus) avec calcul de profit en direct.
            </p>
          </Card>
        </Link>

        {/* Card 3: Budget Planner */}
        <Link href="/dashboard/budget-planner" className="group">
          <Card className="h-full p-5 hover:border-brand-lime transition-all duration-200 hover:shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-surface-subtle text-foreground flex items-center justify-center border border-border">
                <Calendar className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">
              Planificateur de Budget
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Modélisez vos flux de trésorerie (PAY / SPEND / INVEST) selon 3 scénarios (pessimiste, réaliste, optimiste).
            </p>
          </Card>
        </Link>
      </div>

      {/* Recent Orders Preview (from Screenshot 2) */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Dernières Commandes COD</CardTitle>
            <p className="text-xs text-muted mt-0.5">
              Échantillon des 6 dernières commandes synchronisées avec Aramex et Yalidine
            </p>
          </div>
          <Link href="/dashboard/profit-os">
            <Button variant="outline" size="sm" className="text-xs">
              Voir tout le grand livre →
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Commande</TableHead>
                <TableHead>Client / Ville</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead className="text-right">Prix Vente</TableHead>
                <TableHead className="text-right">Contrib. Nette</TableHead>
                <TableHead className="text-center">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_ORDERS.map((order) => {
                const net = calculateOrderNetContribution(order);
                const isPositive = net > 0;

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs font-semibold text-foreground">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs text-foreground">
                          {order.customerName}
                        </span>
                        <span className="text-[11px] text-muted font-sans">
                          {order.city}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-foreground max-w-[200px] truncate">
                      {order.productName}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-right text-foreground">
                      {formatMoney(order.salePrice)}
                    </TableCell>
                    <TableCell
                      className={`font-mono text-xs font-bold text-right ${
                        isPositive ? "text-positive-emerald" : "text-negative-red"
                      }`}
                    >
                      {formatMoney(net, { showSign: true })}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusPill status={order.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
