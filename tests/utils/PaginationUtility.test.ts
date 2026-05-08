/**
 * PaginationUtility — tests/utils/PaginationUtility.test.ts
 *
 * PaginationUtility slices an array into pages and builds footer text.
 */
import { describe, it, expect } from "vitest";
import PaginationUtility from "../../src/lib/pagination/PaginationUtility";

describe("PaginationUtility", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it("returns the first 3 items on page 1 with pageSize 3", () => {
    const result = PaginationUtility.getPaginationResult(items, 1, 3);
    expect(result.items).toEqual([1, 2, 3]);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(4);
  });

  it("returns the correct slice for a middle page", () => {
    const result = PaginationUtility.getPaginationResult(items, 2, 3);
    expect(result.items).toEqual([4, 5, 6]);
  });

  it("clamps out-of-bounds page to the last page", () => {
    const result = PaginationUtility.getPaginationResult(items, 999, 3);
    expect(result.page).toBe(result.totalPages);
  });

  it("generates a footer string like 'Page 1 of 4'", () => {
    const footer = PaginationUtility.getFooterText(1, 4);
    expect(footer).toBe("Page 1 of 4");
  });

  it("appends extra text to the footer when provided", () => {
    const footer = PaginationUtility.getFooterText(2, 5, "10 results");
    expect(footer).toBe("Page 2 of 5 • 10 results");
  });
});
