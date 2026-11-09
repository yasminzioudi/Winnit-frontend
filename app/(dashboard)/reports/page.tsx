"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProfitOSContainer } from "@/components/profit-os/ProfitOSContainer";
import { ProfitOSSubNav } from "@/components/profit-os/SubNav";
import { PeriodPicker, getDatesForPeriod, type PeriodKey } from "@/components/profit-os/PeriodPicker";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ReportTypeCardGrid,
  type ReportType,
} from "@/components/reports/ReportTypeCardGrid";
import { ReportFiguresPreview } from "@/components/reports/ReportFiguresPreview";
import {
  ReportHistoryList,
  type ReportHistoryItem,
} from "@/components/reports/ReportHistoryList";
import { useToast } from "@/hooks/useToast";
import { apiClient, apiGet } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type {
  ProfitOSMetrics,
  CODAnalyticsResponse,
  ExpenseResponse,
  AdSpendResponse,
  OrderResponse,
  OrdersListResponse,
  AdSpendListResponse,
} from "@/lib/api/types";
import {
  ordersToRows,
  expensesToRows,
  adSpendToRows,
  winnersToRows,
  summaryToRows,
} from "@/lib/reports/data-to-rows";
import { downloadCSV, generateCSVFilename } from "@/lib/reports/csv";
import { downloadXLSX, generateXLSXFilename } from "@/lib/reports/xlsx";
import { downloadPDF, generatePDFFilename } from "@/lib/reports/pdf";
import { FileText, FileSpreadsheet, FileDown, Loader2 } from "lucide-react";

