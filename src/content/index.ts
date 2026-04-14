import type { DorkOperator, DorkTemplate, Category } from "@/types/types";
// CSS is loaded via manifest content_scripts.css — no JS import needed

// ── Data loaded from chrome.storage via service worker ──
let DORK_OPERATORS: DorkOperator[] = [];
let DORK_TEMPLATES: DorkTemplate[] = [];

async function loadDorkData() {
  try {
    const data = await chrome.runtime.sendMessage({ action: "get-dork-data" });
    if (data?.operators) DORK_OPERATORS = data.operators;
    if (data?.templates) DORK_TEMPLATES = data.templates;
  } catch (err) {
    console.warn("[Dorker] Failed to load data from service worker:", err);
  }
}

// Reactively update when storage changes (service worker synced new data)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes.dork_operators) DORK_OPERATORS = changes.dork_operators.newValue;
  if (changes.dork_templates) DORK_TEMPLATES = changes.dork_templates.newValue;
});

// SVG icons for content script (can't use React components in vanilla DOM)
const CATEGORY_SVGS: Record<Category, string> = {
  domain: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
  url: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  content: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  file: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
  meta: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>',
  time: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  logic: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
};
const TEMPLATE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/></svg>';

// ── Autocomplete Dropdown ──
class DorkAutocomplete {
  private dropdown: HTMLDivElement;
  private itemsContainer: HTMLDivElement | null = null;
  private hint: HTMLDivElement;
  private badge: HTMLDivElement;
  private _badgeTimer: ReturnType<typeof setTimeout> | null = null;
  private onSelect: (item: DorkOperator | DorkTemplate, mode: string) => void;

  activeIndex = -1;
  items: (DorkOperator | DorkTemplate)[] = [];
  mode = "operators";

  constructor(onSelect: (item: DorkOperator | DorkTemplate, mode: string) => void) {
    this.onSelect = onSelect;

    this.dropdown = document.createElement("div");
    this.dropdown.className = "dorker-dropdown";
    this.dropdown.setAttribute("role", "listbox");
    document.body.appendChild(this.dropdown);

    this.hint = document.createElement("div");
    this.hint.className = "dorker-hint";
    this.hint.innerHTML = `
      <span><kbd>↑</kbd><kbd>↓</kbd> navigate <kbd>Enter</kbd> select <kbd>Esc</kbd> close</span>
      <span><kbd>Tab</kbd> templates</span>
    `;

    this.badge = document.createElement("div");
    this.badge.className = "dorker-badge";
    this.badge.innerHTML = 'Press <span class="dorker-badge-key">/</span> for dork operators · <span class="dorker-badge-key">Tab</span> for templates';
    document.body.appendChild(this.badge);
  }

  show(filteredItems: (DorkOperator | DorkTemplate)[], anchorEl: HTMLElement, mode = "operators") {
    this.items = filteredItems;
    this.mode = mode;
    this.activeIndex = 0;
    if (filteredItems.length === 0) { this.hide(); return; }
    this._render();
    this._position(anchorEl);
    this.dropdown.classList.add("dorker-visible");
  }

  hide() {
    this.dropdown.classList.remove("dorker-visible");
    this.items = [];
    this.activeIndex = -1;
  }

  hideBadge() { this.badge.classList.remove("dorker-visible"); }

  showBadge(anchorEl: HTMLElement) {
    const rect = anchorEl.getBoundingClientRect();
    this.badge.style.top = (rect.top >= 32 ? rect.top - 28 : rect.bottom + 4) + "px";
    this.badge.style.left = rect.left + "px";
    this.badge.classList.add("dorker-visible");
    if (this._badgeTimer) clearTimeout(this._badgeTimer);
    this._badgeTimer = setTimeout(() => this.hideBadge(), 3000);
  }

  isVisible() { return this.dropdown.classList.contains("dorker-visible"); }
  navigateUp() { if (!this.items.length) return; this.activeIndex = (this.activeIndex - 1 + this.items.length) % this.items.length; this._updateActive(); this._scrollIntoView(); }
  navigateDown() { if (!this.items.length) return; this.activeIndex = (this.activeIndex + 1) % this.items.length; this._updateActive(); this._scrollIntoView(); }

  selectCurrent() {
    if (this.activeIndex >= 0 && this.activeIndex < this.items.length) {
      const item = this.items[this.activeIndex];
      this.hide();
      this.onSelect(item, this.mode);
    }
  }

