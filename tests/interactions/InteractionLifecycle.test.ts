/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import InteractionLifecycle from "../../src/lib/interactions/InteractionLifecycle";
import logger from "../../src/lib/logger";

vi.mock("../../src/lib/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("InteractionLifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should track an interaction and expire it after timeout", async () => {
    const mockMessage = {
      id: "123",
      fetch: vi.fn().mockResolvedValue({
        editable: true,
        components: [{ toJSON: () => ({ components: [] }) }],
        content: "Test",
        embeds: [],
        edit: vi.fn().mockResolvedValue({}),
      }),
    } as any;

    InteractionLifecycle.track(mockMessage, "user1", 1000);

    // Fast-forward time
    vi.advanceTimersByTime(1000);

    // Wait for any pending promises to resolve (expire is async)
    await vi.runAllTicks();

    expect(mockMessage.fetch).toHaveBeenCalled();
  });

  it("should allow untracking before timeout", async () => {
    const mockMessage = {
      id: "123",
      fetch: vi.fn(),
    } as any;

    InteractionLifecycle.track(mockMessage, "user1", 1000);
    InteractionLifecycle.untrack("123");

    vi.advanceTimersByTime(1000);
    await vi.runAllTicks();

    expect(mockMessage.fetch).not.toHaveBeenCalled();
  });
});
