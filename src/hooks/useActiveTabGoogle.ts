import { useState, useEffect } from "react";

const GOOGLE_URL_PATTERN = /^https?:\/\/www\.google\./;

/** Track whether the active tab in the current window is a Google search page */
export function useActiveTabGoogle() {
  const [isGoogle, setIsGoogle] = useState(true); // assume true until checked

  useEffect(() => {
    function checkTab(tabId?: number) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url ?? "";
        setIsGoogle(GOOGLE_URL_PATTERN.test(url));
      });
    }

    // Initial check
    checkTab();

    // When user switches tabs
    const onActivated = (info: chrome.tabs.TabActiveInfo) => checkTab(info.tabId);
    chrome.tabs.onActivated.addListener(onActivated);

    // When current tab navigates
    const onUpdated = (tabId: number, change: chrome.tabs.TabChangeInfo) => {
      if (change.url) checkTab(tabId);
    };
    chrome.tabs.onUpdated.addListener(onUpdated);

    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
    };
  }, []);

  return isGoogle;
}
