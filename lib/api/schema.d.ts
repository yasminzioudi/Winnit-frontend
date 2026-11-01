/**
 * Generated TypeScript types from OpenAPI
 * Run: npm run api:types
 * 
 * Placeholder until Phase 4 when backend OpenAPI is complete
 */

export interface Product {
  id: string;
  workspaceId: string;
  name: string;
  sku: string;
  category: string;
  imageUrl?: string;
  sellingPriceMillimes: number;
  cogsMillimes: number;
  logisticsCostPerOrderMillimes: number;
  returnShippingMillimes: number;
  targetCpaMillimes: number;
  expectedRefusalRate: number;
  monthlyVolumeTarget: number;
  courier: string;
  status: string;
}

// TODO: Phase 4 - generate from OpenAPI
