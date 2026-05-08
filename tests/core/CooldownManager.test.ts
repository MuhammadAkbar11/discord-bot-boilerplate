/**
 * CooldownManager — tests/core/CooldownManager.test.ts
 *
 * CooldownManager persists command cooldowns in MongoDB.
 * We mock the DB model so these tests run without a real database.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import CooldownManager from "../../src/lib/cooldowns/CooldownManager";
import CooldownModel from "../../src/base/models/Cooldown";

// Replace the Mongoose model with lightweight stubs
vi.mock("../../src/base/models/Cooldown", () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

describe("CooldownManager", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when no cooldown record exists for the user", async () => {
    (CooldownModel.findOne as any).mockResolvedValue(null);

    const remaining = await CooldownManager.getRemainingCooldown("user1", "ping");
    expect(remaining).toBeNull();
  });

  it("returns the seconds remaining when cooldown is still active", async () => {
    const futureExpiry = new Date(Date.now() + 5000); // expires in 5 s
    (CooldownModel.findOne as any).mockResolvedValue({ expiresAt: futureExpiry });

    const remaining = await CooldownManager.getRemainingCooldown("user1", "ping");
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(5);
  });

  it("returns null when the cooldown record is already expired", async () => {
    const pastExpiry = new Date(Date.now() - 1000); // expired 1 s ago
    (CooldownModel.findOne as any).mockResolvedValue({ expiresAt: pastExpiry });

    const remaining = await CooldownManager.getRemainingCooldown("user1", "ping");
    expect(remaining).toBeNull();
  });

  it("returns null instead of throwing when the database errors", async () => {
    (CooldownModel.findOne as any).mockRejectedValue(new Error("DB offline"));

    const remaining = await CooldownManager.getRemainingCooldown("user1", "ping");
    expect(remaining).toBeNull(); // fail-open: never block the user
  });
});
