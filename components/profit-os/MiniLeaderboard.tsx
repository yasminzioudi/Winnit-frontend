"use client";

import React from "react";
import Link from "next/link";
import { Trophy, ArrowRight, Award } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatMoney } from "@/lib/format/currency";
import type { WinnerRankingItem } from "@/lib/api/types";

interface MiniLeaderboardProps {
  winners?: WinnerRankingItem[];
  isLoading?: boolean;
}

export function MiniLeaderboard({ winners, isLoading }: MiniLeaderboardProps) {
  if (isLoading) {
    return (
      <Card className="p-5 h-full">
        <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3 mb-4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  const top3 = (winners || []).slice(0, 3);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return {
          icon: Trophy,
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          label: "#1",
        };
      case 1:
        return {
          icon: Award,
          bg: "bg-neutral-200/50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700",
          label: "#2",
        };
      case 2:
        return {
          icon: Award,
          bg: "bg-amber-800/10 text-amber-700 dark:text-amber-500 border-amber-800/20",
          label: "#3",
        };
      default:
        return {
          icon: Award,
          bg: "bg-neutral-100 text-neutral-600 border-neutral-200",
          label: `#${rank + 1}`,
        };
    }
  };

  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">
              Top Produits Winners
            </h3>
          </div>
          <Link
            href="/orders"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            Voir tout
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {top3.length === 0 ? (
          <div className="text-center py-6 text-xs text-neutral-400">
            Aucun classement disponible sur cette période
          </div>
        ) : (
          <div className="space-y-2.5">
            {top3.map((item, idx) => {
              const badge = getRankBadge(idx);
              const isWinner = item.label === "Winner";
              const isSurveiller = item.label === "À surveiller";

              return (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60 hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {formatMoney(item.grossRevenueMillimes / 1000)} • {item.deliveredOrders} livrées
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className="text-right">
                      <div className="text-xs font-bold tabular-nums text-foreground">
                        {item.score}/100
                      </div>
                      <Badge
                        variant={isWinner ? "emerald" : isSurveiller ? "warning" : "danger"}
                        className="text-[10px] py-0 px-1"
                      >
                        {item.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400">
        Score calculé sur la marge, livraison, ROAS et volume 30j
      </div>
    </Card>
  );
}

