import * as yaml from "js-yaml";
import type { DorkOperator, DorkTemplate } from "@/types/types";

// Hardcoded fallback data ships with the extension so it works offline on first install
import { DORK_OPERATORS as FALLBACK_OPERATORS, DORK_TEMPLATES as FALLBACK_TEMPLATES } from "./dork-data";

const YAML_URL =
  "https://raw.githubusercontent.com/garethcheyne/Dorker/refs/heads/main/dork.yaml";

const STORAGE_KEYS = {
  version: "dork_version",
  operators: "dork_operators",
  templates: "dork_templates",
  lastSync: "dork_last_sync",
} as const;

export interface DorkStore {
  version: string;
  operators: DorkOperator[];
  templates: DorkTemplate[];
}

interface DorkYaml {
  version: string;
  operators: DorkOperator[];
  templates: DorkTemplate[];
}

/** Get data from chrome.storage.local, falling back to hardcoded data */
export async function getDorkData(): Promise<DorkStore> {
  const result = await chrome.storage.local.get([
    STORAGE_KEYS.version,
    STORAGE_KEYS.operators,
    STORAGE_KEYS.templates,
  ]);

  if (result[STORAGE_KEYS.operators] && result[STORAGE_KEYS.templates]) {
    return {
      version: result[STORAGE_KEYS.version] ?? "unknown",
      operators: result[STORAGE_KEYS.operators],
      templates: result[STORAGE_KEYS.templates],
    };
  }

  // First run — seed storage with fallback data, then return it
  const fallback: DorkStore = {
    version: "bundled",
    operators: FALLBACK_OPERATORS,
    templates: FALLBACK_TEMPLATES,
  };
  await saveDorkData(fallback);
  return fallback;
}

/** Save data to chrome.storage.local */
async function saveDorkData(data: DorkStore): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEYS.version]: data.version,
    [STORAGE_KEYS.operators]: data.operators,
    [STORAGE_KEYS.templates]: data.templates,
    [STORAGE_KEYS.lastSync]: new Date().toISOString(),
  });
}

/**
 * Fetch dork.yaml from GitHub, compare version, update storage if newer.
 * Returns true if data was updated.
 */
export async function syncDorkData(): Promise<boolean> {
  try {
    const response = await fetch(YAML_URL, { cache: "no-cache" });
    if (!response.ok) {
      console.warn(`[Dorker] Sync failed: HTTP ${response.status}`);
      return false;
    }

    const text = await response.text();
    const parsed = yaml.load(text) as DorkYaml;

    if (!parsed?.operators || !parsed?.templates) {
      console.warn("[Dorker] Sync failed: invalid YAML structure");
      return false;
    }

    const remoteVersion = String(parsed.version);

    // Check current version
    const current = await chrome.storage.local.get(STORAGE_KEYS.version);
    const localVersion = current[STORAGE_KEYS.version] as string | undefined;

    if (localVersion === remoteVersion) {
      console.log(`[Dorker] Already up to date (v${remoteVersion})`);
      return false;
    }

    // Version changed — update storage
    await saveDorkData({
      version: remoteVersion,
      operators: parsed.operators,
      templates: parsed.templates,
    });

    console.log(`[Dorker] Synced: ${localVersion ?? "none"} → ${remoteVersion}`);
    return true;
  } catch (err) {
    console.warn("[Dorker] Sync error:", err);
    return false;
  }
}
