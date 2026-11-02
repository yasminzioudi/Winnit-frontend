import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { OrderItem, OrderStatus } from "./types.ts";
import {
  calculateOrderNetContribution,
  calculateUnitEconomics,
  calculatePLWaterfall,
  calculateCourierReconciliation,
} from "./profit.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load golden fixture
const goldenFixture = JSON.parse(
  readFileSync(join(__dirname, "../../contracts-golden.json"), "utf8")
);

test("Unit Economics - Golden Fixture calibration", () => {
  const testCase = goldenFixture.unitEconomics[0];
  const input = testCase.input;

  // Convert millimes to TND
  const result = calculateUnitEconomics({
    price: input.priceMillimes / 1000,
    cogs: input.cogsMillimes / 1000,
    logistics: input.logisticsMillimes / 1000,
    cpa: input.cpaMillimes / 1000,
    refusalRate: input.refusalRate,
  });

  const expected = testCase.expected;
  // Compare in TND (frontend works in TND, so convert millimes expectations)
  assert.equal(result.maxTolerableCPA, expected.maxTolerableCpaMillimes / 1000);
  assert.equal(result.breakEvenROAS, expected.breakEvenROAS);
  // Frontend returns TND, compare with millimes converted to TND (60380 millimes = 60.38 TND)
  assert.equal(result.netProfitPerUnit, expected.netProfitPerUnitMillimes / 1000);
});

test("Order-Level Unit Economics - Golden Fixture matches", () => {
  for (const orderData of goldenFixture.orders) {
    const order: OrderItem = {
      id: orderData.id,
      orderNumber: orderData.orderNumber,
      customerName: "",
      city: "",
      productName: orderData.productNameSnapshot,
      salePrice: orderData.unitPriceMillimes / 1000,
      cogs: orderData.unitCogsMillimes / 1000,
      shipping: orderData.shippingMillimes / 1000,
      returnShipping: orderData.returnShippingMillimes / 1000,
      adCpa: orderData.adCpaMillimes / 1000,
      courierFee: orderData.courierFeeMillimes / 1000,
      status: orderData.status,
      createdAt: "",
    };

    const net = calculateOrderNetContribution(order);
    const expectedNet = orderData.expectedNetContributionMillimes / 1000;
    assert.equal(Math.round(net * 10) / 10, Math.round(expectedNet * 10) / 10);
  }
});

test("Waterfall - Golden Fixture matches", () => {
  interface GoldenOrder {
    id: string;
    orderNumber: string;
    productNameSnapshot: string;
    unitPriceMillimes: number;
    unitCogsMillimes: number;
    shippingMillimes: number;
    returnShippingMillimes: number;
    adCpaMillimes: number;
    courierFeeMillimes: number;
    status: OrderStatus;
  }

  const orders: OrderItem[] = (goldenFixture.orders as GoldenOrder[]).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: "",
    city: "",
    productName: o.productNameSnapshot,
    salePrice: o.unitPriceMillimes / 1000,
    cogs: o.unitCogsMillimes / 1000,
    shipping: o.shippingMillimes / 1000,
    returnShipping: o.returnShippingMillimes / 1000,
    adCpa: o.adCpaMillimes / 1000,
    courierFee: o.courierFeeMillimes / 1000,
    status: o.status,
    createdAt: "",
  }));

  // Use actual ad spend from external ad platform (not sum of order adCpa)
  const paidAdSpend = goldenFixture.waterfall.actualAdSpendEntriesMillimes / 1000;
  const waterfall = calculatePLWaterfall(orders, paidAdSpend);
  const expected = goldenFixture.waterfall.expected;

  // Frontend returns TND, convert millimes expectations to TND for comparison
  assert.equal(waterfall.grossRevenue, expected.grossRevenueMillimes / 1000);
  assert.equal(waterfall.productCOGS, expected.productCOGSMillimes / 1000);
  assert.equal(waterfall.outboundShipping, expected.outboundShippingMillimes / 1000);
  assert.equal(waterfall.codRefusalPenalty, expected.codRefusalPenaltyMillimes / 1000);
  assert.equal(waterfall.trueNetProfit, expected.netRealizedContributionMillimes / 1000);
  assert.equal(waterfall.netRealizedContributionPercent, expected.netRealizedContributionPercent);
});

test("Waterfall identity: sum equals netRealizedContribution", () => {
  interface GoldenOrder {
    id: string;
    orderNumber: string;
    productNameSnapshot: string;
    unitPriceMillimes: number;
    unitCogsMillimes: number;
    shippingMillimes: number;
    returnShippingMillimes: number;
    adCpaMillimes: number;
    courierFeeMillimes: number;
    status: OrderStatus;
  }

  const orders: OrderItem[] = (goldenFixture.orders as GoldenOrder[]).map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: "",
    city: "",
    productName: o.productNameSnapshot,
    salePrice: o.unitPriceMillimes / 1000,
    cogs: o.unitCogsMillimes / 1000,
    shipping: o.shippingMillimes / 1000,
    returnShipping: o.returnShippingMillimes / 1000,
    adCpa: o.adCpaMillimes / 1000,
    courierFee: o.courierFeeMillimes / 1000,
    status: o.status,
    createdAt: "",
  }));

  const paidAdSpend = goldenFixture.waterfall.actualAdSpendEntriesMillimes / 1000;
  const waterfall = calculatePLWaterfall(orders, paidAdSpend);

  const computedNet =
    waterfall.grossRevenue -
    waterfall.productCOGS -
    waterfall.outboundShipping -
    waterfall.paidAdSpend -
    waterfall.codRefusalPenalty;

  // Both values are in TND, should match exactly
  assert.equal(waterfall.trueNetProfit, computedNet);
});

test("COD reconciliation identity", () => {
  const reco = calculateCourierReconciliation(12940, 1340);
  assert.equal(reco.expectedCashCollections, 14280);
  assert.equal(
    reco.expectedCashCollections,
    reco.bankWireSettled + reco.pendingCourierPayouts
  );
});

test("Edge cases - zero price and 100% refusal", () => {
  // Zero price
  const zeroPrice = calculateUnitEconomics({
    price: 0,
    cogs: 20,
    logistics: 10,
    cpa: 15,
    refusalRate: 0.2,
  });
  assert.equal(zeroPrice.maxTolerableCPA, 0);
  assert.equal(zeroPrice.breakEvenROAS, 0);
  assert.ok(zeroPrice.netProfitPerUnit < 0);

  // 100% refusal rate
  const fullRefusal = calculateUnitEconomics({
    price: 100,
    cogs: 25,
    logistics: 10,
    cpa: 20,
    refusalRate: 1.0,
  });
  // 100 - 25 - 10 - 20 - (1.0 * 20) = 25
  assert.equal(fullRefusal.netProfitPerUnit, 25);
});
