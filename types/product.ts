/** Product status */
export type ProductStatus = "active" | "draft" | "archived";

/** Courier per product */
export type ProductCourier = "Aramex" | "Yalidine" | "Autre";

/** Full product record */
export interface Product {
  id: string;
  userId: string;
  name: string;
  sku: string;
  category: string;
  imageUrl?: string;
  sellingPrice: number;
  cogs: number;
  /** Shipping + packaging + fees per order */
  logisticsCostPerOrder: number;
  returnShippingCost: number;
  targetCPA: number;
  /** As a fraction e.g. 0.21 for 21% */
  expectedRefusalRate: number;
  monthlyVolumeTarget: number;
  courier: ProductCourier;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

// INTEGRATION POINT: teammate product API
// Replace ProductRepository methods with Server Actions calling the shared product API.
export interface ProductRepository {
  list(userId: string): Promise<Product[]>;
  get(id: string): Promise<Product | null>;
  create(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>;
  update(id: string, data: Partial<Product>): Promise<Product>;
  remove(id: string): Promise<void>;
}
