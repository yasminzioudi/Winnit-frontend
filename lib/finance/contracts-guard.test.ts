import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * DRIFT GUARD: Ensures committed golden fixture in this repo matches the shared parent fixture.
 * If this test fails, the contracts have diverged.
 */
test("Golden Fixture Drift Guard - committed copy matches shared parent", () => {
  const committedPath = join(__dirname, "../../contracts-golden.json");
  const parentPath = join(__dirname, "../../../contracts/finance-golden.json");

  const committedContent = readFileSync(committedPath, "utf8");
  const parentContent = readFileSync(parentPath, "utf8");

  const committedHash = createHash("sha256").update(committedContent).digest("hex");
  const parentHash = createHash("sha256").update(parentContent).digest("hex");

  assert.equal(committedHash, parentHash, "Golden fixture has drifted! Update both copies.");
});
