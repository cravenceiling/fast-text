chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "fast-text-read-selection",
    title: "Read with fast-text",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "fast-text-toggle",
    title: "Toggle fast-text",
    contexts: ["page", "selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === "fast-text-read-selection" || info.menuItemId === "fast-text-toggle") {
    chrome.tabs.sendMessage(tab.id, {
      type: "FAST_TEXT_OPEN",
      text: info.selectionText,
    });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id) return;
  const tabId = tab.id;

  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: "FAST_TEXT_TOGGLE" });
    console.log("Response:", response);
  } catch (error) {
    console.log("Content script not ready, injecting it...");
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["dist/content.js"],
    });
    setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { type: "FAST_TEXT_TOGGLE" });
    }, 100);
  }
});
