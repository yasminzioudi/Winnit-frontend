"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Download, FileText, FileSpreadsheet, FileDown, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/format/date";

export interface ReportHistoryItem {
  id: string;
  type: string;
  format: "csv" | "xlsx" | "pdf";
  timestamp: string;
  filename: string;
}

export interface ReportHistoryListProps {
  history: ReportHistoryItem[];
  onClearHistory: () => void;
}

export function ReportHistoryList({
  history,
  onClearHistory,
}: ReportHistoryListProps) {
  if (history.length === 0) {
    return null;
  }

  const formatIcons = {
    csv: FileText,
    xlsx: FileSpreadsheet,
    pdf: FileDown,
  };

  const formatBadges = {
    csv: "bg-surface-subtle text-foreground border-border",
    xlsx: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
    pdf: "bg-brand-lime/20 text-brand-lime-text border-brand-lime/40 font-bold",
  };

  return (
    <Card className="p-5 sm:p-6 space-y-4 border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-muted" />
          <h3 className="text-base font-semibold text-foreground">
            Historique des Téléchargements (Session)
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-surface-subtle border border-border text-muted">
            {history.length}
          </span>
        </div>

        <button
          type="button"
          onClick={onClearHistory}
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-negative-red transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Effacer l&apos;historique</span>
        </button>
      </div>

      <div className="space-y-2">
        {history.map((entry) => {
          const Icon = formatIcons[entry.format] || FileText;
          const badgeClass = formatBadges[entry.format];

          return (
            <div
              key={entry.id}
              className="p-3.5 rounded-xl border border-border bg-surface-subtle flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-surface border border-border shrink-0">
                  <Icon className="w-4 h-4 text-foreground" />
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-foreground truncate font-mono text-xs">
                    {entry.filename}
                  </div>
                  <div className="text-[11px] text-muted font-mono mt-0.5">
                    {formatDate(entry.timestamp)} à{" "}
                    {new Date(entry.timestamp).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${badgeClass}`}
                >
                  {entry.format}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
