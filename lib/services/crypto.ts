/**
 * Password utilities for the mock auth service.
 * Uses Web Crypto SHA-256 + a per-user random salt.
 * ⚠️ THIS IS A MOCK — not real security. SHA-256 without a real KDF (bcrypt/argon2)
 *    is NOT safe for production. Replace with a real backend auth system.
 */

/** Generate a random hex salt */
export function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Hash a password with SHA-256 using the given salt (async, uses Web Crypto) */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Verify a password against a stored hash */
export async function verifyPassword(
  password: string,
  salt: string,
  storedHash: string
): Promise<boolean> {
  const hash = await hashPassword(password, salt);
  return hash === storedHash;
}

/** Password strength score 0-4 */
export function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4
  const capped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const labels = ["Très faible", "Faible", "Moyen", "Fort", "Très fort"];
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];
  return { score: capped, label: labels[capped], color: colors[capped] };
}

/** Validate Tunisian phone: must start with +216 followed by exactly 8 digits */
export function isValidTunisianPhone(phone: string): boolean {
  return /^\+216[0-9]{8}$/.test(phone.replace(/\s/g, ""));
}

/** Check if promo code is valid (client-side mock) */
export function isValidPromoCode(code: string): boolean {
  return code.trim().toUpperCase() === "LAUNCH2026";
}
