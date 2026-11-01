/**
 * TanStack Query key factory for type-safe cache management
 */

export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    list: () => [...queryKeys.products.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
  },

  // Orders
  orders: {
    all: ['orders'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.orders.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
  },

  // Ad Spend
  adSpend: {
    all: ['ad-spend'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.adSpend.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.adSpend.all, 'detail', id] as const,
  },

  // Expenses
  expenses: {
    all: ['expenses'] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.expenses.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.expenses.all, 'detail', id] as const,
  },

  // Scenarios
  scenarios: {
    all: ['scenarios'] as const,
    list: () => [...queryKeys.scenarios.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.scenarios.all, 'detail', id] as const,
  },

  // Settlements
  settlements: {
    all: ['settlements'] as const,
    list: () => [...queryKeys.settlements.all, 'list'] as const,
    detail: (id: string) =>
      [...queryKeys.settlements.all, 'detail', id] as const,
  },

  // Analytics (workspace-scoped, short TTL)
  analytics: {
    all: ['analytics'] as const,
    summary: (params: { from: string; to: string; compare?: string }) =>
      [...queryKeys.analytics.all, 'summary', params] as const,
    waterfall: (params: { from: string; to: string }) =>
      [...queryKeys.analytics.all, 'waterfall', params] as const,
    timeseries: (params: {
      from: string;
      to: string;
      granularity: string;
      metrics: string;
    }) => [...queryKeys.analytics.all, 'timeseries', params] as const,
    winners: (params: { from: string; to: string }) =>
      [...queryKeys.analytics.all, 'winners', params] as const,
    geo: (params: { from: string; to: string }) =>
      [...queryKeys.analytics.all, 'geo', params] as const,
    couriers: (params: { from: string; to: string }) =>
      [...queryKeys.analytics.all, 'couriers', params] as const,
    cod: (params: { from: string; to: string }) =>
      [...queryKeys.analytics.all, 'cod', params] as const,
    insights: (params: { from: string; to: string }) =>
      [...queryKeys.analytics.all, 'insights', params] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    list: () => [...queryKeys.reports.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.reports.all, 'detail', id] as const,
  },
} as const;
