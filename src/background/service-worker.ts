import { syncDorkData, getDorkData } from "@/store/dork-sync";

const GOOGLE_URL_PATTERN = /^https?:\/\/www\.google\./;

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// ── Sync on install and periodically ──
const SYNC_ALARM = "dorker-sync";
const SYNC_INTERVAL_MINUTES = 60;

chrome.runtime.onInstalled.addListener(async () => {
  await getDorkData();
  await syncDorkData();
  chrome.alarms.create(SYNC_ALARM, { periodInMinutes: SYNC_INTERVAL_MINUTES });
});

chrome.runtime.onStartup.addListener(() => {
  syncDorkData();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SYNC_ALARM) syncDorkData();
});

// ── Panel toggle ──
const panelOpenTabs = new Set<number>();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "toggle-sidepanel" && sender.tab?.id) {
    const tabId = sender.tab.id;
    const windowId = sender.tab.windowId;

    // Only allow on Google domains
    if (!sender.tab.url || !GOOGLE_URL_PATTERN.test(sender.tab.url)) return;

    if (panelOpenTabs.has(tabId)) {
      chrome.sidePanel.setOptions({ tabId, enabled: false }).then(() => {
        panelOpenTabs.delete(tabId);
        setTimeout(() => chrome.sidePanel.setOptions({ tabId, enabled: true }), 100);
      });
    } else {
      chrome.sidePanel.open({ windowId }).then(() => {
        panelOpenTabs.add(tabId);
      }).catch((err) => console.warn("[Dorker] Panel open failed:", err));
    }
  }

  if (msg.action === "get-dork-data") {
    getDorkData().then((data) => sendResponse(data));
    return true;
  }
});

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "dorker-sidepanel") {
    const tabId = port.sender?.tab?.id;
    if (tabId) panelOpenTabs.add(tabId);
    port.onDisconnect.addListener(() => {
      if (tabId) panelOpenTabs.delete(tabId);
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  panelOpenTabs.delete(tabId);
});
