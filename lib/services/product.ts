import type { Product } from "@/types/product";
import type { ProductRepository } from "@/types/product";
import { storageGet, storageSet } from "./storage";
import { STORAGE_KEYS } from "./seedData";

// INTEGRATION POINT: teammate product API
// Replace this localStorage implementation with Server Actions calling the shared product API.
// The ProductRepository interface is the contract — only this file needs to change.

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

function getAllProducts(): Product[] {
  return storageGet<Product[]>(STORAGE_KEYS.PRODUCTS) ?? [];
}

function saveProducts(products: Product[]): void {
  storageSet(STORAGE_KEYS.PRODUCTS, products);
}

export const productRepository: ProductRepository = {
  async list(userId: string): Promise<Product[]> {
    await delay();
    return getAllProducts().filter((p) => p.userId === userId);
  },

  async get(id: string): Promise<Product | null> {
    await delay(60);
    return getAllProducts().find((p) => p.id === id) ?? null;
  },

  async create(
    data: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    await delay();
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...data,
      id: `prd_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    const all = getAllProducts();
    saveProducts([...all, newProduct]);
    return newProduct;
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    await delay();
    const all = getAllProducts();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Produit introuvable.");
    const updated: Product = {
      ...all[idx],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    all[idx] = updated;
    saveProducts(all);
    return updated;
  },

  async remove(id: string): Promise<void> {
    await delay(80);
    const all = getAllProducts();
    saveProducts(all.filter((p) => p.id !== id));
  },
};
