import { formatMillimes } from '../format/currency.ts';
import { formatDate } from '../format/date.ts';
import type {
  OrderResponse,
  ExpenseResponse,
  AdSpendResponse,
  WinnerAnalysis,
  ProfitOSMetrics,
  CODAnalyticsResponse,
} from '../api/types.ts';

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
    formatMillimes(order.unitPriceMillimes),
    formatMillimes(order.unitCogsMillimes),
    formatMillimes(order.shippingMillimes),
    formatMillimes(order.adCpaMillimes),
    order.courier,
    order.status,
    formatMillimes(order.netContributionMillimes),
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
    formatMillimes(expense.amountMillimes),
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
    formatMillimes(spend.spendMillimes),
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
    formatMillimes(winner.grossRevenueMillimes),
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
    ['CA Brut', formatMillimes(summary.waterfall.grossRevenueMillimes)],
    ['- COGS Produits', formatMillimes(summary.waterfall.productCOGSMillimes)],
    ['- Livraisons', formatMillimes(summary.waterfall.outboundShippingMillimes)],
    ['- Publicité Payée', formatMillimes(summary.waterfall.paidAdSpendMillimes)],
    ['- Pénalité Refus COD', formatMillimes(summary.waterfall.codRefusalPenaltyMillimes)],
    ['= Contribution Nette', formatMillimes(summary.waterfall.netRealizedContributionMillimes)],
    ['Marge Nette (%)', ((summary.waterfall.netRealizedContributionMillimes / summary.waterfall.grossRevenueMillimes) * 100).toFixed(1) + '%'],
    ['', ''],
    ['=== KPIS ===', ''],
    ['Commandes Totales', summary.kpis.totalOrdersCount.toString()],
    ['Livrées', summary.kpis.deliveredCount.toString()],
    ['Refusées', summary.kpis.refusedCount.toString()],
    ['Taux de Livraison', summary.kpis.deliveryRatePercent.toFixed(1) + '%'],
    ['Taux de Refus', summary.kpis.refusalRatePercent.toFixed(1) + '%'],
    ['Panier Moyen', formatMillimes(summary.kpis.averageOrderValueMillimes)],
    ['', ''],
    ['=== CHARGES FIXES ===', ''],
    ['Charges Fixes', formatMillimes(summary.expenses.fixedExpensesMillimes)],
    ['Profit Net Après Charges', formatMillimes(summary.waterfall.netRealizedContributionMillimes - summary.expenses.fixedExpensesMillimes)],
    ['Marge Nette Finale', summary.expenses.netProfitMarginPercent.toFixed(1) + '%'],
    ['', ''],
    ['=== COD & TRÉSORERIE ===', ''],
    ['Encaissements Attendus', formatMillimes(cod.summary.expectedCashCollectionsMillimes)],
    ['Virements Reçus', formatMillimes(cod.summary.bankWireSettledMillimes)],
    ['En Attente Transporteur', formatMillimes(cod.summary.pendingCourierPayoutsMillimes)],
  ];

  return [headers, ...rows];
}
