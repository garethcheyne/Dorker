import { describe, it, expect, vi, beforeEach } from "vitest";
import * as yaml from "js-yaml";
import fs from "fs";
import path from "path";
import type { DorkOperator, DorkTemplate, Category } from "@/types/types";

const VALID_CATEGORIES: Category[] = ["domain", "url", "content", "file", "meta", "time", "logic"];

// ── Test the YAML source file directly ──
const yamlPath = path.resolve(__dirname, "../../dork.yaml");
const yamlContent = fs.readFileSync(yamlPath, "utf-8");
const parsed = yaml.load(yamlContent) as {
  version: string;
  operators: DorkOperator[];
  templates: DorkTemplate[];
};

describe("dork.yaml: structure", () => {
  it("parses without error", () => {
    expect(parsed).toBeDefined();
  });

  it("has a version field", () => {
    expect(parsed.version).toBeTruthy();
  });

  it("has operators array", () => {
    expect(Array.isArray(parsed.operators)).toBe(true);
    expect(parsed.operators.length).toBeGreaterThan(0);
  });

  it("has templates array", () => {
    expect(Array.isArray(parsed.templates)).toBe(true);
    expect(parsed.templates.length).toBeGreaterThan(0);
  });
});

describe("dork.yaml: operators", () => {
  it("every operator has all required fields", () => {
    for (const op of parsed.operators) {
      expect(op.keyword, `missing keyword`).toBeTruthy();
      expect(op.description, `${op.keyword} missing description`).toBeTruthy();
      expect(op.example, `${op.keyword} missing example`).toBeTruthy();
      expect(op.category, `${op.keyword} missing category`).toBeTruthy();
      expect(typeof op.placeholder, `${op.keyword} placeholder not string`).toBe("string");
    }
  });

  it("every operator has a valid category", () => {
    for (const op of parsed.operators) {
      expect(VALID_CATEGORIES, `${op.keyword} has invalid category: ${op.category}`).toContain(op.category);
    }
  });

  it("no duplicate keywords", () => {
    const keywords = parsed.operators.map((op) => op.keyword);
    const dupes = keywords.filter((k, i) => keywords.indexOf(k) !== i);
    expect(dupes, `duplicate keywords: ${dupes.join(", ")}`).toHaveLength(0);
  });
});

describe("dork.yaml: templates", () => {
  it("every template has all required fields", () => {
    for (const t of parsed.templates) {
      expect(t.name, "missing template name").toBeTruthy();
      expect(t.query, `${t.name} missing query`).toBeTruthy();
      expect(t.description, `${t.name} missing description`).toBeTruthy();
    }
  });

  it("no duplicate template names", () => {
    const names = parsed.templates.map((t) => t.name);
    const dupes = names.filter((n, i) => names.indexOf(n) !== i);
    expect(dupes, `duplicate names: ${dupes.join(", ")}`).toHaveLength(0);
  });

  it("every template query references {domain}", () => {
    for (const t of parsed.templates) {
      expect(t.query, `${t.name} missing {domain}`).toContain("{domain}");
    }
  });
});

// ── Test sync logic with mocked chrome APIs ──
describe("dork-sync: getDorkData", () => {
  let storage: Record<string, unknown>;

  beforeEach(() => {
    storage = {};

    // Mock chrome.storage.local
    const chromeStorageMock = {
      get: vi.fn(async (keys: string[]) => {
        const result: Record<string, unknown> = {};
        for (const k of keys) {
          if (k in storage) result[k] = storage[k];
        }
        return result;
      }),
      set: vi.fn(async (items: Record<string, unknown>) => {
        Object.assign(storage, items);
      }),
    };

    vi.stubGlobal("chrome", {
      storage: {
        local: chromeStorageMock,
        onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
      },
    });
  });

  it("returns fallback data on first run and seeds storage", async () => {
    const { getDorkData } = await import("@/store/dork-sync");
    const data = await getDorkData();

    expect(data.version).toBe("bundled");
    expect(data.operators.length).toBeGreaterThan(0);
    expect(data.templates.length).toBeGreaterThan(0);
    // Should have been saved to storage
    expect(storage["dork_operators"]).toBeDefined();
    expect(storage["dork_templates"]).toBeDefined();
  });

  it("returns stored data when available", async () => {
    storage = {
      dork_version: "2026.01.01",
      dork_operators: [{ keyword: "test:", description: "test", example: "test", category: "domain", placeholder: "" }],
      dork_templates: [{ name: "Test", query: "site:{domain}", description: "test" }],
    };

    // Re-import to use fresh mock
    const mod = await import("@/store/dork-sync");
    const data = await mod.getDorkData();

    expect(data.version).toBe("2026.01.01");
    expect(data.operators).toHaveLength(1);
    expect(data.operators[0].keyword).toBe("test:");
  });
});

