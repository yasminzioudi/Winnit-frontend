import { formatMoney } from '@/lib/format/currency';
import { formatDate } from '@/lib/format/date';
import type {
  OrderResponse,
  ExpenseResponse,
  AdSpendResponse,
  WinnerAnalysis,
  ProfitOSMetrics,
  CODAnalyticsResponse,
} from '@/lib/api/types';

export function ordersToRows(orders: OrderResponse[]): string[][] {
  const headers = [
    'N° Commande',
    'Date',
    'Produit',
    'Client',
    'Ville',
    'Gouvernorat',
    'Quantité',
    'Prix Unitaire (TND)',
    'COGS (TND)',
    'Livraison (TND)',
    'CPA (TND)',
    'Transporteur',
    'Statut',
    'Contribution Nette (TND)',
  ];

  const rows = orders.map((order) => [
    order.orderNumber,
    formatDate(order.placedAt),
    order.productNameSnapshot,
    order.customer.firstName,
    order.customer.city,
    order.customer.governorate,
    order.quantity.toString(),
    formatMoney(order.unitPriceMillimes),
    formatMoney(order.unitCogsMillimes),
    formatMoney(order.shippingMillimes),
    formatMoney(order.adCpaMillimes),
    order.courier,
    order.status,
    formatMoney(order.netContributionMillimes),
  ]);

  return [headers, ...rows];
}

export function expensesToRows(expenses: ExpenseResponse[]): string[][] {
  const headers = [
    'Catégorie',
    'Description',
    'Montant (TND)',
    'Type',
    'Date Début',
  ];

  const rows = expenses.map((expense) => [
    expense.category,
    expense.description,
    formatMoney(expense.amountMillimes),
    expense.periodType,
    formatDate(expense.startDate),
  ]);

  return [headers, ...rows];
}

export function adSpendToRows(adSpend: AdSpendResponse[]): string[][] {
  const headers = [
    'Plateforme',
    'Campagne',
    'Début',
    'Fin',
    'Montant (TND)',
    'Produit ID',
    'Notes',
  ];

  const rows = adSpend.map((spend) => [
    spend.platform,
    spend.campaignName,
    formatDate(spend.periodStart),
    formatDate(spend.periodEnd),
    formatMoney(spend.spendMillimes),
    spend.productId || '-',
    spend.notes || '-',
  ]);

  return [headers, ...rows];
}

export function winnersToRows(winners: WinnerAnalysis[]): string[][] {
  const headers = [
    'Rang',
    'Produit',
    'Score',
    'Label',
    'Commandes Totales',
    'Livrées',
    'Refusées',
    'CA Brut (TND)',
    'Score Marge',
    'Score Livraison',
    'Score ROAS',
    'Score Volume',
  ];

  const rows = winners.map((winner, index) => [
    (index + 1).toString(),
    winner.productName,
    winner.score.toString(),
    winner.label,
    winner.totalOrders.toString(),
    winner.deliveredOrders.toString(),
    winner.refusedOrders.toString(),
    formatMoney(winner.grossRevenueMillimes),
    winner.breakdown.netMarginScore.toString(),
    winner.breakdown.deliveryRateScore.toString(),
    winner.breakdown.roasScore.toString(),
    winner.breakdown.volumeTrendScore.toString(),
  ]);

  return [headers, ...rows];
}

export function summaryToRows(
  summary: ProfitOSMetrics,
  cod: CODAnalyticsResponse
): string[][] {
  const headers = ['Indicateur', 'Valeur'];

  const rows: string[][] = [
    ['=== WATERFALL P&L ===', ''],
    ['CA Brut', formatMoney(summary.waterfall.grossRevenueMillimes)],
    ['- COGS Produits', formatMoney(summary.waterfall.productCOGSMillimes)],
    ['- Livraisons', formatMoney(summary.waterfall.outboundShippingMillimes)],
    ['- Publicité Payée', formatMoney(summary.waterfall.paidAdSpendMillimes)],
    ['- Pénalité Refus COD', formatMoney(summary.waterfall.codRefusalPenaltyMillimes)],
    ['= Contribution Nette', formatMoney(summary.waterfall.netRealizedContributionMillimes)],
    ['Marge Nette (%)', ((summary.waterfall.netRealizedContributionMillimes / summary.waterfall.grossRevenueMillimes) * 100).toFixed(1) + '%'],
    ['', ''],
    ['=== KPIS ===', ''],
    ['Commandes Totales', summary.kpis.totalOrdersCount.toString()],
    ['Livrées', summary.kpis.deliveredCount.toString()],
    ['Refusées', summary.kpis.refusedCount.toString()],
    ['Taux de Livraison', summary.kpis.deliveryRatePercent.toFixed(1) + '%'],
    ['Taux de Refus', summary.kpis.refusalRatePercent.toFixed(1) + '%'],
    ['Panier Moyen', formatMoney(summary.kpis.averageOrderValueMillimes)],
    ['', ''],
    ['=== CHARGES FIXES ===', ''],
    ['Charges Fixes', formatMoney(summary.expenses.fixedExpensesMillimes)],
    ['Profit Net Après Charges', formatMoney(summary.waterfall.netRealizedContributionMillimes - summary.expenses.fixedExpensesMillimes)],
    ['Marge Nette Finale', summary.expenses.netProfitMarginPercent.toFixed(1) + '%'],
    ['', ''],
    ['=== COD & TRÉSORERIE ===', ''],
    ['Encaissements Attendus', formatMoney(cod.summary.expectedCashCollectionsMillimes)],
    ['Virements Reçus', formatMoney(cod.summary.bankWireSettledMillimes)],
    ['En Attente Transporteur', formatMoney(cod.summary.pendingCourierPayoutsMillimes)],
  ];

  return [headers, ...rows];
}
