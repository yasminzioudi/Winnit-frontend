import type { paths, components } from './schema';

export type { paths, components };

export type Schema<T extends keyof components['schemas']> = components['schemas'][T];

// Domain types from openapi schema
export type CreateOrderDto = Schema<'CreateOrderDto'>;
export type UpdateOrderDto = Schema<'UpdateOrderDto'>;
export type ChangeStatusDto = Schema<'ChangeStatusDto'>;
export type CreateAdSpendDto = Schema<'CreateAdSpendDto'>;
export type UpdateAdSpendDto = Schema<'UpdateAdSpendDto'>;
export type CreateExpenseDto = Schema<'CreateExpenseDto'>;
export type UpdateExpenseDto = Schema<'UpdateExpenseDto'>;
export type CreateScenarioDto = Schema<'CreateScenarioDto'>;
export type CreateSettlementDto = Schema<'CreateSettlementDto'>;

// Response types - defined manually since backend Swagger doesn't export them

// Orders
export interface OrderResponse {
  _id: string;
  workspaceId: string;
  orderNumber: string;
  productId: string;
  productNameSnapshot: string;
  quantity: number;
  unitPriceMillimes: number;
  unitCogsMillimes: number;
  shippingMillimes: number;
  returnShippingMillimes: number;
  courierFeeMillimes: number;
  adCpaMillimes: number;
  courier: 'yalidine' | 'aramex';
  customer: {
    firstName: string;
    city: string;
    governorate: string;
  };
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'refused' | 'cancelled';
  statusHistory: Array<{
    status: string;
    changedAt: string;
    changedBy: string;
  }>;
  placedAt: string;
  deliveredAt?: string | null;
  netContributionMillimes: number;
  settlementId?: string;
  version: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersListResponse {
  data: OrderResponse[];
  meta: {
    nextCursor?: string;
  };
}

// Expenses
export interface ExpenseResponse {
  _id: string;
  workspaceId: string;
  category: string;
  description: string;
  amountMillimes: number;
  periodType: string;
  startDate: string;
  endDate?: string;
  version: number;
}

export interface ExpenseListResponse {
  data: ExpenseResponse[];
}

// AdSpend
export interface AdSpendResponse {
  _id: string;
  workspaceId: string;
  platform: string;
  campaignName: string;
  periodStart: string;
  periodEnd: string;
  spendMillimes: number;
  productId?: string;
  notes?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdSpendListResponse {
  data: AdSpendResponse[];
}
export interface WaterfallDto {
  grossRevenueMillimes: number;
  productCOGSMillimes: number;
  outboundShippingMillimes: number;
  paidAdSpendMillimes: number;
  codRefusalPenaltyMillimes: number;
  netRealizedContributionMillimes: number;
  netProfitMarginPercent: number;
}

export interface KPIsDto {
  totalOrdersCount: number;
  deliveredCount: number;
  refusedCount: number;
  deliveryRatePercent: number;
  refusalRatePercent: number;
  averageOrderValueMillimes: number;
}

export interface ExpenseSummaryDto {
  fixedExpensesMillimes: number;
  resultAfterFixedExpensesMillimes: number;
  netProfitMarginPercent: number;
}

// Analytics Summary (Profit OS)
export interface ProfitOSMetrics {
  waterfall: WaterfallDto;
  kpis: KPIsDto;
  expenses: ExpenseSummaryDto;
  adSpendDeltaMillimes: number;
}

export type AnalyticsSummaryResponse = ProfitOSMetrics;

export interface TimeseriesBucketDto {
  period: string;
  grossRevenueMillimes: number;
  netContributionMillimes: number;
  ordersCount: number;
  adSpendMillimes: number;
}

export interface TimeseriesResponse {
  buckets: TimeseriesBucketDto[];
  granularity: string;
}

export type TimeseriesBucket = TimeseriesBucketDto;

export interface ProductAnalyticsItemDto {
  productId: string;
  productName: string;
  totalOrders: number;
  deliveredOrders: number;
  refusedOrders: number;
  grossRevenueMillimes: number;
  netContributionMillimes: number;
  adSpendMillimes: number;
  roas: number;
}

export interface ProductAnalyticsResponse {
  products: ProductAnalyticsItemDto[];
}

export type ProductAnalyticsItem = ProductAnalyticsItemDto;

export interface CourierAnalyticsItemDto {
  courier: string;
  deliveredOrders: number;
  refusedOrders: number;
  totalRevenue: number;
  pendingPayoutsMillimes: number;
}

export interface CourierAnalyticsResponse {
  couriers: CourierAnalyticsItemDto[];
}

export type CourierAnalyticsItem = CourierAnalyticsItemDto;

export interface GovernorateAnalyticsItemDto {
  governorate: string;
  ordersCount: number;
  deliveredOrders: number;
  refusedOrders: number;
  grossRevenueMillimes: number;
}

export interface GovernorateAnalyticsResponse {
  governorates: GovernorateAnalyticsItemDto[];
}

export type GovernorateAnalyticsItem = GovernorateAnalyticsItemDto;

export interface CODAnalyticsResponse {
  summary: {
    totalOrdersCount: number;
    deliveredOrdersCount: number;
    totalRevenueMillimes: number;
    settledRevenueMillimes: number;
    pendingSettlementMillimes: number;
    pendingCourierPayoutsMillimes: number;
    bankWireSettledMillimes: number;
    expectedCashCollectionsMillimes: number;
  };
  aging: {
    days0to7Count: number;
    days8to14Count: number;
    days15to30Count: number;
    daysOver30Count: number;
  };
}

export type CODAnalytics = CODAnalyticsResponse;

// Settlements
export interface SettlementResponse {
  _id: string;
  workspaceId: string;
  courier: string;
  settlementDate: string;
  totalAmountMillimes: number;
  orderIds: string[];
  status: string;
  version: number;
}

export interface SettlementsListResponse {
  data: SettlementResponse[];
}

// Winners
export interface WinnerAnalysis {
  productId: string;
  productName: string;
  score: number;
  label: 'Winner' | 'À surveiller' | 'À couper' | 'Données insuffisantes';
  breakdown: {
    netMarginScore: number;
    deliveryRateScore: number;
    roasScore: number;
    volumeTrendScore: number;
  };
  totalOrders: number;
  deliveredOrders: number;
  refusedOrders: number;
  grossRevenueMillimes: number;
}

export interface WinnersListResponse {
  data: WinnerAnalysis[];
}

export type WinnerRankingItem = WinnerAnalysis;

// Scenarios
export interface Scenario {
  _id: string;
  workspaceId?: string;
  name: string;
  productId: string;
  unitPriceMillimes: number;
  unitCogsMillimes: number;
  shippingMillimes: number;
  adCpaMillimes: number;
  targetMarginPercent: number;
  notes?: string;
  version: number;
}

export interface ScenarioListResponse {
  data: Scenario[];
}

// Pricing optimizer
export interface OptimizePriceDto {
  basePriceMillimes: number;
  cogsMillimes: number;
  logisticsMillimes: number;
  cpaMillimes: number;
  baseVolume: number;
  elasticity: number;
  baseRefusalRate: number;
  refusalSensitivity: number;
  targetMarginPercent: number;
}

export interface PricingCurvePoint {
  priceMillimes: number;
  profitMillimes: number;
  refusalRate: number;
}

export interface OptimizePriceResponse {
  curve: PricingCurvePoint[];
  recommendedBand: {
    minMillimes: number;
    maxMillimes: number;
  };
  elasticOptimumMillimes: number;
  breakEvenPriceMillimes: number;
}

// Products (catalog)
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  imageUrl?: string;
  sellingPriceMillimes: number;
  cogsMillimes: number;
  logisticsCostPerOrderMillimes: number;
  targetCpaMillimes: number;
  expectedRefusalRate: number;
  courier: 'yalidine' | 'aramex';
  status: 'active' | 'inactive';
}

export interface ProductListResponse {
  data: Product[];
}

export interface InsightDto {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  evidence: string;
  suggestedAction: string;
  deepLink?: string;
}

export type InsightsResponse = InsightDto[];
export type Insight = InsightDto;

