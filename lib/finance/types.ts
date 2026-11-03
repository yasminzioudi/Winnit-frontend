export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "refused" | "cancelled";

export interface OrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  city: string;
  productName: string;
  salePrice: number;
  cogs: number;
  shipping: number;
  returnShipping?: number; // Added for reconciled waterfall
  adCpa: number;
  courierFee?: number;
  status: OrderStatus;
  createdAt: string;
}

export interface UnitEconomicsInput {
  price: number;
  cogs: number;
  logistics: number;
  cpa: number;
  refusalRate: number; // e.g. 0.21 for 21%
}

export interface UnitEconomicsResult {
  maxTolerableCPA: number;
  breakEvenROAS: number;
  netProfitPerUnit: number;
}

export interface PLWaterfallResult {
  grossRevenue: number;
  productCOGS: number;
  outboundShipping: number;
  paidAdSpend: number;
  codRefusalPenalty: number;
  trueNetProfit: number;
  netRealizedContributionPercent: number;
}

export interface CourierReconciliationResult {
  expectedCashCollections: number;
  bankWireSettled: number;
  pendingCourierPayouts: number;
}