  private _position(anchorEl: HTMLElement) {
    const rect = anchorEl.getBoundingClientRect();
    this.dropdown.style.left = rect.left + "px";
    this.dropdown.style.width = rect.width + "px";
    this.dropdown.style.top = "-9999px";
    this.dropdown.classList.add("dorker-visible");
    const h = this.dropdown.offsetHeight;
    this.dropdown.classList.remove("dorker-visible");
    if (rect.top >= h + 8) {
      this.dropdown.style.top = (rect.top - h - 4) + "px";
      this.dropdown.style.borderRadius = "14px 14px 0 0";
    } else {
      this.dropdown.style.top = (rect.bottom + 4) + "px";
      this.dropdown.style.borderRadius = "0 0 14px 14px";
    }
  }

  private _render() {
    this.dropdown.innerHTML = "";
    this.dropdown.appendChild(this.hint);
    this.itemsContainer = document.createElement("div");
    this.itemsContainer.className = "dorker-items";
    if (this.mode === "templates") {
      const hdr = document.createElement("div");
      hdr.className = "dorker-section-header";
      hdr.textContent = "Dork Templates";
      this.itemsContainer.appendChild(hdr);
      this.items.forEach((item, i) => this.itemsContainer!.appendChild(this._createItem(item, i, true)));
    } else {
      const grouped: Partial<Record<Category, DorkOperator[]>> = {};
      for (const item of this.items as DorkOperator[]) {
        (grouped[item.category] ??= []).push(item);
      }
      const order: Category[] = ["domain", "url", "content", "file", "time", "meta", "logic"];
      for (const cat of order) {
        if (!grouped[cat]) continue;
        for (const item of grouped[cat]!) {
          this.itemsContainer.appendChild(this._createItem(item, this.items.indexOf(item), false));
        }
      }
    }
    this.dropdown.appendChild(this.itemsContainer);
  }

  private _createItem(item: DorkOperator | DorkTemplate, index: number, isTemplate: boolean) {
    const el = document.createElement("div");
    el.className = "dorker-item" + (isTemplate ? " dorker-template" : "") + (index === this.activeIndex ? " dorker-active" : "");
    el.dataset.index = String(index);

    const iconSvg = isTemplate ? TEMPLATE_SVG : (CATEGORY_SVGS[(item as DorkOperator).category] || CATEGORY_SVGS.domain);
    const kw = isTemplate ? (item as DorkTemplate).name : (item as DorkOperator).keyword;
    const desc = isTemplate ? (item as DorkTemplate).description : (item as DorkOperator).description;
    const example = isTemplate ? (item as DorkTemplate).query : (item as DorkOperator).example;

    el.innerHTML = `
      <span class="dorker-item-icon">${iconSvg}</span>
      <div class="dorker-item-content">
        <span class="dorker-item-keyword">${this._esc(kw)}</span>
        <div class="dorker-item-description">${this._esc(desc)}</div>
        <div class="dorker-item-example">${this._esc(example)}</div>
      </div>
    `;
    el.addEventListener("mouseenter", () => { this.activeIndex = index; this._updateActive(); });
    el.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); this.activeIndex = index; this.selectCurrent(); });
    return el;
  }

  private _updateActive() {
    this.dropdown.querySelectorAll(".dorker-item").forEach((el) => {
      (el as HTMLElement).classList.toggle("dorker-active", parseInt((el as HTMLElement).dataset.index!) === this.activeIndex);
    });
  }

  private _scrollIntoView() {
    this.dropdown.querySelector(".dorker-item.dorker-active")?.scrollIntoView({ block: "nearest" });
  }

  private _esc(s: string) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
}

// ── Input Handler ──
class DorkInputHandler {
  private textarea: HTMLTextAreaElement | HTMLInputElement;
  private autocomplete: DorkAutocomplete;
  private showingTemplates = false;
  private _suppressInput = false;

  constructor(textarea: HTMLTextAreaElement | HTMLInputElement, autocomplete: DorkAutocomplete) {
    this.textarea = textarea;
    this.autocomplete = autocomplete;
  }

  attach() {
    this.textarea.addEventListener("input", this._onInput);
    this.textarea.addEventListener("keydown", this._onKeyDown, true);
    this.textarea.addEventListener("blur", this._onBlur);
    this.textarea.addEventListener("focus", this._onFocus);
  }

