import { describe, it, expect, vi, beforeEach } from "vitest";
import ErrorHandler from "../../src/lib/errors/ErrorHandler";
import { AppError } from "../../src/lib/errors/AppError";
import logger from "../../src/lib/logger";

vi.mock("../../src/lib/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("ErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should log normal errors with generic message", async () => {
    const error = new Error("Database failed");
    await ErrorHandler.handle(error);

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "application_error",
        error: expect.objectContaining({
          message: "Database failed",
        }),
      }),
      "Database failed",
    );
  });

  it("should log AppError with specific user message", async () => {
    const error = new AppError("Internal fail", "Something went wrong!", true);
    await ErrorHandler.handle(error);

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "application_error",
        error: expect.objectContaining({
          isOperational: true,
        }),
      }),
      "Internal fail",
    );
  });

  it("should attempt to reply to interaction if provided", async () => {
    const error = new Error("Fail");
    const mockInteraction = {
      isRepliable: () => true,
      replied: false,
      deferred: false,
      reply: vi.fn().mockResolvedValue({}),
      user: { id: "1" },
    } as any;

    await ErrorHandler.handle(error, { interaction: mockInteraction });

    expect(mockInteraction.reply).toHaveBeenCalled();
  });
});
