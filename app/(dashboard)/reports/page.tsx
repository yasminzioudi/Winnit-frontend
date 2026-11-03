'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ProfitOSSubNav } from '@/components/profit-os/SubNav';
import { PeriodPicker, getDatesForPeriod, type PeriodKey } from '@/components/profit-os/PeriodPicker';
import { apiClient, apiGet } from '@/lib/api/client';
import type {
  OrderResponse,
  ExpenseResponse,
  AdSpendResponse,
  WinnerAnalysis,
  ProfitOSMetrics,
  CODAnalyticsResponse,
  OrdersListResponse,
} from '@/lib/api/types';
import {
  ordersToRows,
  expensesToRows,
  adSpendToRows,
  winnersToRows,
  summaryToRows,
} from '@/lib/reports/data-to-rows';
import { downloadCSV, generateCSVFilename } from '@/lib/reports/csv';
import { downloadXLSX, generateXLSXFilename } from '@/lib/reports/xlsx';
import { downloadPDF, generatePDFFilename } from '@/lib/reports/pdf';
import { FileText, Download, FileSpreadsheet, FileDown } from 'lucide-react';

type ReportType = 'summary' | 'orders' | 'winners' | 'cod' | 'complete';

interface ReportHistory {
  id: string;
  type: ReportType;
  format: 'csv' | 'xlsx' | 'pdf';
  timestamp: string;
  filename: string;
}

