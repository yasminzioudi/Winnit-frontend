"use client";

import React, { useState, Suspense } from "react";
import { ProfitOSSubNav } from "@/components/profit-os/SubNav";
import { AdSpendTab } from "@/components/costs/AdSpendTab";
import { ExpensesTab } from "@/components/costs/ExpensesTab";
import { RoasBreakEvenCard } from "@/components/costs/RoasBreakEvenCard";

function CostsPageContent() {
  const [activeTab, setActiveTab] = useState<"adspend" | "expenses">("adspend");

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Gestion des Coûts
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Publicité, charges fixes et seuil de rentabilité ROAS
        </p>
      </div>

      {/* Subnav */}
      <ProfitOSSubNav />

      {/* ROAS Breakeven Card */}
      <RoasBreakEvenCard />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab("adspend")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "adspend"
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          Publicité
        </button>
        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "expenses"
              ? "text-primary border-b-2 border-primary"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          Charges fixes
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "adspend" ? <AdSpendTab /> : <ExpensesTab />}
    </div>
  );
}

export default function CostsPage() {
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
      <CostsPageContent />
    </Suspense>
  );
}
