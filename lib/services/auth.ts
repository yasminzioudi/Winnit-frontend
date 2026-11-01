import type { User, PublicUser, AuthSession, MockSubscription } from "@/types/user";
import { storageGet, storageSet, storageRemove } from "./storage";
import { hashPassword, verifyPassword, generateSalt } from "./crypto";
import { STORAGE_KEYS } from "./seedData";

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Simulated async latency for realistic UX
const delay = (ms = 120) => new Promise((r) => setTimeout(r, ms));

function getAllUsers(): User[] {
  return storageGet<User[]>(STORAGE_KEYS.USERS) ?? [];
}

function saveUsers(users: User[]): void {
  storageSet(STORAGE_KEYS.USERS, users);
}

function toPublic(user: User): PublicUser {
  const { passwordHash: _hash, salt: _salt, ...pub } = user;
  void _hash;
  void _salt;
  return pub;
}

/** Generate a random token */
function generateToken(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ──────────────────────────────────────────────
// Auth operations
// ──────────────────────────────────────────────

export async function login(
  email: string,
  password: string
): Promise<{ user: PublicUser; session: AuthSession }> {
  await delay();
  const users = getAllUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.status === "suspended") {
    throw new Error("Email ou mot de passe incorrect.");
  }

  const valid = await verifyPassword(password, user.salt, user.passwordHash);
  if (!valid) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  const session: AuthSession = {
    token: generateToken(),
    userId: user.id,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };

  storageSet(STORAGE_KEYS.SESSION, session);
  return { user: toPublic(user), session };
}

export function logout(): void {
  storageRemove(STORAGE_KEYS.SESSION);
}

export function getSession(): AuthSession | null {
  const session = storageGet<AuthSession>(STORAGE_KEYS.SESSION);
  if (!session) return null;

  // Validate expiry
  if (new Date(session.expiresAt) <= new Date()) {
    storageRemove(STORAGE_KEYS.SESSION);
    return null;
  }
  return session;
}

export function getSessionUser(): PublicUser | null {
  const session = getSession();
  if (!session) return null;

  const users = getAllUsers();
  const user = users.find((u) => u.id === session.userId);
  return user ? toPublic(user) : null;
}

// ──────────────────────────────────────────────
// Registration
// ──────────────────────────────────────────────

export interface RegisterStep1Data {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterStep2Data {
  brandName: string;
  sector: User["sector"];
  governorate: User["governorate"];
  city: string;
  couriers: User["couriers"];
  estimatedMonthlyOrders: number;
}

export async function checkEmailAvailable(email: string): Promise<boolean> {
  await delay(80);
  const users = getAllUsers();
  return !users.some((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function register(
  step1: RegisterStep1Data,
  step2: RegisterStep2Data
): Promise<{ user: PublicUser; session: AuthSession }> {
  await delay();

  const users = getAllUsers();
  const exists = users.some(
    (u) => u.email.toLowerCase() === step1.email.toLowerCase()
  );
  if (exists) {
    throw new Error("Cette adresse email est déjà utilisée.");
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(step1.password, salt);

  const newUser: User = {
    id: `usr_${Date.now()}`,
    fullName: step1.fullName,
    email: step1.email,
    passwordHash,
    salt,
    phone: step1.phone,
    role: "merchant",
    status: "active",
    createdAt: new Date().toISOString(),
    brandName: step2.brandName,
    sector: step2.sector,
    governorate: step2.governorate,
    city: step2.city,
    couriers: step2.couriers,
    estimatedMonthlyOrders: step2.estimatedMonthlyOrders,
    notifEmail: true,
    notifSms: false,
    notifApp: true,
  };

  saveUsers([...users, newUser]);

  // Auto-login after registration
  const session: AuthSession = {
    token: generateToken(),
    userId: newUser.id,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
  storageSet(STORAGE_KEYS.SESSION, session);

  return { user: toPublic(newUser), session };
}

// ──────────────────────────────────────────────
// Subscription activation
// ──────────────────────────────────────────────

export async function activateSubscription(
  userId: string,
  paymentMethod: MockSubscription["paymentMethod"]
): Promise<void> {
  await delay(200);
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error("Utilisateur introuvable.");

  const subscription: MockSubscription = {
    plan: "PRO GROWTH",
    trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    paymentMethod,
    activatedAt: new Date().toISOString(),
  };

  users[idx] = { ...users[idx], subscription };
  saveUsers(users);
}