function ReportsContent() {
  const searchParams = useSearchParams();
  const periodParam = (searchParams.get('period') as PeriodKey) || '90d';
  const [defaultDates] = useState(() => getDatesForPeriod(periodParam));

  const from = searchParams.get('from') || defaultDates.from;
  const to = searchParams.get('to') || defaultDates.to;

  const [reportType, setReportType] = useState<ReportType>('summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ReportHistory[]>([]);

  // Fetch data - always fetch for PDF generation
  const { data: summary } = useQuery({
    queryKey: ['analytics-summary', from, to],
    queryFn: () => apiGet<ProfitOSMetrics>(`/analytics/summary?from=${from}&to=${to}`),
  });

  const { data: winners } = useQuery({
    queryKey: ['winners', from, to],
    queryFn: () => apiClient.getWinners(from, to),
  });

  const { data: cod } = useQuery({
    queryKey: ['cod', from, to],
    queryFn: () => apiGet<CODAnalyticsResponse>(`/analytics/cod?from=${from}&to=${to}`),
  });

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => apiClient.getExpenses(from, to),
    enabled: reportType === 'complete',
  });

  const { data: adSpend } = useQuery({
    queryKey: ['ad-spend'],
    queryFn: () => apiGet<AdSpendResponse[]>(`/marketing/ad-spend?from=${from}&to=${to}`),
    enabled: reportType === 'complete',
  });

  const fetchAllOrders = async (): Promise<OrderResponse[]> => {
    const allOrders: OrderResponse[] = [];
    let cursor: string | undefined = undefined;
    let page = 0;
    const maxPages = 10;

    while (page < maxPages) {
      const queryParams = new URLSearchParams({ limit: '100' });
      if (cursor) queryParams.set('cursor', cursor);

      const response = await apiGet<OrdersListResponse>(`/orders?${queryParams.toString()}`);
      allOrders.push(...response.data);

      if (!response.meta.nextCursor) break;
      cursor = response.meta.nextCursor;
      page++;
    }

    return allOrders;
  };

  const handleDownloadCSV = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      let rows: string[][] = [];

      switch (reportType) {
        case 'summary':
          if (summary && cod) {
            rows = summaryToRows(summary, cod);
          }
          break;
        case 'orders': {
          const orders = await fetchAllOrders();
          rows = ordersToRows(orders);
          break;
        }
        case 'winners':
          if (winners) {
            rows = winnersToRows(winners);
          }
          break;
        case 'cod':
          if (cod) {
            rows = [
              ['Indicateur', 'Valeur'],
              ['Encaissements Attendus', (cod.summary.expectedCashCollectionsMillimes / 1000).toFixed(2)],
              ['Virements Reçus', (cod.summary.bankWireSettledMillimes / 1000).toFixed(2)],
              ['En Attente', (cod.summary.pendingCourierPayoutsMillimes / 1000).toFixed(2)],
            ];
          }
          break;
        case 'complete': {
          const orders = await fetchAllOrders();
          rows = [
            ...summaryToRows(summary!, cod!),
            [''],
            ['=== COMMANDES ==='],
            ...ordersToRows(orders),
          ];
          break;
        }
      }

      const filename = generateCSVFilename(reportType);
      downloadCSV(filename, rows);

      addToHistory(reportType, 'csv', filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadXLSX = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const sheets: { name: string; rows: string[][] }[] = [];

      if (reportType === 'complete') {
        if (summary && cod) sheets.push({ name: 'Résumé', rows: summaryToRows(summary, cod) });

        const orders = await fetchAllOrders();
        sheets.push({ name: 'Commandes', rows: ordersToRows(orders) });

        if (adSpend) sheets.push({ name: 'Publicité', rows: adSpendToRows(adSpend) });
        if (expenses?.data) sheets.push({ name: 'Charges', rows: expensesToRows(expenses.data) });
        if (winners) sheets.push({ name: 'Winners', rows: winnersToRows(winners) });
        if (cod) {
          const codRows = [
            ['Indicateur', 'Valeur'],
            ['Encaissements Attendus', (cod.summary.expectedCashCollectionsMillimes / 1000).toFixed(2)],
            ['Virements Reçus', (cod.summary.bankWireSettledMillimes / 1000).toFixed(2)],
            ['En Attente', (cod.summary.pendingCourierPayoutsMillimes / 1000).toFixed(2)],
          ];
          sheets.push({ name: 'COD', rows: codRows });
        }
      } else {
        // Single sheet
        let rows: string[][] = [];
        let name = 'Rapport';

        switch (reportType) {
          case 'summary':
            if (summary && cod) {
              rows = summaryToRows(summary, cod);
              name = 'Résumé';
            }
            break;
          case 'orders': {
            const orders = await fetchAllOrders();
            rows = ordersToRows(orders);
            name = 'Commandes';
            break;
          }
          case 'winners':
            if (winners) {
              rows = winnersToRows(winners);
              name = 'Winners';
            }
            break;
          case 'cod':
            if (cod) {
              rows = [
                ['Indicateur', 'Valeur'],
                ['Encaissements Attendus', (cod.summary.expectedCashCollectionsMillimes / 1000).toFixed(2)],
                ['Virements Reçus', (cod.summary.bankWireSettledMillimes / 1000).toFixed(2)],
                ['En Attente', (cod.summary.pendingCourierPayoutsMillimes / 1000).toFixed(2)],
              ];
              name = 'COD';
            }
            break;
        }

        sheets.push({ name, rows });
      }

      const filename = generateXLSXFilename(reportType);
      await downloadXLSX(filename, sheets);

      addToHistory(reportType, 'xlsx', filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      if (!summary || !cod || !winners) {
        throw new Error('Données manquantes pour générer le PDF');
      }

      const filename = generatePDFFilename(reportType);
      await downloadPDF(filename, {
        period: { from, to },
        summary,
        cod,
        winners,
      });

      addToHistory(reportType, 'pdf', filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const addToHistory = (type: ReportType, format: 'csv' | 'xlsx' | 'pdf', filename: string) => {
    const entry: ReportHistory = {
      id: Date.now().toString(),
      type,
      format,
      timestamp: new Date().toISOString(),
      filename,
    };
    setHistory((prev) => [entry, ...prev]);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-20 md:pb-8">
      <ProfitOSSubNav />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Rapports</h1>
          <p className="text-sm text-ink-muted mt-1">
            Exportez vos données en CSV, XLSX ou PDF
          </p>
        </div>
        <PeriodPicker />
      </div>

      {/* Configuration */}
      <div className="bg-layer-2 rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-2">Type de rapport</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="w-full px-4 py-2 bg-layer-1 border border-border rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="summary">Résumé P&L</option>
            <option value="orders">Commandes</option>
            <option value="winners">Winners</option>
            <option value="cod">COD</option>
            <option value="complete">Rapport Complet</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadCSV}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            <span>Télécharger CSV</span>
          </button>

          <button
            onClick={handleDownloadXLSX}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-positive-emerald text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Télécharger XLSX</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating || reportType === 'orders'}
            className="flex items-center gap-2 px-4 py-2 bg-negative-red text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-4 h-4" />
            <span>Télécharger PDF</span>
          </button>
        </div>

        {/* Progress */}
        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span>Génération en cours...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-negative-tint border border-negative-border rounded-lg">
            <p className="text-sm text-negative-red">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-negative-red underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-layer-2 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-ink mb-4">Historique</h2>
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-layer-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-4 h-4 text-ink-muted" />
                  <div>
                    <p className="text-sm font-medium text-ink">{entry.filename}</p>
                    <p className="text-xs text-ink-muted">
                      {new Date(entry.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-ink-muted uppercase">
                  {entry.format}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {history.length === 0 && !isGenerating && !error && (
        <div className="bg-layer-2 rounded-lg p-12 text-center">
          <FileText className="w-12 h-12 text-ink-muted mx-auto mb-4" />
          <p className="text-ink-muted">
            Sélectionnez un type de rapport et un format pour commencer
          </p>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-6 animate-pulse">
          <div className="h-10 bg-layer-3 rounded w-1/3" />
          <div className="h-64 bg-layer-2 rounded-lg" />
        </div>
      }
    >
      <ReportsContent />
    </Suspense>
  );
}
