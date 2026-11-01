import test from "node:test";
import assert from "node:assert/strict";
import type { OrderItem } from "./types.ts";
import {
  calculateOrderNetContribution,
  calculateUnitEconomics,
  calculatePLWaterfall,
  calculateCourierReconciliation,
} from "./profit.ts";

test("Product Profit Simulator - calibration matches Screenshot 1", () => {
  const result = calculateUnitEconomics({
    price: 129,
    cogs: 28,
    logistics: 14,
    cpa: 22,
    refusalRate: 0.21,
  });

  // maxTolerableCPA = 129 - 28 - 14 = 87.0
  assert.equal(result.maxTolerableCPA, 87.0);

  // breakEvenROAS = 129 / 87.0 = 1.4827... -> 1.48
  assert.equal(result.breakEvenROAS, 1.48);

  // netProfitPerUnit = 129 - 28 - 14 - 22 - (0.21 * 22) = 60.38 -> 60.4
  assert.equal(result.netProfitPerUnit, 60.4);
});

test("Order-Level Unit Economics Ledger - calibration matches Screenshot 2", () => {
  // ORD-9841: Yassine M. | Aura d'Ambre Extrait | Price 129, COGS 28, Ship 7, CPA 21.4 -> +72.6
  const ord9841: OrderItem = {
    id: "1",
    orderNumber: "ORD-9841",
    customerName: "Yassine M.",
    city: "Tunis / Marsa",
    productName: "Aura d'Ambre Extrait (50ml)",
    salePrice: 129,
    cogs: 28,
    shipping: 7,
    adCpa: 21.4,
    status: "delivered",
    createdAt: "2026-10-26T10:00:00Z",
  };
  assert.equal(calculateOrderNetContribution(ord9841), 72.6);

  // ORD-9840: Sarra B. | Aura d'Ambre Extrait | Price 129, COGS 28, Ship 8, CPA 21.4 -> +71.6
  const ord9840: OrderItem = {
    id: "2",
    orderNumber: "ORD-9840",
    customerName: "Sarra B.",
    city: "Sousse",
    productName: "Aura d'Ambre Extrait (50ml)",
    salePrice: 129,
    cogs: 28,
    shipping: 8,
    adCpa: 21.4,
    status: "delivered",
    createdAt: "2026-10-26T09:30:00Z",
  };
  assert.equal(calculateOrderNetContribution(ord9840), 71.6);

  // ORD-9839: Karim T. | Lumina Desk Lamp | Price 249, COGS 65, Ship 12, CPA 38, courierFee 3.5 -> +130.5
  const ord9839: OrderItem = {
    id: "3",
    orderNumber: "ORD-9839",
    customerName: "Karim T.",
    city: "Sfax",
    productName: "Lumina Obsidian Articulated Desk Lamp",
    salePrice: 249,
    cogs: 65,
    shipping: 12,
    adCpa: 38,
    courierFee: 3.5,
    status: "shipped",
    createdAt: "2026-10-26T08:15:00Z",
  };
  assert.equal(calculateOrderNetContribution(ord9839), 130.5);

  // ORD-9838: Amine K. | Refused order | Ship 8, CPA 21.4 -> -29.4
  const ord9838: OrderItem = {
    id: "4",
    orderNumber: "ORD-9838",
    customerName: "Amine K.",
    city: "Bizerte",
    productName: "Aura d'Ambre Extrait (50ml)",
    salePrice: 129,
    cogs: 28,
    shipping: 8,
    adCpa: 21.4,
    status: "refused",
    createdAt: "2026-10-25T14:20:00Z",
  };
  assert.equal(calculateOrderNetContribution(ord9838), -29.4);

  // ORD-9837: Nadia F. | Aura Duo Bundle | Price 229, COGS 52, Ship 7, CPA 26 -> +144.0
  const ord9837: OrderItem = {
    id: "5",
    orderNumber: "ORD-9837",
    customerName: "Nadia F.",
    city: "Nabeul",
    productName: "Aura d'Ambre Duo Bundle",
    salePrice: 229,
    cogs: 52,
    shipping: 7,
    adCpa: 26,
    status: "confirmed",
    createdAt: "2026-10-25T11:00:00Z",
  };
  assert.equal(calculateOrderNetContribution(ord9837), 144.0);

  // ORD-9836: Mehdi Z. | Saddle Leather Duffle | Price 320, COGS 98, Ship 10, CPA 45, courierFee 5.2 -> +161.8
  const ord9836: OrderItem = {
    id: "6",
    orderNumber: "ORD-9836",
    customerName: "Mehdi Z.",
    city: "Tunis / Ennasr",
    productName: "Saddle Leather Travel Duffle",
    salePrice: 320,
    cogs: 98,
    shipping: 10,
    adCpa: 45,
    courierFee: 5.2,
    status: "delivered",
    createdAt: "2026-10-24T16:45:00Z",
  };
  assert.equal(calculateOrderNetContribution(ord9836), 161.8);
});

test("Financial Identities & Invariants hold strictly", () => {
  const sampleOrders: OrderItem[] = [
    {
      id: "1",
      orderNumber: "ORD-1",
      customerName: "A",
      city: "Tunis",
      productName: "Item 1",
      salePrice: 200,
      cogs: 50,
      shipping: 10,
      adCpa: 30,
      status: "delivered",
      createdAt: "2026-10-01",
    },
    {
      id: "2",
      orderNumber: "ORD-2",
      customerName: "B",
      city: "Sousse",
      productName: "Item 2",
      salePrice: 150,
      cogs: 40,
      shipping: 10,
      adCpa: 25,
      status: "refused",
      createdAt: "2026-10-02",
    },
    {
      id: "3",
      orderNumber: "ORD-3",
      customerName: "C",
      city: "Sfax",
      productName: "Item 3",
      salePrice: 300,
      cogs: 80,
      shipping: 15,
      adCpa: 40,
      courierFee: 5,
      status: "shipped",
      createdAt: "2026-10-03",
    },
  ];

  const waterfall = calculatePLWaterfall(sampleOrders);

  // 1. Waterfall steps sum exactly to trueNetProfit
  const derivedSum =
    waterfall.grossRevenue -
    waterfall.productCOGS -
    waterfall.outboundShipping -
    waterfall.paidAdSpend -
    waterfall.codRefusalPenalty;
  assert.equal(waterfall.trueNetProfit, derivedSum);

  // 2. Net Realized Contribution % = (trueNetProfit / grossRevenue) * 100
  const expectedPercent = Number(
    ((waterfall.trueNetProfit / waterfall.grossRevenue) * 100).toFixed(1)
  );
  assert.equal(waterfall.netRealizedContributionPercent, expectedPercent);

  // 3. Courier reconciliation identity
  const reco = calculateCourierReconciliation(12940, 1340);
  assert.equal(
    reco.expectedCashCollections,
    reco.bankWireSettled + reco.pendingCourierPayouts
  );
  assert.equal(reco.expectedCashCollections, 14280);
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
  // price - cogs - logistics - cpa - 1.0 * cpa = 100 - 25 - 10 - 20 - 20 = 25.0
  assert.equal(fullRefusal.netProfitPerUnit, 25.0);
});
