chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Track panel open state
let panelOpen = false;

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "open-sidepanel" && sender.tab?.id) {
    if (panelOpen) {
      // Close by setting panel to empty, then restore
      chrome.sidePanel.setOptions({ enabled: false });
      setTimeout(() => chrome.sidePanel.setOptions({ enabled: true }), 100);
      panelOpen = false;
    } else {
      chrome.sidePanel.open({ tabId: sender.tab.id });
      panelOpen = true;
    }
  }
});

// Track when panel connects/disconnects
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "dorker-sidepanel") {
    panelOpen = true;
    port.onDisconnect.addListener(() => {
      panelOpen = false;
    });
  }
});
