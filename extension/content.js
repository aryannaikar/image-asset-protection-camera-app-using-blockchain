let lastRightClickedElement = null;

// Track the last right-clicked element to handle Instagram/WhatsApp overlays
document.addEventListener("contextmenu", (e) => {
  lastRightClickedElement = e.target;
}, true);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showResult") {
    showRealityShieldToast(request.result);
  } else if (request.action === "getImageData") {
    extractImageData().then(sendResponse);
    return true; // Keep channel open for async
  }
});

async function extractImageData() {
  if (!lastRightClickedElement) return null;

  let img = null;

  // 1. Check if the element itself is an image
  if (lastRightClickedElement.tagName === "IMG") {
    img = lastRightClickedElement;
  } else {
    // 2. Check if there's an image inside or behind (for Instagram overlays)
    img = lastRightClickedElement.querySelector("img") || 
          lastRightClickedElement.parentElement.querySelector("img");
  }

  if (!img && lastRightClickedElement.style.backgroundImage) {
    // 3. Handle background images
    const url = lastRightClickedElement.style.backgroundImage.slice(4, -1).replace(/"/g, "");
    return { url };
  }

  if (img) {
    const src = img.src;
    // If it's a blob or data URL, we MUST convert it to Base64 here
    if (src.startsWith("blob:") || src.startsWith("data:")) {
      try {
        const response = await fetch(src);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve({ base64: reader.result });
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        return { url: src };
      }
    }
    return { url: src };
  }

  return null;
}

function showRealityShieldToast(res) {
  const existing = document.getElementById("reality-shield-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "reality-shield-toast";
  
  const isAuthentic = res.status === "authentic";
  const isTampered = res.status === "tampered";
  const isVerifying = res.reason && res.reason.includes("Verifying");
  
  let bgColor = "#64748b";
  if (isAuthentic) bgColor = "#10b981";
  if (isTampered) bgColor = "#f59e0b";
  if (res.reason && (res.reason.includes("Error") || res.reason.includes("not found"))) bgColor = "#ef4444";

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #0f172a;
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    z-index: 999999;
    border-left: 5px solid ${bgColor};
    font-family: system-ui, -apple-system, sans-serif;
    min-width: 250px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    animation: realitySlideIn 0.3s ease-out;
  `;

  const title = isVerifying ? "RealityShield" : (isAuthentic ? "Image Authentic" : (isTampered ? "Modification Detected" : "Verification Result"));
  const iconEmoji = isAuthentic ? "✅" : (isTampered ? "⚠️" : "ℹ️");

  toast.innerHTML = `
    <div style="font-weight: bold; font-size: 14px; display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="${chrome.runtime.getURL('logo.png')}" style="width: 18px; height: 18px; object-fit: contain;" />
        <span>${title}</span>
      </div>
      <span id="close-reality-toast" style="cursor:pointer; opacity: 0.5;">&times;</span>
    </div>
    <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
      ${isVerifying ? '<div class="rs-spinner" style="width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #818cf8; border-radius: 50%; animation: rs-spin 1s linear infinite;"></div>' : ""}
      <div style="font-size: 12px; color: #94a3b8;">${res.reason || "Verification complete"}</div>
    </div>
    ${res.confidence ? `<div style="font-size: 11px; color: ${bgColor}; font-weight: bold; margin-top: 4px;">Confidence: ${res.confidence}%</div>` : ""}
  `;

  const style = document.getElementById("rs-toast-styles") || document.createElement("style");
  style.id = "rs-toast-styles";
  style.innerHTML = `
    @keyframes realitySlideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes rs-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);
  document.getElementById("close-reality-toast").onclick = () => toast.remove();

  if (!isVerifying) {
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.5s ease";
        setTimeout(() => toast.remove(), 500);
      }
    }, 5000);
  }
}
