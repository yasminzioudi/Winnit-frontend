import type { User } from "@/types/user";
import type { Product } from "@/types/product";
import { storageGet, storageSet } from "./storage";

const SCHEMA_VERSION = 2;
const SCHEMA_KEY = "winnit_schema_version";
const USERS_KEY = "winnit_users";
const PRODUCTS_KEY = "winnit_products";

/**
 * Pre-hashed mock passwords using SHA-256("salt" + password).
 * In dev: demo@winnit.tn → WinnitDemo2026!
 *         admin@winnit.tn → AdminWinnit2026!
 * Never store real passwords in seed data.
 */

const SEED_USERS: User[] = [
  {
    id: "usr_admin_001",
    fullName: "Slim Mansour",
    email: "admin@winnit.tn",
    // password: AdminWinnit2026! — hashed at runtime by initSeedData()
    passwordHash: "",
    salt: "a1b2c3d4e5f60000a1b2c3d4e5f60000",
    phone: "+21622000001",
    role: "admin",
    status: "active",
    createdAt: "2026-01-01T08:00:00Z",
    brandName: "WINNIT OS",
    sector: "Autre",
    governorate: "Tunis",
    city: "Tunis Centre",
    couriers: ["Aramex", "Yalidine"],
    estimatedMonthlyOrders: 500,
    notifEmail: true,
    notifSms: true,
    notifApp: true,
  },
  {
    id: "usr_demo_001",
    fullName: "Demo Marchand",
    email: "demo@winnit.tn",
    // password: WinnitDemo2026!
    passwordHash: "",
    salt: "b2c3d4e5f6a70001b2c3d4e5f6a70001",
    phone: "+21698765432",
    role: "merchant",
    status: "active",
    createdAt: "2026-01-15T10:00:00Z",
    brandName: "Maison Ambre Parfums",
    sector: "Beauté & Parfums",
    governorate: "Tunis",
    city: "La Marsa",
    couriers: ["Aramex", "Yalidine"],
    estimatedMonthlyOrders: 150,
    notifEmail: true,
    notifSms: false,
    notifApp: true,
  },
  {
    id: "usr_003",
    fullName: "Fatma Chaabane",
    email: "fatma.chaabane@gmail.com",
    passwordHash: "",
    salt: "c3d4e5f6a7b80002c3d4e5f6a7b80002",
    phone: "+21697654321",
    role: "merchant",
    status: "active",
    createdAt: "2026-02-10T09:00:00Z",
    brandName: "Chic Mode Tunis",
    sector: "Mode & Textile",
    governorate: "Sousse",
    city: "Hammam Sousse",
    couriers: ["Yalidine"],
    estimatedMonthlyOrders: 80,
    notifEmail: true,
    notifSms: true,
    notifApp: false,
  },
  {
    id: "usr_004",
    fullName: "Mehdi Trabelsi",
    email: "mehdi.trabelsi@outlook.com",
    passwordHash: "",
    salt: "d4e5f6a7b8c90003d4e5f6a7b8c90003",
    phone: "+21696543210",
    role: "merchant",
    status: "active",
    createdAt: "2026-02-20T11:00:00Z",
    brandName: "Tech Avenue",
    sector: "Électronique",
    governorate: "Sfax",
    city: "Sfax Centre",
    couriers: ["Aramex"],
    estimatedMonthlyOrders: 200,
    notifEmail: true,
    notifSms: false,
    notifApp: true,
  },
  {
    id: "usr_005",
    fullName: "Amal Jlassi",
    email: "amal.jlassi@gmail.com",
    passwordHash: "",
    salt: "e5f6a7b8c9d00004e5f6a7b8c9d00004",
    phone: "+21695432109",
    role: "merchant",
    status: "active",
    createdAt: "2026-03-05T14:00:00Z",
    brandName: "Bijoux Lumière",
    sector: "Bijoux & Accessoires",
    governorate: "Nabeul",
    city: "Hammamet",
    couriers: ["Yalidine", "Autre"],
    estimatedMonthlyOrders: 60,
    notifEmail: false,
    notifSms: true,
    notifApp: true,
  },
  {
    id: "usr_006",
    fullName: "Karim Sassi",
    email: "karim.sassi@gmail.com",
    passwordHash: "",
    salt: "f6a7b8c9d0e10005f6a7b8c9d0e10005",
    phone: "+21694321098",
    role: "merchant",
    status: "suspended",
    createdAt: "2026-03-15T16:00:00Z",
    brandName: "Fitness Pro TN",
    sector: "Sport & Fitness",
    governorate: "Ariana",
    city: "Ariana Ville",
    couriers: ["Aramex"],
    estimatedMonthlyOrders: 40,
    notifEmail: true,
    notifSms: false,
    notifApp: false,
  },
  {
    id: "usr_007",
    fullName: "Sonia Bouzid",
    email: "sonia.bouzid@yahoo.fr",
    passwordHash: "",
    salt: "a7b8c9d0e1f20006a7b8c9d0e1f20006",
    phone: "+21693210987",
    role: "merchant",
    status: "active",
    createdAt: "2026-04-01T09:30:00Z",
    brandName: "Maison & Déco Prestige",
    sector: "Maison & Déco",
    governorate: "Bizerte",
    city: "Bizerte Centre",
    couriers: ["Yalidine"],
    estimatedMonthlyOrders: 90,
    notifEmail: true,
    notifSms: true,
    notifApp: true,
  },
  {
    id: "usr_008",
    fullName: "Youssef Hammami",
    email: "youssef.hammami@gmail.com",
    passwordHash: "",
    salt: "b8c9d0e1f2a30007b8c9d0e1f2a30007",
    phone: "+21692109876",
    role: "merchant",
    status: "active",
    createdAt: "2026-04-10T11:00:00Z",
    brandName: "Gourmet Tunisie",
    sector: "Alimentation",
    governorate: "Monastir",
    city: "Monastir Centre",
    couriers: ["Aramex", "Yalidine"],
    estimatedMonthlyOrders: 120,
    notifEmail: true,
    notifSms: false,
    notifApp: true,
  },
];

