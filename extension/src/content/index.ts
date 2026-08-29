console.log("NoWorry AI Content Script loaded on controlled demo page.");

function injectDemoAction() {
  const container = document.getElementById("noworry-demo-container");
  if (!container) return;

  if (document.getElementById("noworry-extension-btn")) return; // Already injected

  const btn = document.createElement("button");
  btn.id = "noworry-extension-btn";
  btn.innerText = "⚡ Analyze with NoWorry AI (Extension)";
  btn.className = "mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition cursor-pointer flex items-center";

  const statusBox = document.createElement("div");
  statusBox.id = "noworry-extension-status";
  statusBox.className = "mt-2 text-xs font-semibold text-blue-700 hidden";

  btn.addEventListener("click", () => {
    btn.disabled = true;
    btn.innerText = "⏳ Running NoWorry AI Agent...";
    statusBox.classList.remove("hidden");
    statusBox.innerText = "Connecting to NoWorry AI Backend...";

    chrome.runtime.sendMessage({ type: "TRIGGER_ANALYSIS", transactionCode: "TX-10492" }, (response) => {
      btn.disabled = false;
      btn.innerText = "⚡ Analyze with NoWorry AI (Extension)";
      if (response && response.success) {
        statusBox.className = "mt-2 text-xs font-bold text-emerald-700 p-2 rounded bg-emerald-50 border border-emerald-200";
        statusBox.innerText = `✓ Agent Analysis Complete! Status: ${response.data.status}. Open Extension Popup or Web Dashboard to view full results.`;
      } else {
        statusBox.className = "mt-2 text-xs font-bold text-rose-700 p-2 rounded bg-rose-50 border border-rose-200";
        statusBox.innerText = `Execution failed: ${response?.error || "Unknown error"}`;
      }
    });
  });

  container.appendChild(btn);
  container.appendChild(statusBox);
}

// Observe DOM for controlled demo container
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectDemoAction);
} else {
  injectDemoAction();
}

setInterval(injectDemoAction, 1000);
