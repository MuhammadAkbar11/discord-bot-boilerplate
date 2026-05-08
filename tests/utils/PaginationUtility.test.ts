import { describe, it, expect } from "vitest";
import PaginationUtility from "../../src/lib/pagination/PaginationUtility";

describe("PaginationUtility", () => {
  const mockItems = [1, 2, 3, 4, 5];

  it("should calculate pages correctly", () => {
    const result = PaginationUtility.getPaginationResult(mockItems, 1, 2);
    expect(result.totalPages).toBe(3);
    expect(result.items).toEqual([1, 2]);
  });

  it("should clamp page to valid range", () => {
    const resultUnder = PaginationUtility.getPaginationResult(mockItems, 0, 2);
    expect(resultUnder.page).toBe(1);

    const resultOver = PaginationUtility.getPaginationResult(mockItems, 5, 2);
    expect(resultOver.page).toBe(3);
  });

  it("should handle empty items", () => {
    const result = PaginationUtility.getPaginationResult([], 1, 2);
    expect(result.totalPages).toBe(1);
    expect(result.items).toEqual([]);
  });

  it("should generate correct footer text", () => {
    const text = PaginationUtility.getFooterText(1, 5);
    expect(text).toBe("Page 1 of 5");
  });

  it("should create navigation row with disabled buttons on edges", () => {
    const row = PaginationUtility.createNavigationRow(
      1,
      1,
      (p) => `test:${p}`,
    );
    const buttons = row.components;

    // Both should be disabled if there is only 1 page
    expect((buttons[0].data as any).disabled).toBe(true);
    expect((buttons[1].data as any).disabled).toBe(true);
  });
});
