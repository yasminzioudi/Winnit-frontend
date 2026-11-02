import type { paths, components } from './schema';

export type { paths, components };

export type Schema<T extends keyof components['schemas']> = components['schemas'][T];

// Domain types from openapi schema
export type CreateOrderDto = Schema<'CreateOrderDto'>;
export type UpdateOrderStatusDto = Schema<'UpdateOrderStatusDto'>;
export type CreateAdSpendDto = Schema<'CreateAdSpendDto'>;
export type CreateExpenseDto = Schema<'CreateExpenseDto'>;
export type CreateScenarioDto = Schema<'CreateScenarioDto'>;
export type CreateSettlementDto = Schema<'CreateSettlementDto'>;
export type OptimizePriceDto = Schema<'OptimizePriceDto'>;

// Response types (from endpoints)
export type OrderResponse = paths['/api/v1/orders']['get']['responses']['200']['content']['application/json']['data'][number];
export type OrdersListResponse = paths['/api/v1/orders']['get']['responses']['200']['content']['application/json'];

export type AdSpendResponse = paths['/api/v1/ad-spend']['get']['responses']['200']['content']['application/json']['data'][number];
export type AdSpendListResponse = paths['/api/v1/ad-spend']['get']['responses']['200']['content']['application/json'];

export type ExpenseResponse = paths['/api/v1/expenses']['get']['responses']['200']['content']['application/json']['data'][number];
export type ExpensesListResponse = paths['/api/v1/expenses']['get']['responses']['200']['content']['application/json'];

export type ScenarioResponse = paths['/api/v1/scenarios']['get']['responses']['200']['content']['application/json']['data'][number];
export type ScenariosListResponse = paths['/api/v1/scenarios']['get']['responses']['200']['content']['application/json'];

export type SettlementResponse = paths['/api/v1/settlements']['get']['responses']['200']['content']['application/json']['data'][number];
export type SettlementsListResponse = paths['/api/v1/settlements']['get']['responses']['200']['content']['application/json'];

export type AnalyticsSummaryResponse = paths['/api/v1/analytics/summary']['get']['responses']['200']['content']['application/json'];
export type TimeseriesResponse = paths['/api/v1/analytics/timeseries']['get']['responses']['200']['content']['application/json'];
export type ProductAnalyticsItem = paths['/api/v1/analytics/by-product']['get']['responses']['200']['content']['application/json'][number];
export type CourierAnalyticsItem = paths['/api/v1/analytics/by-courier']['get']['responses']['200']['content']['application/json'][number];
export type GovernorateAnalyticsItem = paths['/api/v1/analytics/by-governorate']['get']['responses']['200']['content']['application/json'][number];
export type CODAnalyticsResponse = paths['/api/v1/analytics/cod']['get']['responses']['200']['content']['application/json'];
export type WinnerRankingItem = paths['/api/v1/analytics/winners']['get']['responses']['200']['content']['application/json'][number];

export type Insight = paths['/api/v1/insights']['get']['responses']['200']['content']['application/json'][number];
export type OptimizePriceResponse = paths['/api/v1/pricing/optimize']['post']['responses']['200']['content']['application/json'];

