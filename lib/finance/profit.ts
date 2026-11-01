import type {
  OrderItem,
  UnitEconomicsInput,
  UnitEconomicsResult,
  PLWaterfallResult,
  CourierReconciliationResult,
} from "./types.ts";

/**
 * Calculates net contribution for a single order.
 * - Delivered / Shipped / Confirmed: price - COGS - shipping - adCpa - courierFee
 * - Refused: parcel returns to stock so COGS is recovered, but outbound shipping and ad CPA are lost: -(shipping + adCpa)
 */
export function calculateOrderNetContribution(order: OrderItem): number {
  const courierFee = order.courierFee || 0;

  if (order.status === "refused") {
    // In COD refusal, customer does not pay (0 revenue), COGS returns to inventory,
    // but the merchant loses outbound shipping and ad CPA spent to acquire the customer.
    const loss = order.shipping + order.adCpa;
    return -Number(loss.toFixed(1));
  }

  const net =
    order.salePrice - order.cogs - order.shipping - order.adCpa - courierFee;
  return Number(net.toFixed(1));
}

/**
 * Product Unit Economics Simulator (matches Screenshot 1 calibration):
 * - maxTolerableCPA = price - COGS - logistics
 * - breakEvenROAS = price / maxTolerableCPA
 * - netProfitPerUnit = price - COGS - logistics - CPA - (refusalRate * CPA)
 * Note: the last term accounts for wasted ad spend on doorstep-refused packages.
 */
export function calculateUnitEconomics(
  input: UnitEconomicsInput
): UnitEconomicsResult {
  const { price, cogs, logistics, cpa, refusalRate } = input;

  if (price <= 0) {
    return {
      maxTolerableCPA: 0,
      breakEvenROAS: 0,
      netProfitPerUnit: -(cogs + logistics + cpa),
    };
  }

  const maxTolerableCPA = Math.max(0, price - cogs - logistics);
  const breakEvenROAS =
    maxTolerableCPA > 0 ? Number((price / maxTolerableCPA).toFixed(2)) : 0;

  // Wasted ad spend on refused parcels: refusalRate * cpa
  const wastedCPA = refusalRate * cpa;
  const netProfitPerUnit = Number(
    (price - cogs - logistics - cpa - wastedCPA).toFixed(1)
  );

  return {
    maxTolerableCPA: Number(maxTolerableCPA.toFixed(1)),
    breakEvenROAS,
    netProfitPerUnit,
  };
}

/**
 * Derives P&L Waterfall from orders list ensuring the mathematical identity:
 * trueNetProfit = grossRevenue - productCOGS - outboundShipping - paidAdSpend - codRefusalPenalty
 * and netRealizedContributionPercent = (trueNetProfit / grossRevenue) * 100
 */
export function calculatePLWaterfall(orders: OrderItem[]): PLWaterfallResult {
  let grossRevenue = 0;
  let productCOGS = 0;
  let outboundShipping = 0;
  let paidAdSpend = 0;
  let codRefusalPenalty = 0;

  for (const order of orders) {
    outboundShipping += order.shipping;
    paidAdSpend += order.adCpa;

    if (order.status === "refused") {
      // Penalty for refusal: return logistics fee or courier handling
      const courierFee = order.courierFee || 0;
      codRefusalPenalty += courierFee > 0 ? courierFee : order.shipping;
    } else {
      grossRevenue += order.salePrice;
      productCOGS += order.cogs;
      if (order.courierFee) {
        codRefusalPenalty += order.courierFee;
      }
    }
  }

  // Exact identity sum
  const trueNetProfit =
    grossRevenue -
    productCOGS -
    outboundShipping -
    paidAdSpend -
    codRefusalPenalty;

  const netRealizedContributionPercent =
    grossRevenue > 0
      ? Number(((trueNetProfit / grossRevenue) * 100).toFixed(1))
      : 0;

  return {
    grossRevenue: Math.round(grossRevenue),
    productCOGS: Math.round(productCOGS),
    outboundShipping: Math.round(outboundShipping),
    paidAdSpend: Math.round(paidAdSpend),
    codRefusalPenalty: Math.round(codRefusalPenalty),
    trueNetProfit: Math.round(trueNetProfit),
    netRealizedContributionPercent,
  };
}

/**
 * Courier reconciliation math identity:
 * expectedCashCollections = bankWireSettled + pendingCourierPayouts
 */
export function calculateCourierReconciliation(
  bankWireSettled: number,
  pendingCourierPayouts: number
): CourierReconciliationResult {
  const expectedCashCollections = bankWireSettled + pendingCourierPayouts;
  return {
    expectedCashCollections,
    bankWireSettled,
    pendingCourierPayouts,
  };
}
