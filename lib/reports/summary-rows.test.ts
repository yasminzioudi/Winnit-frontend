import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summaryToRows } from './data-to-rows.ts';
import type { ProfitOSMetrics, CODAnalyticsResponse } from '../api/types.ts';

test('summaryToRows - real API data conversion', () => {
  // Real data from curl GET /api/v1/profit-os/summary
  const mockSummary: ProfitOSMetrics = {
    waterfall: {
      grossRevenueMillimes: 77805000,
      productCOGSMillimes: 0,
      outboundShippingMillimes: 0,
      paidAdSpendMillimes: 0,
      codRefusalPenaltyMillimes: 0,
      netRealizedContributionMillimes: 24484900,
      netProfitMarginPercent: 31.5,
    },
    kpis: {
      totalOrdersCount: 100,
      deliveredCount: 80,
      refusedCount: 20,
      deliveryRatePercent: 80.0,
      refusalRatePercent: 20.0,
      averageOrderValueMillimes: 159000,
    },
    expenses: {
      fixedExpensesMillimes: 9358549,
      resultAfterFixedExpensesMillimes: 15126351,
      netProfitMarginPercent: 19.4,
    },
    adSpendDeltaMillimes: 0,
  };

  const mockCOD: CODAnalyticsResponse = {
    summary: {
      totalOrdersCount: 100,
      deliveredOrdersCount: 80,
      totalRevenueMillimes: 77805000,
      settledRevenueMillimes: 30000000,
      pendingSettlementMillimes: 47805000,
      pendingCourierPayoutsMillimes: 20000000,
      bankWireSettledMillimes: 30000000,
      expectedCashCollectionsMillimes: 50000000,
    },
    aging: {
      days0to7Count: 10,
      days8to14Count: 5,
      days15to30Count: 3,
      daysOver30Count: 2,
    },
  };

  const rows = summaryToRows(mockSummary, mockCOD);

  // Find specific rows and verify formatting
  const grossRevenueRow = rows.find(r => r[0] === 'CA Brut');
  assert.ok(grossRevenueRow, 'CA Brut row should exist');
  assert.equal(grossRevenueRow[1], '77 805 TND', 'grossRevenueMillimes 77805000 should format to "77 805 TND"');

  const netContributionRow = rows.find(r => r[0] === '= Contribution Nette');
  assert.ok(netContributionRow, 'Contribution Nette row should exist');
  assert.equal(netContributionRow[1], '24 484.9 TND', 'netRealizedContributionMillimes 24484900 should format to "24 484.9 TND"');

  const fixedExpensesRow = rows.find(r => r[0] === 'Charges Fixes');
  assert.ok(fixedExpensesRow, 'Charges Fixes row should exist');
  assert.equal(fixedExpensesRow[1], '9 358.5 TND', 'fixedExpensesMillimes 9358549 should format to "9 358.5 TND"');

  const panierMoyenRow = rows.find(r => r[0] === 'Panier Moyen');
  assert.ok(panierMoyenRow, 'Panier Moyen row should exist');
  assert.equal(panierMoyenRow[1], '159 TND', 'averageOrderValueMillimes 159000 should format to "159 TND"');

  const expectedCashRow = rows.find(r => r[0] === 'Encaissements Attendus');
  assert.ok(expectedCashRow, 'Encaissements Attendus row should exist');
  assert.equal(expectedCashRow[1], '50 000 TND', 'expectedCashCollectionsMillimes 50000000 should format to "50 000 TND"');

  const bankWireRow = rows.find(r => r[0] === 'Virements Reçus');
  assert.ok(bankWireRow, 'Virements Reçus row should exist');
  assert.equal(bankWireRow[1], '30 000 TND', 'bankWireSettledMillimes 30000000 should format to "30 000 TND"');

  const pendingRow = rows.find(r => r[0] === 'En Attente Transporteur');
  assert.ok(pendingRow, 'En Attente Transporteur row should exist');
  assert.equal(pendingRow[1], '20 000 TND', 'pendingCourierPayoutsMillimes 20000000 should format to "20 000 TND"');
});
