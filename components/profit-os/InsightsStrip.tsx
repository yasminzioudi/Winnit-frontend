"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, AlertCircle, Info, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Insight } from "@/lib/api/types";

interface InsightsStripProps {
  insights?: Insight[];
  isLoading?: boolean;
}

export function InsightsStrip({ insights, isLoading }: InsightsStripProps) {
  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>Recommandations & Signaux Rentabilité</span>
          <Badge variant="default" className="text-[10px] py-0 px-1.5">
            {insights.length}
          </Badge>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {insights.map((insight) => {
          const isCritical = insight.severity === "critical";
          const isWarning = insight.severity === "warning";

          let borderTone = "border-info/20 bg-info/5";
          let badgeVariant: "danger" | "warning" | "info" = "info";
          let badgeText = "Info";
          let Icon = Info;

          if (isCritical) {
            borderTone = "border-danger/25 bg-danger/5";
            badgeVariant = "danger";
            badgeText = "Critique";
            Icon = AlertCircle;
          } else if (isWarning) {
            borderTone = "border-amber-500/25 bg-amber-500/5";
            badgeVariant = "warning";
            badgeText = "Alerte";
            Icon = AlertTriangle;
          }

          return (
            <Card
              key={insight.id}
              className={`p-4 border ${borderTone} flex flex-col justify-between hover:shadow-xs transition-shadow`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-4 w-4 shrink-0 text-foreground" />
                    <span className="text-xs font-semibold text-foreground line-clamp-1">
                      {insight.title}
                    </span>
                  </div>
                  <Badge variant={badgeVariant} className="text-[10px] py-0 px-1.5 shrink-0">
                    {badgeText}
                  </Badge>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium mb-1.5">
                  {insight.evidence}
                </p>

                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {insight.suggestedAction}
                </p>
              </div>

              {insight.deepLink && (
                <div className="mt-3 pt-2 border-t border-neutral-200/50 dark:border-neutral-800/60">
                  <Link
                    href={insight.deepLink}
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <span>Agir maintenant</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

