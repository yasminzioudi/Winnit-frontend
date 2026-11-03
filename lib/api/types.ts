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
export type OptimizePriceDto = Schema<'OptimizePriceDto'>;

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

export interface ExpensesListResponse {
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

export interface AnalyticsSummaryResponse {
  waterfall: WaterfallDto;
  kpis: KPIsDto;
  expenses: ExpenseSummaryDto;
  adSpendDeltaMillimes: number;
}

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
    pendingCourierPayoutsMillimes: number;
    bankWireSettledMillimes: number;
    expectedCashCollectionsMillimes: number;
    oldestPendingPayoutAgeDays: number;
    settledNetMillimes: number;
    totalExpectedMillimes: number;
  };
  aging: {
    days0to7Count: number;
    days8to14Count: number;
    days15to30Count: number;
    daysOver30Count: number;
  };
}

export interface WinnerRankingItemDto {
  productId: string;
  productName: string;
  score: number;
  label: string;
  totalOrders: number;
  deliveredOrders: number;
  grossRevenueMillimes: number;
}

export interface WinnersResponse {
  products: WinnerRankingItemDto[];
}

export type WinnerRankingItem = WinnerRankingItemDto;

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

