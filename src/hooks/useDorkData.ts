import { useState, useEffect } from "react";
import { getDorkData, type DorkStore } from "@/store/dork-sync";
import type { DorkOperator, DorkTemplate } from "@/types/types";

/** Load dork data from chrome.storage.local and reactively update when storage changes */
export function useDorkData() {
  const [operators, setOperators] = useState<DorkOperator[]>([]);
  const [templates, setTemplates] = useState<DorkTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDorkData()
      .then((data: DorkStore) => {
        setOperators(data.operators);
        setTemplates(data.templates);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("[Dorker] Failed to load data:", err);
        setLoading(false);
      });

    // Listen for storage changes (e.g. service worker synced new data)
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area !== "local") return;
      if (changes.dork_operators) setOperators(changes.dork_operators.newValue);
      if (changes.dork_templates) setTemplates(changes.dork_templates.newValue);
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  return { operators, templates, loading };
}