describe("dork-sync: syncDorkData", () => {
  let storage: Record<string, unknown>;

  beforeEach(() => {
    storage = { dork_version: "old-version" };

    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: vi.fn(async (keys: string | string[]) => {
            const keyArr = typeof keys === "string" ? [keys] : keys;
            const result: Record<string, unknown> = {};
            for (const k of keyArr) {
              if (k in storage) result[k] = storage[k];
            }
            return result;
          }),
          set: vi.fn(async (items: Record<string, unknown>) => {
            Object.assign(storage, items);
          }),
        },
        onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
      },
    });
  });

  it("returns false on fetch failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    const { syncDorkData } = await import("@/store/dork-sync");
    const result = await syncDorkData();
    expect(result).toBe(false);
  });

  it("returns false when version matches", async () => {
    storage.dork_version = "2026.04.14.2337";
    const yamlText = `version: 2026.04.14.2337\noperators:\n  - keyword: "site:"\n    description: test\n    example: test\n    category: domain\n    placeholder: ""\ntemplates:\n  - name: Test\n    query: "site:{domain}"\n    description: test`;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => yamlText }));
    const { syncDorkData } = await import("@/store/dork-sync");
    const result = await syncDorkData();
    expect(result).toBe(false);
  });

  it("returns true and updates storage when version differs", async () => {
    storage.dork_version = "old-version";
    const yamlText = `version: 2026.04.14.2337\noperators:\n  - keyword: "site:"\n    description: test\n    example: test\n    category: domain\n    placeholder: ""\ntemplates:\n  - name: Test\n    query: "site:{domain}"\n    description: test`;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => yamlText }));
    const { syncDorkData } = await import("@/store/dork-sync");
    const result = await syncDorkData();
    expect(result).toBe(true);
    expect(storage["dork_version"]).toBe("2026.04.14.2337");
  });

  it("returns false on invalid YAML structure", async () => {
    const yamlText = `version: 1\nfoo: bar`;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => yamlText }));
    const { syncDorkData } = await import("@/store/dork-sync");
    const result = await syncDorkData();
    expect(result).toBe(false);
  });

  it("returns false when fetch throws a network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    const { syncDorkData } = await import("@/store/dork-sync");
    const result = await syncDorkData();
    expect(result).toBe(false);
  });

  it("returns false when YAML has operators but no templates", async () => {
    const yamlText = `version: 2\noperators:\n  - keyword: "site:"\n    description: test\n    example: test\n    category: domain\n    placeholder: ""`;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => yamlText }));
    const { syncDorkData } = await import("@/store/dork-sync");
    const result = await syncDorkData();
    expect(result).toBe(false);
  });

  it("returns false when YAML has templates but no operators", async () => {
    const yamlText = `version: 2\ntemplates:\n  - name: Test\n    query: "site:{domain}"\n    description: test`;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => yamlText }));
    const { syncDorkData } = await import("@/store/dork-sync");
    const result = await syncDorkData();
    expect(result).toBe(false);
  });

  it("stores lastSync timestamp after successful sync", async () => {
    storage.dork_version = "old";
    const yamlText = `version: new\noperators:\n  - keyword: "site:"\n    description: test\n    example: test\n    category: domain\n    placeholder: ""\ntemplates:\n  - name: Test\n    query: "site:{domain}"\n    description: test`;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => yamlText }));
    const { syncDorkData } = await import("@/store/dork-sync");
    await syncDorkData();
    expect(storage["dork_last_sync"]).toBeTruthy();
    expect(() => new Date(storage["dork_last_sync"] as string)).not.toThrow();
  });
});
