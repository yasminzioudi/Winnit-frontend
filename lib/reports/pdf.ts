import type { ProfitOSMetrics, CODAnalyticsResponse, WinnerAnalysis } from '@/lib/api/types';
import { formatMoney } from '@/lib/format/currency';

export async function downloadPDF(
  filename: string,
  data: {
    period: { from: string; to: string };
    summary: ProfitOSMetrics;
    cod: CODAnalyticsResponse;
    winners: WinnerAnalysis[];
  }
): Promise<void> {
  // Dynamic import
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(18);
  doc.text('Rapport WINNIT OS', 105, yPos, { align: 'center' });
  yPos += 10;

  // Brand & Date
  doc.setFontSize(10);
  doc.text('Maison Ambre', 105, yPos, { align: 'center' });
  yPos += 6;
  doc.text(`Période: ${data.period.from} - ${data.period.to}`, 105, yPos, { align: 'center' });
  yPos += 6;
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, yPos, { align: 'center' });
  yPos += 15;

  // KPIs Summary
  doc.setFontSize(14);
  doc.text('KPIs Clés', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  const kpis = [
    ['Commandes Totales', data.summary.kpis.totalOrdersCount.toString()],
    ['Livrées', data.summary.kpis.deliveredCount.toString()],
    ['Refusées', data.summary.kpis.refusedCount.toString()],
    ['Taux de Livraison', data.summary.kpis.deliveryRatePercent.toFixed(1) + '%'],
    ['Panier Moyen', formatMoney(data.summary.kpis.averageOrderValueMillimes)],
  ];

  kpis.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 20, yPos);
    yPos += 6;
  });

  yPos += 5;

  // Waterfall
  doc.setFontSize(14);
  doc.text('Cascade P&L', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  const waterfall = [
    ['CA Brut', formatMoney(data.summary.waterfall.grossRevenueMillimes)],
    ['- COGS Produits', formatMoney(data.summary.waterfall.productCOGSMillimes)],
    ['- Livraisons', formatMoney(data.summary.waterfall.outboundShippingMillimes)],
    ['- Publicité', formatMoney(data.summary.waterfall.paidAdSpendMillimes)],
    ['- Pénalité Refus', formatMoney(data.summary.waterfall.codRefusalPenaltyMillimes)],
    ['= Contribution Nette', formatMoney(data.summary.waterfall.netRealizedContributionMillimes)],
  ];

  waterfall.forEach(([label, value]) => {
    doc.text(`${label}: ${value}`, 20, yPos);
    yPos += 6;
  });

  doc.text(`Marge Nette: ${((data.summary.waterfall.netRealizedContributionMillimes / data.summary.waterfall.grossRevenueMillimes) * 100).toFixed(1)}%`, 20, yPos);
  yPos += 10;

  // Winners
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.text('Top 5 Produits', 20, yPos);
  yPos += 8;

  doc.setFontSize(9);
  const topWinners = data.winners.slice(0, 5);
  topWinners.forEach((winner, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(`${index + 1}. ${winner.productName} - Score: ${winner.score}`, 20, yPos);
    yPos += 5;
    doc.text(`   Livraison: ${winner.deliveredOrders}/${winner.totalOrders} - CA: ${formatMoney(winner.grossRevenueMillimes)}`, 20, yPos);
    yPos += 7;
  });

  yPos += 5;

  // COD Status
  if (yPos > 250) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(14);
  doc.text('Statut COD', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.text(`Encaissements Attendus: ${formatMoney(data.cod.summary.expectedCashCollectionsMillimes)}`, 20, yPos);
  yPos += 6;
  doc.text(`Virements Reçus: ${formatMoney(data.cod.summary.bankWireSettledMillimes)}`, 20, yPos);
  yPos += 6;
  doc.text(`En Attente: ${formatMoney(data.cod.summary.pendingCourierPayoutsMillimes)}`, 20, yPos);

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Page ${i} / ${pageCount}`, 105, 290, { align: 'center' });
  }

  doc.save(filename);
}

export function generatePDFFilename(type: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `winnit-${type}-${date}.pdf`;
}
