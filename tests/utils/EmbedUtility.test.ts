/**
 * EmbedUtility — tests/utils/EmbedUtility.test.ts
 *
 * EmbedUtility creates pre-styled Discord embeds.
 * We use .toJSON() to inspect the embed's plain data.
 */
import { describe, it, expect } from "vitest";
import EmbedUtility from "../../src/lib/embed/EmbedUtility";

describe("EmbedUtility", () => {
  it("creates a success embed with a ✅ prefix in the description", () => {
    const embed = EmbedUtility.createSuccessEmbed("Operation complete");
    expect(embed.toJSON().description).toContain("✅");
    expect(embed.toJSON().description).toContain("Operation complete");
  });

  it("creates an error embed with a ❌ prefix in the description", () => {
    const embed = EmbedUtility.createErrorEmbed("Something went wrong");
    expect(embed.toJSON().description).toContain("❌");
  });

  it("creates a warning embed with a ⚠️ prefix in the description", () => {
    const embed = EmbedUtility.createWarningEmbed("Slow down");
    expect(embed.toJSON().description).toContain("⚠️");
  });

  it("always includes a timestamp on every embed", () => {
    const embed = EmbedUtility.createBaseEmbed();
    expect(embed.toJSON().timestamp).toBeTruthy();
  });
});
