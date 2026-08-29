import { DEFAULT_SETTINGS } from "../services/api";

// Manifest V3 Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("NoWorry AI Extension Service Worker Installed.");

  // Create Context Menu item
  chrome.contextMenus.create({
    id: "noworry_analyze_selection",
    title: "Analyze with NoWorry AI",
    contexts: ["selection", "page"],
  });

  // Store default settings if empty
  chrome.storage.local.get(["backendUrl"], (res) => {
    if (!res.backendUrl) {
      chrome.storage.local.set(DEFAULT_SETTINGS);
    }
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "noworry_analyze_selection") {
    const selection = info.selectionText ? info.selectionText.trim() : "TX-10492";
    console.log("Selected text for analysis:", selection);

    // Call backend API to trigger run
    chrome.storage.local.get(["backendUrl", "notificationsEnabled"], async (res) => {
      const backendUrl = res.backendUrl || DEFAULT_SETTINGS.backendUrl;
      try {
        const apiRes = await fetch(`${backendUrl}/agent/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_code_or_id: selection,
            human_approved: false,
          }),
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          if (res.notificationsEnabled !== false) {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icons/icon48.png",
              title: `NoWorry AI Agent Analysis`,
              message: `Analysis complete for ${selection}. Status: ${data.status}`,
              priority: 2,
            });
          }
        }
      } catch (err) {
        console.error("Context menu API error:", err);
      }
    });
  }
});

// Handle Messages from Content Scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRIGGER_ANALYSIS") {
    const txCode = message.transactionCode || "TX-10492";
    chrome.storage.local.get(["backendUrl", "notificationsEnabled"], async (res) => {
      const backendUrl = res.backendUrl || DEFAULT_SETTINGS.backendUrl;
      try {
        const apiRes = await fetch(`${backendUrl}/agent/run`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transaction_code_or_id: txCode,
            human_approved: false,
          }),
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          sendResponse({ success: true, data });
          if (res.notificationsEnabled !== false) {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icons/icon48.png",
              title: "NoWorry AI Revenue Recovery",
              message: `High-value transaction ${txCode} analyzed. Status: ${data.status}`,
              priority: 2,
            });
          }
        } else {
          sendResponse({ success: false, error: "API execution failed" });
        }
      } catch (err: any) {
        sendResponse({ success: false, error: err.message });
      }
    });
    return true; // Keep response channel open async
  }
});
