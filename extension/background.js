chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "verifyImage",
      title: "Verify Image with RealityShield",
      contexts: ["all"]
    });
  });
});


chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "verifyImage") {
    chrome.storage.local.set({ result: null });
    
    try {
      // Send immediate "Checking..." message
      chrome.tabs.sendMessage(tab.id, { 
        action: "showResult", 
        result: { status: "unknown", reason: "Analyzing image data..." } 
      }).catch(() => {});

      // 1. Try to get data from content script (handles blobs and overlays)
      const imageData = await chrome.tabs.sendMessage(tab.id, { action: "getImageData" }).catch(() => null);
      
      let payload = {};
      if (imageData && (imageData.base64 || imageData.url)) {
        payload = imageData;
      } else if (info.srcUrl) {
        payload = { url: info.srcUrl };
      } else {
        throw new Error("Could not find image data on this element.");
      }

      const res = await fetch("http://127.0.0.1:5000/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Server returned error: " + res.status);

      const data = await res.json();
      chrome.storage.local.set({ result: data });
      
      chrome.tabs.sendMessage(tab.id, { action: "showResult", result: data }).catch(() => {});

      chrome.action.setBadgeText({ text: "!" });
      chrome.action.setBadgeBackgroundColor({ color: "#818cf8" });
      
    } catch (error) {
      console.warn("Verification failed:", error.message);
      const errResult = { 
        status: "unknown", 
        confidence: 0, 
        reason: error.message.includes("fetch") ? "Server Offline" : error.message 
      };
      chrome.storage.local.set({ result: errResult });
      chrome.tabs.sendMessage(tab.id, { action: "showResult", result: errResult }).catch(() => {});
      chrome.action.setBadgeText({ text: "ERR" });
      chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
    }
  }
});
