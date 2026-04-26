chrome.storage.local.get("result", (data) => {
  const res = data.result;
  const loading = document.getElementById("loading");
  const content = document.getElementById("content");

  if (!res) {
    loading.innerHTML = "<p style='color: #94a3b8'>No image selected for verification.<br><br>Right-click an image and select 'Verify Image'</p>";
    return;
  }

  loading.style.display = "none";
  content.style.display = "block";

  const badge = document.getElementById("badge");
  const verdict = document.getElementById("verdict");
  const owner = document.getElementById("owner");
  const confidence = document.getElementById("confidence");

  // Status styling
  badge.className = "status-badge status-" + res.status;
  badge.innerText = res.status.toUpperCase();

  // Verdict text
  verdict.innerText = res.reason || "Result ready";

  // Confidence
  confidence.innerText = res.confidence + "%";

  // Owner
  if (res.original && res.original.owner) {
    owner.innerText = res.original.owner;
  } else if (res.owner) {
    owner.innerText = res.owner;
  } else {
    owner.innerText = "N/A";
  }

  // Clear badge now that the user has seen the result
  chrome.action.setBadgeText({ text: "" });
  
  // Clear result after showing so it doesn't persist forever
  // chrome.storage.local.remove("result");
});