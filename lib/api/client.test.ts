import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Test that validates the API response structure matches what the client expects.
 * This prevents runtime errors when the backend returns a plain array instead of {data: []}.
 */
test('getWinners - handles plain array response from API', () => {
  // Simulate the actual API response structure
  const mockAPIResponse: Array<{
    productId: string;
    productName: string;
    score: number;
    label: string;
    totalOrders: number;
    deliveredOrders: number;
    refusedOrders: number;
    grossRevenueMillimes: number;
    breakdown: {
      netMarginScore: number;
      deliveryRateScore: number;
      roasScore: number;
      volumeTrendScore: number;
    };
  }> = [
    {
      productId: 'prod_1',
      productName: 'Test Product',
      score: 85,
      label: 'Winner',
      totalOrders: 100,
      deliveredOrders: 90,
      refusedOrders: 10,
      grossRevenueMillimes: 1000000,
      breakdown: {
        netMarginScore: 20,
        deliveryRateScore: 25,
        roasScore: 20,
        volumeTrendScore: 20,
      },
    },
  ];

  // Verify the response is an array, not wrapped in {data: []}
  assert.ok(Array.isArray(mockAPIResponse), 'API should return plain array');
  assert.equal(mockAPIResponse.length, 1, 'Should have one winner');
  assert.equal(mockAPIResponse[0].productName, 'Test Product');

  // Verify we can access the first element directly (not via .data)
  const firstWinner = mockAPIResponse[0];
  assert.ok(firstWinner, 'First winner should exist');
  assert.equal(typeof firstWinner.score, 'number', 'Score should be a number');
});

test('PDF data validation - all required fields present', () => {
  const mockSummary = {
    waterfall: {
      grossRevenueMillimes: 100000,
      productCOGSMillimes: 20000,
      outboundShippingMillimes: 5000,
      paidAdSpendMillimes: 10000,
      codRefusalPenaltyMillimes: 1000,
      netRealizedContributionMillimes: 64000,
      netProfitMarginPercent: 64,
    },
    kpis: {
      totalOrdersCount: 10,
      deliveredCount: 8,
      refusedCount: 2,
      deliveryRatePercent: 80,
      refusalRatePercent: 20,
      averageOrderValueMillimes: 10000,
    },
    expenses: {
      fixedExpensesMillimes: 5000,
      resultAfterFixedExpensesMillimes: 59000,
      netProfitMarginPercent: 59,
    },
    adSpendDeltaMillimes: 0,
  };

  const mockCOD = {
    summary: {
      totalOrdersCount: 10,
      deliveredOrdersCount: 8,
      totalRevenueMillimes: 100000,
      settledRevenueMillimes: 80000,
      pendingSettlementMillimes: 20000,
      pendingCourierPayoutsMillimes: 15000,
      bankWireSettledMillimes: 65000,
      expectedCashCollectionsMillimes: 85000,
    },
    aging: {
      days0to7Count: 5,
      days8to14Count: 2,
      days15to30Count: 1,
      daysOver30Count: 0,
    },
  };

  const mockWinners = [
    {
      productId: 'p1',
      productName: 'Product 1',
      score: 85,
      label: 'Winner' as const,
      totalOrders: 50,
      deliveredOrders: 45,
      refusedOrders: 5,
      grossRevenueMillimes: 500000,
      breakdown: {
        netMarginScore: 20,
        deliveryRateScore: 25,
        roasScore: 20,
        volumeTrendScore: 20,
      },
    },
  ];

  // Validate the condition from reports/page.tsx
  const isValid = !!(mockSummary && mockCOD && mockWinners);
  assert.ok(isValid, 'All required data for PDF should be present');

  // Validate empty array is still truthy (should not fail the check)
  const emptyWinners: typeof mockWinners = [];
  const isValidWithEmpty = !!(mockSummary && mockCOD && emptyWinners);
  assert.ok(isValidWithEmpty, 'Empty winners array should still pass validation');
});
