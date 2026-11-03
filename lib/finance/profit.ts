import type {
  OrderItem,
  UnitEconomicsInput,
  UnitEconomicsResult,
  PLWaterfallResult,
  CourierReconciliationResult,
} from "./types.ts";

/**
 * ROUNDING RULE: Integer millimes throughout, Math.round() on rate multiplications (half away from zero).
 * TND display rounds to 0.1 (done in lib/format).
 */

/**
 * Calculates net contribution for a single order.
 * - Delivered/Shipped/Confirmed: price*qty - COGS*qty - shipping - adCpa - courierFee
 * - Refused: parcel returns to stock (COGS recovered), lose outbound shipping + return shipping + adCpa
 *   Formula: -(shipping + returnShipping + adCpa)
 */
export function calculateOrderNetContribution(order: OrderItem): number {
  const courierFee = order.courierFee || 0;

  if (order.status === "refused") {
    // COGS returns to inventory (0 revenue), lose shipping + return shipping + adCpa
    const returnShipping = order.returnShipping || 0;
    return -(order.shipping + returnShipping + order.adCpa);
  }

  // Delivered, shipped, confirmed
  const net =
    order.salePrice - order.cogs - order.shipping - order.adCpa - courierFee;
  return net;
}

/**
 * Product Unit Economics Simulator:
 * - maxTolerableCPA = price - COGS - logistics
 * - breakEvenROAS = price / maxTolerableCPA
 * - netProfitPerUnit = price - COGS - logistics - CPA - (refusalRate * CPA)
 * Note: the last term accounts for wasted ad spend on doorstep-refused packages.
 *
 * Calibration (section 5): price 129, COGS 28, logistics 14, CPA 22, refusal 0.21
 *   -> maxTolerableCPA 87, breakEvenROAS 1.48, netProfitPerUnit 60.38 (60.4 display)
 * 
 * PRECISION FIX: Work in millimes internally, convert to TND for output
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
    maxTolerableCPA > 0 ? Math.round((price / maxTolerableCPA) * 100) / 100 : 0;

  // Work in millimes for precision: convert TND to millimes, compute, convert back
  const priceMillimes = Math.round(price * 1000);
  const cogsMillimes = Math.round(cogs * 1000);
  const logisticsMillimes = Math.round(logistics * 1000);
  const cpaMillimes = Math.round(cpa * 1000);
  
  // Wasted ad spend on refused parcels: refusalRate * cpa (in millimes)
  const wastedCPAMillimes = Math.round(refusalRate * cpaMillimes);
  const netProfitPerUnitMillimes = 
    priceMillimes - cogsMillimes - logisticsMillimes - cpaMillimes - wastedCPAMillimes;

  return {
    maxTolerableCPA,
    breakEvenROAS,
    netProfitPerUnit: netProfitPerUnitMillimes / 1000, // Convert back to TND
  };
}

/**
 * Derives P&L Waterfall from orders list over REALIZED orders only.
 * REALIZED = delivered + refused. PROJECTED = confirmed + shipped (excluded).
 * 
 * Identity: grossRevenue - productCOGS - outboundShipping - paidAdSpend - codRefusalPenalty = trueNetProfit
 * 
 * IMPORTANT: 
 * - outboundShipping = shipping of DELIVERED orders + courierFee of DELIVERED orders.
 * - Refused order shipping goes ONLY to codRefusalPenalty, never counted twice.
 * - paidAdSpend is ACTUAL ad platform bills (external parameter), NOT sum of order.adCpa
 * 
 * PRECISION FIX: Work in millimes internally (multiply TND by 1000), then convert back
 */
export function calculatePLWaterfall(orders: OrderItem[], paidAdSpend: number): PLWaterfallResult {
  let grossRevenueMillimes = 0;
  let productCOGSMillimes = 0;
  let outboundShippingMillimes = 0;
  let codRefusalPenaltyMillimes = 0;

  for (const order of orders) {
    const isRealized = order.status === "delivered" || order.status === "refused";
    if (!isRealized) continue;

    if (order.status === "delivered") {
      grossRevenueMillimes += Math.round(order.salePrice * 1000);
      productCOGSMillimes += Math.round(order.cogs * 1000);
      outboundShippingMillimes += Math.round((order.shipping + (order.courierFee || 0)) * 1000);
    } else if (order.status === "refused") {
      // Refused: shipping + return shipping penalty (COGS recovered, no revenue)
      const returnShipping = order.returnShipping || 0;
      codRefusalPenaltyMillimes += Math.round((order.shipping + returnShipping) * 1000);
    }
  }

  const paidAdSpendMillimes = Math.round(paidAdSpend * 1000);

  // Exact identity sum in millimes
  const trueNetProfitMillimes =
    grossRevenueMillimes -
    productCOGSMillimes -
    outboundShippingMillimes -
    paidAdSpendMillimes -
    codRefusalPenaltyMillimes;

  const netRealizedContributionPercent =
    grossRevenueMillimes > 0
      ? Math.round((trueNetProfitMillimes / grossRevenueMillimes) * 1000) / 10
      : 0;

  return {
    grossRevenue: grossRevenueMillimes / 1000,
    productCOGS: productCOGSMillimes / 1000,
    outboundShipping: outboundShippingMillimes / 1000,
    paidAdSpend: paidAdSpendMillimes / 1000,
    codRefusalPenalty: codRefusalPenaltyMillimes / 1000,
    trueNetProfit: trueNetProfitMillimes / 1000,
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

/**
 * Calculate max tolerable CPA in millimes.
 * Formula: price - COGS - logistics
 * Calibration: 129000 - 28000 - 14000 = 87000 millimes (87.0 TND)
 */
export function calculateMaxTolerableCPA(
  priceMillimes: number,
  cogsMillimes: number,
  logisticsMillimes: number,
  refusalRate: number
): number {
  return Math.max(0, priceMillimes - cogsMillimes - logisticsMillimes);
}

/**
 * Calculate break-even ROAS.
 * Formula: price / maxTolerableCPA
 * Calibration: 129000 / 87000 = 1.48
 */
export function calculateBreakEvenROAS(
  priceMillimes: number,
  cogsMillimes: number,
  logisticsMillimes: number,
  refusalRate: number
): number {
  const maxCpa = calculateMaxTolerableCPA(priceMillimes, cogsMillimes, logisticsMillimes, refusalRate);
  if (maxCpa === 0) return 0;
  return Math.round((priceMillimes / maxCpa) * 100) / 100;
}

/**
 * Calculate net profit per unit in millimes.
 * Formula: price - COGS - logistics - CPA - (refusalRate/100 * CPA)
 * Calibration: 129000 - 28000 - 14000 - 22000 - (0.21 * 22000) = 60380 millimes (60.4 TND)
 */
export function calculateNetProfitPerUnit(
  priceMillimes: number,
  cogsMillimes: number,
  logisticsMillimes: number,
  cpaMillimes: number,
  refusalRate: number
): number {
  const wastedCPA = Math.round((refusalRate / 100) * cpaMillimes);
  return priceMillimes - cogsMillimes - logisticsMillimes - cpaMillimes - wastedCPA;
}
