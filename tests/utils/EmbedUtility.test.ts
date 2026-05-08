import { describe, it, expect } from "vitest";
import EmbedUtility from "../../src/lib/embed/EmbedUtility";
import { EEmbedColor } from "../../src/constants/embeds";

describe("EmbedUtility", () => {
  it("should create a base embed with default color", () => {
    const embed = EmbedUtility.createBaseEmbed();
    expect(embed.data.color).toBe(parseInt(EEmbedColor.Info.replace("#", ""), 16));
  });

  it("should create a success embed with checkmark", () => {
    const embed = EmbedUtility.createSuccessEmbed("Operation successful");
    expect(embed.data.description).toBe("✅ Operation successful");
    expect(embed.data.color).toBe(parseInt(EEmbedColor.Success.replace("#", ""), 16));
  });

  it("should create an error embed with cross mark", () => {
    const embed = EmbedUtility.createErrorEmbed("Operation failed");
    expect(embed.data.description).toBe("❌ Operation failed");
    expect(embed.data.color).toBe(parseInt(EEmbedColor.Error.replace("#", ""), 16));
  });

  it("should create an info embed with info mark", () => {
    const embed = EmbedUtility.createInfoEmbed("Information message");
    expect(embed.data.description).toBe("ℹ️ Information message");
    expect(embed.data.color).toBe(parseInt(EEmbedColor.Info.replace("#", ""), 16));
  });

  it("should create a warning embed with warning mark", () => {
    const embed = EmbedUtility.createWarningEmbed("Warning message");
    expect(embed.data.description).toBe("⚠️ Warning message");
    expect(embed.data.color).toBe(parseInt(EEmbedColor.Warning.replace("#", ""), 16));
  });

  it("should set user footer when user is provided", () => {
    const mockUser = {
      tag: "User#0001",
      displayAvatarURL: () => "http://avatar.url",
    } as any;

    const embed = EmbedUtility.createBaseEmbed({ user: mockUser });
    expect(embed.data.footer?.text).toBe("Requested by User#0001");
    expect(embed.data.footer?.icon_url).toBe("http://avatar.url");
  });
});
