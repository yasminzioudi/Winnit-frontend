/** User roles */
export type UserRole = "admin" | "merchant";

/** User account status */
export type UserStatus = "active" | "suspended";

/** Tunisian governorates */
export const TUNISIAN_GOVERNORATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès", "Gafsa",
  "Jendouba", "Kairouan", "Kasserine", "Kébili", "Le Kef", "Mahdia",
  "La Manouba", "Médenine", "Monastir", "Nabeul", "Sfax", "Sidi Bouzid",
  "Siliana", "Sousse", "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const;

export type TunisianGovernorate = (typeof TUNISIAN_GOVERNORATES)[number];

/** Courier options */
export type Courier = "Aramex" | "Yalidine" | "Autre";

/** Business sector */
export type Sector =
  | "Mode & Textile"
  | "Beauté & Parfums"
  | "Électronique"
  | "Maison & Déco"
  | "Sport & Fitness"
  | "Alimentation"
  | "Bijoux & Accessoires"
  | "Autre";

/** Stored user record */
export interface User {
  id: string;
  fullName: string;
  email: string;
  /** Hashed password (SHA-256 + salt mock, not real security) */
  passwordHash: string;
  salt: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  /** Business profile */
  brandName: string;
  sector: Sector;
  governorate: TunisianGovernorate;
  city: string;
  couriers: Courier[];
  estimatedMonthlyOrders: number;
  /** Notification preferences */
  notifEmail: boolean;
  notifSms: boolean;
  notifApp: boolean;
  /** Mock subscription */
  subscription?: MockSubscription;
}

/** Mock trial / subscription state */
export interface MockSubscription {
  plan: "PRO GROWTH";
  trialEndsAt: string;
  paymentMethod: "card" | "flouci" | "virement";
  activatedAt: string;
}

/** Public-safe user shape exposed to the UI */
export type PublicUser = Omit<User, "passwordHash" | "salt">;

/** Auth session stored in localStorage */
export interface AuthSession {
  token: string;
  userId: string;
  expiresAt: string;
}