  private _onFocus = () => {
    if (this.textarea.value.trim() === "") this.autocomplete.showBadge(this.textarea);
  };

  private _onBlur = () => {
    setTimeout(() => { this.autocomplete.hide(); this.autocomplete.hideBadge(); }, 200);
  };

  private _onInput = () => {
    this.autocomplete.hideBadge();
    if (this._suppressInput || this.showingTemplates) return;
    const token = this._getCurrentToken();
    if (!token || !token.text.startsWith("/")) { this.autocomplete.hide(); return; }
    const query = token.text.substring(1).toLowerCase();
    const filtered = query.length === 0
      ? DORK_OPERATORS
      : DORK_OPERATORS.filter(op => op.keyword.toLowerCase().startsWith(query));
    filtered.length > 0
      ? this.autocomplete.show(filtered, this.textarea, "operators")
      : this.autocomplete.hide();
  };

  private _onKeyDown = (e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === "Tab" && !ke.shiftKey) {
      if (!this.autocomplete.isVisible()) {
        ke.preventDefault(); ke.stopPropagation();
        this.showingTemplates = true;
        this.autocomplete.show(DORK_TEMPLATES, this.textarea, "templates");
        return;
      } else if (this.showingTemplates) {
        ke.preventDefault(); ke.stopPropagation();
        this.showingTemplates = false;
        this.autocomplete.hide();
        return;
      }
    }
    if (!this.autocomplete.isVisible()) return;
    switch (ke.key) {
      case "ArrowDown": ke.preventDefault(); ke.stopPropagation(); this.autocomplete.navigateDown(); break;
      case "ArrowUp": ke.preventDefault(); ke.stopPropagation(); this.autocomplete.navigateUp(); break;
      case "Enter": ke.preventDefault(); ke.stopPropagation(); this.autocomplete.selectCurrent(); this.showingTemplates = false; break;
      case "Escape": ke.preventDefault(); ke.stopPropagation(); this.autocomplete.hide(); this.showingTemplates = false; break;
    }
  };

  insertOperator(item: DorkOperator | DorkTemplate, mode: string) {
    if (mode === "templates") {
      let query = (item as DorkTemplate).query;
      const siteMatch = this.textarea.value.match(/site:(\S+)/);
      query = query.replace(/\{domain\}/g, siteMatch ? siteMatch[1] : "example.com");
      this._setValue(query, query.length);
      return;
    }
    const token = this._getCurrentToken();
    const value = this.textarea.value;
    const kw = (item as DorkOperator).keyword;
    if (token) {
      const nv = value.substring(0, token.start) + kw + value.substring(token.end);
      this._setValue(nv, token.start + kw.length);
    } else {
      const pos = this.textarea.selectionStart || 0;
      const nv = value.substring(0, pos) + kw + value.substring(pos);
      this._setValue(nv, pos + kw.length);
    }
  }

  private _getCurrentToken() {
    const value = this.textarea.value;
    const cursor = this.textarea.selectionStart || 0;
    if (cursor === 0) return null;
    let start = cursor;
    while (start > 0 && value[start - 1] !== " " && value[start - 1] !== "\n") start--;
    const text = value.substring(start, cursor);
    return text.length ? { text, start, end: cursor } : null;
  }

  private _setValue(value: string, cursor: number) {
    this._suppressInput = true;
    this.textarea.focus();
    this.textarea.value = value;
    this.textarea.selectionStart = this.textarea.selectionEnd = cursor;
    this.textarea.dispatchEvent(new Event("input", { bubbles: true }));
    this.textarea.dispatchEvent(new Event("change", { bubbles: true }));
    setTimeout(() => { this._suppressInput = false; }, 0);
  }
}

// ── FAB (draggable, toggle panel) ──
import logoUrl from "../../assets/dork.png";

const FAB_POS_KEY = "dorker_fab_position";
const DRAG_THRESHOLD = 5; // px — clicks smaller than this don't count as drag

