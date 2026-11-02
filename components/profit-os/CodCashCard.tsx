"use client";

import React from "react";
import Link from "next/link";
import { Truck, ArrowRight, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatMoney } from "@/lib/format/currency";
import type { CODAnalyticsResponse } from "@/lib/api/types";

interface CodCashCardProps {
  data?: CODAnalyticsResponse;
  isLoading?: boolean;
}

export function CodCashCard({ data, isLoading }: CodCashCardProps) {
  if (isLoading || !data) {
    return (
      <Card className="p-5 h-full animate-pulse">
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 mb-4" />
        <div className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-4" />
        <div className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
      </Card>
    );
  }

  const { summary, aging } = data;
  const pendingTnd = summary.pendingCourierPayoutsMillimes / 1000;
  const settledTnd = summary.settledNetMillimes / 1000;
  const expectedTnd = summary.totalExpectedMillimes / 1000;

  const totalAgingCount =
    aging.days0to7Count +
    aging.days8to14Count +
    aging.days15to30Count +
    aging.daysOver30Count;

  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Trésorerie COD & Transporteurs
            </h3>
          </div>
          <Link
            href="/cod"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            Réconcilier
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 block mb-0.5">
              En Attente
            </span>
            <span className="text-sm font-bold tabular-nums text-amber-900 dark:text-amber-300">
              {formatMoney(pendingTnd)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 block mb-0.5">
              Réconcilié
            </span>
            <span className="text-sm font-bold tabular-nums text-emerald-900 dark:text-emerald-300">
              {formatMoney(settledTnd)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-center">
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 block mb-0.5">
              Attendu Total
            </span>
            <span className="text-sm font-bold tabular-nums text-foreground">
              {formatMoney(expectedTnd)}
            </span>
          </div>
        </div>

        {/* Aging Distribution */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="h-3.5 w-3.5 text-neutral-400" />
              Âge des fonds en souffrance ({totalAgingCount} cdes)
            </span>
            {aging.daysOver30Count > 0 && (
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                {aging.daysOver30Count} cdes &gt;30j
              </span>
            )}
          </div>

          {/* Aging Stacked Bar */}
          <div className="w-full h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden flex">
            {aging.days0to7Count > 0 && (
              <div
                style={{ width: `${(aging.days0to7Count / Math.max(1, totalAgingCount)) * 100}%` }}
                className="bg-emerald-500 h-full"
                title={`0-7j: ${aging.days0to7Count} commandes`}
              />
            )}
            {aging.days8to14Count > 0 && (
              <div
                style={{ width: `${(aging.days8to14Count / Math.max(1, totalAgingCount)) * 100}%` }}
                className="bg-primary h-full"
                title={`8-14j: ${aging.days8to14Count} commandes`}
              />
            )}
            {aging.days15to30Count > 0 && (
              <div
                style={{ width: `${(aging.days15to30Count / Math.max(1, totalAgingCount)) * 100}%` }}
                className="bg-amber-500 h-full"
                title={`15-30j: ${aging.days15to30Count} commandes`}
              />
            )}
            {aging.daysOver30Count > 0 && (
              <div
                style={{ width: `${(aging.daysOver30Count / Math.max(1, totalAgingCount)) * 100}%` }}
                className="bg-rose-500 h-full"
                title={`>30j: ${aging.daysOver30Count} commandes`}
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-0.5">
            <span className="text-emerald-600 dark:text-emerald-400">0-7j: {aging.days0to7Count}</span>
            <span className="text-primary">8-14j: {aging.days8to14Count}</span>
            <span className="text-amber-600 dark:text-amber-400">15-30j: {aging.days15to30Count}</span>
            <span className="text-rose-600 dark:text-rose-400">&gt;30j: {aging.daysOver30Count}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
        <span className="text-neutral-500 dark:text-neutral-400">
          Taux réconciliation:
        </span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
          {expectedTnd > 0 ? ((settledTnd / expectedTnd) * 100).toFixed(1) : 0}%
        </span>
      </div>
    </Card>
  );
}

