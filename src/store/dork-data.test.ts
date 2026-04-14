import { describe, it, expect } from "vitest";
import { DORK_OPERATORS, DORK_TEMPLATES } from "@/store/dork-data";
import type { Category } from "@/types/types";

const VALID_CATEGORIES: Category[] = ["domain", "url", "content", "file", "meta", "time", "logic"];

describe("dork-data: operators", () => {
  it("should have at least 20 operators", () => {
    expect(DORK_OPERATORS.length).toBeGreaterThanOrEqual(20);
  });

  it("every operator has required fields", () => {
    for (const op of DORK_OPERATORS) {
      expect(op.keyword).toBeTruthy();
      expect(op.description).toBeTruthy();
      expect(op.example).toBeTruthy();
      expect(op.category).toBeTruthy();
      expect(typeof op.placeholder).toBe("string");
    }
  });

  it("every operator has a valid category", () => {
    for (const op of DORK_OPERATORS) {
      expect(VALID_CATEGORIES).toContain(op.category);
    }
  });

  it("has no duplicate keywords", () => {
    const keywords = DORK_OPERATORS.map((op) => op.keyword);
    expect(new Set(keywords).size).toBe(keywords.length);
  });

  it("covers all categories", () => {
    const cats = new Set(DORK_OPERATORS.map((op) => op.category));
    for (const c of VALID_CATEGORIES) {
      expect(cats.has(c)).toBe(true);
    }
  });
});

describe("dork-data: templates", () => {
  it("should have at least 10 templates", () => {
    expect(DORK_TEMPLATES.length).toBeGreaterThanOrEqual(10);
  });

  it("every template has required fields", () => {
    for (const t of DORK_TEMPLATES) {
      expect(t.name).toBeTruthy();
      expect(t.query).toBeTruthy();
      expect(t.description).toBeTruthy();
    }
  });

  it("has no duplicate template names", () => {
    const names = DORK_TEMPLATES.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every template query contains a {domain} placeholder", () => {
    for (const t of DORK_TEMPLATES) {
      expect(t.query).toContain("{domain}");
    }
  });
});