function createFab() {
  if (document.getElementById("dorker-fab")) return;
  const fab = document.createElement("button");
  fab.id = "dorker-fab";
  fab.title = "Toggle Dork Panel";

  const img = document.createElement("img");
  img.src = logoUrl;
  img.alt = "Dorker";
  img.className = "dorker-fab-logo";
  fab.appendChild(img);

  // ── Drag state ──
  let isDragging = false;
  let wasDragged = false;
  let startX = 0, startY = 0;
  let fabX = 0, fabY = 0;

  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val));
  }

  function setPosition(x: number, y: number) {
    const maxX = window.innerWidth - fab.offsetWidth;
    const maxY = window.innerHeight - fab.offsetHeight;
    fabX = clamp(x, 0, maxX);
    fabY = clamp(y, 0, maxY);
    fab.style.left = fabX + "px";
    fab.style.top = fabY + "px";
  }

  function savePosition() {
    chrome.storage.local.set({ [FAB_POS_KEY]: { x: fabX, y: fabY } });
  }

  // Load saved position
  chrome.storage.local.get(FAB_POS_KEY).then((result) => {
    const pos = result[FAB_POS_KEY];
    if (pos && typeof pos.x === "number" && typeof pos.y === "number") {
      setPosition(pos.x, pos.y);
    } else {
      setPosition(window.innerWidth - 64, 160);
    }
  });

  // ── Pointer events for drag ──
  fab.addEventListener("pointerdown", (e) => {
    isDragging = true;
    wasDragged = false;
    startX = e.clientX - fabX;
    startY = e.clientY - fabY;
    fab.setPointerCapture(e.pointerId);
    fab.style.transition = "none";
    fab.style.cursor = "grabbing";
    e.preventDefault();
  });

  document.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX - fabX;
    const dy = e.clientY - startY - fabY;
    if (!wasDragged && Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
    wasDragged = true;
    setPosition(e.clientX - startX, e.clientY - startY);
  });

  document.addEventListener("pointerup", () => {
    if (!isDragging) return;
    isDragging = false;
    fab.style.transition = "";
    fab.style.cursor = "";
    if (wasDragged) {
      savePosition();
    }
  });

  // ── Click = toggle panel (only if not dragged) ──
  fab.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wasDragged) {
      wasDragged = false;
      return;
    }
    chrome.runtime.sendMessage({ action: "toggle-sidepanel" });
  });

  document.body.appendChild(fab);

  // Recalculate on window resize
  window.addEventListener("resize", () => {
    setPosition(fabX, fabY);
  });
}

// ── Init ──
(async function () {
  // Load data from chrome.storage before initializing
  await loadDorkData();

  let handler: DorkInputHandler | null = null;

  function findSearchInput() {
    return (
      document.querySelector<HTMLTextAreaElement>("textarea#APjFqb") ||
      document.querySelector<HTMLTextAreaElement>("textarea.gLFyf") ||
      document.querySelector<HTMLInputElement>("input#APjFqb") ||
      document.querySelector<HTMLInputElement>("input.gLFyf") ||
      document.querySelector<HTMLInputElement>("[name='q'][role='combobox']") ||
      document.querySelector<HTMLInputElement>("[name='q']")
    );
  }

  function init() {
    const input = findSearchInput();
    if (!input || input.dataset.dorkerAttached) return;
    input.dataset.dorkerAttached = "true";

    const autocomplete = new DorkAutocomplete((item, mode) => {
      handler!.insertOperator(item, mode);
    });

    handler = new DorkInputHandler(input, autocomplete);
    handler.attach();
    createFab();

    if (document.activeElement === input && input.value.trim() === "") {
      autocomplete.showBadge(input);
    }
  }

  if (document.body) init();
  const observer = new MutationObserver(() => {
    if (findSearchInput()?.dataset.dorkerAttached) {
      observer.disconnect();
      return;
    }
    init();
  });
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  setTimeout(init, 500);
  setTimeout(init, 1500);

  chrome.runtime.onMessage.addListener((msg) => {
    const input = findSearchInput();
    if (!input) return;
    if (msg.action === "insert-dork") {
      input.focus();
      const pos = input.selectionStart || input.value.length;
      const before = input.value.substring(0, pos);
      const after = input.value.substring(pos);
      const space = before.length > 0 && !before.endsWith(" ") ? " " : "";
      input.value = before + space + msg.text + after;
      input.selectionStart = input.selectionEnd = pos + space.length + msg.text.length;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (msg.action === "insert-template") {
      input.focus();
      let query = msg.query as string;
      const siteMatch = input.value.match(/site:(\S+)/);
      query = query.replace(/\{domain\}/g, siteMatch ? siteMatch[1] : "example.com");
      input.value = query;
      input.selectionStart = input.selectionEnd = query.length;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
})();
