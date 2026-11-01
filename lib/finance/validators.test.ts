import type { User } from "../../types/user.ts";
import { passwordStrength, isValidTunisianPhone, isValidPromoCode } from "../services/crypto.ts";
import test from "node:test";
import assert from "node:assert/strict";

test("passwordStrength - scoring", () => {
  // Empty string → score 0
  assert.equal(passwordStrength("").score, 0);
  // Short lowercase → score 0
  assert.equal(passwordStrength("abc").score, 0);
  // 8+ chars → score 1
  assert.ok(passwordStrength("abcdefgh").score >= 1);
  // 8+ with digit → score 2
  assert.ok(passwordStrength("abcdefg1").score >= 2);
  // 12+ with uppercase + digit → score 4
  assert.equal(passwordStrength("Abcdefg123!!").score, 4);
});

test("isValidTunisianPhone - validation", () => {
  assert.equal(isValidTunisianPhone("+21699123456"), true);
  assert.equal(isValidTunisianPhone("+216 99 123 456"), true); // spaces stripped
  assert.equal(isValidTunisianPhone("+21612"), false); // too short
  assert.equal(isValidTunisianPhone("0099123456"), false); // no +216 prefix
  assert.equal(isValidTunisianPhone("+216991234567"), false); // 9 digits, too long
  assert.equal(isValidTunisianPhone("+216abc12345"), false); // non-digit chars
});

test("isValidPromoCode - case-insensitive check", () => {
  assert.equal(isValidPromoCode("LAUNCH2026"), true);
  assert.equal(isValidPromoCode("launch2026"), true);
  assert.equal(isValidPromoCode("  LAUNCH2026  "), true);
  assert.equal(isValidPromoCode("LAUNCH2025"), false);
  assert.equal(isValidPromoCode(""), false);
});

// Satisfy TypeScript: use the imported type to avoid lint error
const _typeGuard: User | null = null;
void _typeGuard;