const SEED_PRODUCTS: Product[] = [
  {
    id: "prd_001",
    userId: "usr_demo_001",
    name: "Aura d'Ambre Extrait (50ml)",
    sku: "AUR-EXT-50",
    category: "Parfums",
    imageUrl: "/images/aura-extrait.svg",
    sellingPrice: 129,
    cogs: 28,
    logisticsCostPerOrder: 7,
    returnShippingCost: 7,
    targetCPA: 21.4,
    expectedRefusalRate: 0.21,
    monthlyVolumeTarget: 80,
    courier: "Yalidine",
    status: "active",
    createdAt: "2026-01-20T10:00:00Z",
    updatedAt: "2026-10-01T12:00:00Z",
  },
  {
    id: "prd_002",
    userId: "usr_demo_001",
    name: "Aura d'Ambre Duo Bundle",
    sku: "AUR-DUO-01",
    category: "Parfums",
    imageUrl: "/images/aura-bundle.svg",
    sellingPrice: 229,
    cogs: 52,
    logisticsCostPerOrder: 7,
    returnShippingCost: 7,
    targetCPA: 26,
    expectedRefusalRate: 0.18,
    monthlyVolumeTarget: 40,
    courier: "Yalidine",
    status: "active",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-10-01T12:00:00Z",
  },
  {
    id: "prd_003",
    userId: "usr_demo_001",
    name: "Lumina Obsidian Articulated Desk Lamp",
    sku: "LUM-OBS-01",
    category: "Maison & Déco",
    imageUrl: "/images/lumina-lamp.svg",
    sellingPrice: 249,
    cogs: 65,
    logisticsCostPerOrder: 12,
    returnShippingCost: 12,
    targetCPA: 38,
    expectedRefusalRate: 0.15,
    monthlyVolumeTarget: 30,
    courier: "Aramex",
    status: "active",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-10-01T12:00:00Z",
  },
  {
    id: "prd_004",
    userId: "usr_demo_001",
    name: "Saddle Leather Travel Duffle",
    sku: "SAD-DUF-01",
    category: "Maroquinerie",
    imageUrl: "/images/leather-duffle.svg",
    sellingPrice: 320,
    cogs: 98,
    logisticsCostPerOrder: 10,
    returnShippingCost: 10,
    targetCPA: 45,
    expectedRefusalRate: 0.12,
    monthlyVolumeTarget: 20,
    courier: "Aramex",
    status: "active",
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-10-01T12:00:00Z",
  },
];

/**
 * Initialise seed data once. Called client-side only.
 * Uses schemaVersion to detect stale data and reset cleanly.
 * Passwords are hashed at init time using Web Crypto.
 * Returns an optional warning message if storage was reset.
 */
export async function initSeedData(
  onReset?: (msg: string) => void
): Promise<void> {
  if (typeof window === "undefined") return;

  const storedVersion = storageGet<number>(SCHEMA_KEY);

  if (storedVersion === SCHEMA_VERSION) return; // already up to date

  if (storedVersion !== null) {
    // Schema changed — reset all local data
    onReset?.(
      "Mise à jour du schéma de données : les données locales ont été réinitialisées."
    );
  }

  // Hash passwords at init time (Web Crypto is available client-side)
  const { hashPassword } = await import("./crypto");

  const usersWithHashes = await Promise.all(
    SEED_USERS.map(async (user) => {
      // Map user index to demo password
      const demoPasswords: Record<string, string> = {
        usr_admin_001: "AdminWinnit2026!",
        usr_demo_001: "WinnitDemo2026!",
      };
      const plaintext = demoPasswords[user.id] ?? "DefaultPass2026!";
      const passwordHash = await hashPassword(plaintext, user.salt);
      return { ...user, passwordHash };
    })
  );

  storageSet(USERS_KEY, usersWithHashes);
  storageSet(PRODUCTS_KEY, SEED_PRODUCTS);
  storageSet(SCHEMA_KEY, SCHEMA_VERSION);
}

export const STORAGE_KEYS = {
  SCHEMA: SCHEMA_KEY,
  USERS: USERS_KEY,
  PRODUCTS: PRODUCTS_KEY,
  SESSION: "winnit_session",
};
