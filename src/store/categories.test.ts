import { describe, it, expect } from "vitest";
import { CATEGORIES, CATEGORY_ORDER } from "@/store/categories";
import { DORK_OPERATORS } from "@/store/dork-data";
import type { Category } from "@/types/types";

const ALL_CATEGORIES: Category[] = ["domain", "url", "content", "file", "meta", "time", "logic"];

describe("categories", () => {
  it("CATEGORIES has an entry for every valid category", () => {
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORIES[cat]).toBeDefined();
      expect(CATEGORIES[cat].label).toBeTruthy();
      expect(CATEGORIES[cat].icon).toBeDefined();
      expect(CATEGORIES[cat].color).toBeTruthy();
      expect(CATEGORIES[cat].bgColor).toBeTruthy();
    }
  });

  it("CATEGORY_ORDER contains all categories exactly once", () => {
    expect(CATEGORY_ORDER).toHaveLength(ALL_CATEGORIES.length);
    for (const cat of ALL_CATEGORIES) {
      expect(CATEGORY_ORDER).toContain(cat);
    }
    expect(new Set(CATEGORY_ORDER).size).toBe(CATEGORY_ORDER.length);
  });

  it("CATEGORY_ORDER matches the set of categories used by operators", () => {
    const usedCats = new Set(DORK_OPERATORS.map((op) => op.category));
    for (const cat of usedCats) {
      expect(CATEGORY_ORDER).toContain(cat);
    }
  });

  it("every category label is a non-empty capitalized string", () => {
    for (const cat of CATEGORY_ORDER) {
      const label = CATEGORIES[cat].label;
      expect(label.length).toBeGreaterThan(0);
      expect(label[0]).toBe(label[0].toUpperCase());
    }
  });
});