function ReportsContent() {
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const periodParam = (searchParams.get("period") as PeriodKey) || "90d";
  const [defaultDates] = useState(() => getDatesForPeriod(periodParam));
  const from = searchParams.get("from") || defaultDates.from;
  const to = searchParams.get("to") || defaultDates.to;

  const [reportType, setReportType] = useState<ReportType>("summary");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);

  // 1. Always fetch summary, winners, cod for preview and PDF
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: queryKeys.analytics.summary({ from, to }),
    queryFn: () =>
      apiGet<ProfitOSMetrics>(
        `/analytics/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      ),
  });

  const { data: winners = [], isLoading: winnersLoading } = useQuery({
    queryKey: queryKeys.analytics.winners({ from, to }),
    queryFn: () => apiClient.getWinners(from, to),
  });

  const { data: cod, isLoading: codLoading } = useQuery({
    queryKey: queryKeys.analytics.cod({ from, to }),
    queryFn: () =>
      apiGet<CODAnalyticsResponse>(
        `/analytics/cod?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      ),
  });

  // 2. Fetch expenses and ad-spend when needed
  const { data: expensesData } = useQuery({
    queryKey: queryKeys.expenses.list({ from, to }),
    queryFn: () => apiClient.getExpenses(from, to),
    enabled: reportType === "expenses" || reportType === "complete",
  });

  const { data: adSpendData } = useQuery({
    queryKey: queryKeys.adSpend.list({ from, to }),
    queryFn: () =>
      apiGet<AdSpendListResponse>(
        `/marketing/ad-spend?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
      ),
    enabled: reportType === "adSpend" || reportType === "complete",
  });

  const expenses: ExpenseResponse[] = expensesData?.data || [];
  const adSpends: AdSpendResponse[] = adSpendData?.data || [];

  const fetchAllOrders = async (): Promise<OrderResponse[]> => {
    const allOrders: OrderResponse[] = [];
    let cursor: string | undefined = undefined;
    let page = 0;
    const maxPages = 10;

    while (page < maxPages) {
      const queryParams = new URLSearchParams({ limit: "100" });
      if (cursor) queryParams.set("cursor", cursor);

      const response = await apiGet<OrdersListResponse>(
        `/orders?${queryParams.toString()}`
      );
      allOrders.push(...response.data);

      if (!response.meta.nextCursor) break;
      cursor = response.meta.nextCursor;
      page++;
    }

    return allOrders;
  };

  const addToHistory = (
    type: ReportType,
    format: "csv" | "xlsx" | "pdf",
    filename: string
  ) => {
    const entry: ReportHistoryItem = {
      id: Date.now().toString(),
      type,
      format,
      timestamp: new Date().toISOString(),
      filename,
    };
    setHistory((prev) => [entry, ...prev]);
  };

  // CSV Export Handler
  const handleDownloadCSV = async () => {
    setIsGenerating(true);
    try {
      let rows: string[][] = [];

      switch (reportType) {
        case "summary":
          if (summary && cod) {
            rows = summaryToRows(summary, cod);
          }
          break;
        case "orders": {
          const orders = await fetchAllOrders();
          rows = ordersToRows(orders);
          break;
        }
        case "adSpend":
          rows = adSpendToRows(adSpends);
          break;
        case "expenses":
          rows = expensesToRows(expenses);
          break;
        case "winners":
          rows = winnersToRows(winners);
          break;
        case "cod":
          if (cod) {
            rows = [
              ["Indicateur", "Montant (TND)"],
              [
                "Encaissements Attendus",
                (cod.summary.expectedCashCollectionsMillimes / 1000).toFixed(2),
              ],
              [
                "Virements Reçus",
                (cod.summary.bankWireSettledMillimes / 1000).toFixed(2),
              ],
              [
                "En Attente Transporteur",
                (cod.summary.pendingCourierPayoutsMillimes / 1000).toFixed(2),
              ],
            ];
          }
          break;
        case "complete": {
          const orders = await fetchAllOrders();
          rows = [
            ...(summary && cod ? summaryToRows(summary, cod) : []),
            [""],
            ["=== COMMANDES ==="],
            ...ordersToRows(orders),
            [""],
            ["=== PUBLICITÉ ==="],
            ...adSpendToRows(adSpends),
            [""],
            ["=== CHARGES FIXES ==="],
            ...expensesToRows(expenses),
            [""],
            ["=== PODIUM ==="],
            ...winnersToRows(winners),
          ];
          break;
        }
      }

      const filename = generateCSVFilename(reportType);
      downloadCSV(filename, rows);
      addToHistory(reportType, "csv", filename);
      success(`Rapport "${filename}" téléchargé avec succès !`);
    } catch (err) {
      toastError(
        err instanceof Error ? err.message : "Erreur lors de la génération CSV"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // XLSX Export Handler
  const handleDownloadXLSX = async () => {
    setIsGenerating(true);
    try {
      const sheets: { name: string; rows: string[][] }[] = [];

      if (reportType === "complete") {
        if (summary && cod)
          sheets.push({ name: "Résumé P&L", rows: summaryToRows(summary, cod) });
        const orders = await fetchAllOrders();
        sheets.push({ name: "Commandes", rows: ordersToRows(orders) });
        sheets.push({ name: "Publicité", rows: adSpendToRows(adSpends) });
        sheets.push({ name: "Charges", rows: expensesToRows(expenses) });
        sheets.push({ name: "Podium", rows: winnersToRows(winners) });
        if (cod) {
          sheets.push({
            name: "COD",
            rows: [
              ["Indicateur", "Valeur (TND)"],
              [
                "Encaissements Attendus",
                (cod.summary.expectedCashCollectionsMillimes / 1000).toFixed(2),
              ],
              [
                "Virements Reçus",
                (cod.summary.bankWireSettledMillimes / 1000).toFixed(2),
              ],
              [
                "En Attente Transporteur",
                (cod.summary.pendingCourierPayoutsMillimes / 1000).toFixed(2),
              ],
            ],
          });
        }
      } else {
        let rows: string[][] = [];
        let name = "Rapport";

        switch (reportType) {
          case "summary":
            if (summary && cod) {
              rows = summaryToRows(summary, cod);
              name = "Résumé P&L";
            }
            break;
          case "orders": {
            const orders = await fetchAllOrders();
            rows = ordersToRows(orders);
            name = "Commandes";
            break;
          }
          case "adSpend":
            rows = adSpendToRows(adSpends);
            name = "Publicité";
            break;
          case "expenses":
            rows = expensesToRows(expenses);
            name = "Charges Fixes";
            break;
          case "winners":
            rows = winnersToRows(winners);
            name = "Podium";
            break;
          case "cod":
            if (cod) {
              rows = [
                ["Indicateur", "Valeur (TND)"],
                [
                  "Encaissements Attendus",
                  (cod.summary.expectedCashCollectionsMillimes / 1000).toFixed(2),
                ],
                [
                  "Virements Reçus",
                  (cod.summary.bankWireSettledMillimes / 1000).toFixed(2),
                ],
                [
                  "En Attente Transporteur",
                  (cod.summary.pendingCourierPayoutsMillimes / 1000).toFixed(2),
                ],
              ];
              name = "COD";
            }
            break;
        }

        sheets.push({ name, rows });
      }

      const filename = generateXLSXFilename(reportType);
      await downloadXLSX(filename, sheets);
      addToHistory(reportType, "xlsx", filename);
      success(`Classeur Excel "${filename}" téléchargé avec succès !`);
    } catch (err) {
      toastError(
        err instanceof Error ? err.message : "Erreur lors de la génération XLSX"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // PDF Export Handler
  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      if (!summary || !cod || !winners) {
        throw new Error(
          "Données incomplètes pour générer le rapport PDF. Attendez la fin du chargement."
        );
      }

      const filename = generatePDFFilename(reportType);
      await downloadPDF(filename, {
        period: { from, to },
        summary,
        cod,
        winners,
      });

      addToHistory(reportType, "pdf", filename);
      success(`Document PDF "${filename}" téléchargé avec succès !`);
    } catch (err) {
      toastError(
        err instanceof Error ? err.message : "Erreur lors de la génération PDF"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProfitOSContainer>
      {/* Header with Dashboard PeriodPicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Centre de Rapports & Exports
          </h1>
          <p className="text-xs text-muted">
            Exportez vos données opérationnelles et financières en CSV, Excel (XLSX) ou PDF
          </p>
        </div>
        <PeriodPicker />
      </div>

      {/* Shared Sub-Navigation */}
      <ProfitOSSubNav />

      {/* 1. Card Grid for Report Selection */}
      <ReportTypeCardGrid
        selectedType={reportType}
        onSelectType={setReportType}
      />

      {/* 2. Key Figures Preview Before Download */}
      <ReportFiguresPreview
        reportType={reportType}
        summary={summary}
        cod={cod}
        winners={winners}
        expenses={expenses}
        adSpends={adSpends}
        isLoading={summaryLoading || codLoading || winnersLoading}
      />

      {/* 3. Export Action Center */}
      <Card className="p-5 sm:p-6 space-y-4 border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Télécharger le rapport
            </h3>
            <p className="text-xs text-muted">
              Choisissez le format d&apos;export adapté à votre besoin
            </p>
          </div>

          {/* Consistent, Visible Export Buttons (zero white-on-white text) */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadCSV}
              disabled={isGenerating}
              className="gap-2 font-medium"
            >
              <FileText className="w-4 h-4 text-foreground" />
              <span>Exporter CSV</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleDownloadXLSX}
              disabled={isGenerating}
              className="gap-2 font-medium border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exporter Excel (XLSX)</span>
            </Button>

            <Button
              variant="brand"
              onClick={handleDownloadPDF}
              disabled={isGenerating || reportType === "orders"}
              className="gap-2 font-bold shadow-xs"
              title={
                reportType === "orders"
                  ? "Utilisez CSV ou XLSX pour le grand livre des commandes"
                  : undefined
              }
            >
              <FileDown className="w-4 h-4" />
              <span>Générer PDF</span>
            </Button>
          </div>
        </div>

        {isGenerating && (
          <div className="flex items-center gap-2 pt-2 text-xs font-mono text-muted animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-brand-lime-text" />
            <span>Compilation et génération du fichier en cours...</span>
          </div>
        )}
      </Card>

      {/* 4. In-Memory Session Download History */}
      <ReportHistoryList
        history={history}
        onClearHistory={() => setHistory([])}
      />
    </ProfitOSContainer>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <ProfitOSContainer>
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-surface-subtle rounded w-1/4" />
            <div className="h-12 bg-surface-subtle rounded-2xl w-full" />
            <div className="h-48 bg-surface-subtle rounded-2xl w-full" />
            <div className="h-32 bg-surface-subtle rounded-2xl w-full" />
          </div>
        </ProfitOSContainer>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
