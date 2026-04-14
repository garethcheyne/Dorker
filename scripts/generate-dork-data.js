#!/usr/bin/env node
// Reads DORK.md (YAML blocks) and generates src/store/dork-data.ts
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { parse as parseYaml } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const md = readFileSync(resolve(root, "DORK.md"), "utf-8");

// Extract YAML blocks: first is operators, second is templates
const blocks = [...md.matchAll(/```yaml\n([\s\S]*?)```/g)].map((m) => m[1].trim());

if (blocks.length < 2) {
  console.error("DORK.md must contain at least 2 YAML code blocks (operators, templates)");
  process.exit(1);
}

const operators = parseYaml(blocks[0]);
const templates = parseYaml(blocks[1]);

console.log(`  Operators: ${operators.length}`);
console.log(`  Templates: ${templates.length}`);

const output = `// AUTO-GENERATED from DORK.md — do not edit manually
// Run: npm run generate
import type { DorkOperator, DorkTemplate } from "@/types/types";

export const DORK_OPERATORS: DorkOperator[] = ${JSON.stringify(operators, null, 2)};

export const DORK_TEMPLATES: DorkTemplate[] = ${JSON.s