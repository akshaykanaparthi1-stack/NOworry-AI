# NoWorry AI — Browser Extension (Manifest V3)

> **Product Interface:** NoWorry AI Revenue Recovery Agent Browser Extension  
> **Compatibility:** Google Chrome & Microsoft Edge (Manifest V3)  

The NoWorry AI Browser Extension provides an operational interface for monitoring revenue leakage, inspecting ML recovery predictions, executing autonomous agent workflows, and managing policy-gated transactions directly from your browser toolbar.

---

## 🚀 How to Build the Extension

1. Navigate to the `extension/` directory:
   ```bash
   cd extension
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Build the production extension bundle:
   ```bash
   npm run build
   ```
   This generates Manifest V3 extension bundle files inside `extension/dist/`.

---

## 📦 How to Load into Google Chrome

1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` directory (or `extension/dist/` directory after running `npm run build`).
5. Pin the **NoWorry AI** extension icon to your Chrome toolbar.

---

## 📦 How to Load into Microsoft Edge

1. Open Microsoft Edge and navigate to `edge://extensions/`.
2. Enable **Developer mode** toggle in the left sidebar.
3. Click **Load unpacked**.
4. Select the `extension/` directory (or `extension/dist/` directory).

---

## ⚙️ Backend URL Configuration

- **Default Backend URL:** `http://localhost:8000/api/v1`
- **Default Web App URL:** `http://localhost:3000`

To customize the backend URL or web app URL:
1. Click the NoWorry AI extension icon in your browser toolbar.
2. Click the ⚙️ **Settings** icon in the top right corner.
3. Update the **Backend API URL** or **Web App Dashboard URL**.
4. Click **Save Configuration**.

---

## 🧪 End-to-End Demo Walkthrough

1. **Start Backend & Web App:**
   - FastAPI Backend running on `http://localhost:8000`
   - Next.js Web App running on `http://localhost:3000`
2. **Open Extension Popup:** Click the NoWorry AI icon in your browser toolbar.
3. **Inspect Live Metrics:** Observe live **Revenue at Risk**, **Recoverable Revenue**, and **Recovered Revenue**.
4. **Top Opportunity (TX-10492):** Inspect the Top Opportunity card for transaction **TX-10492** (Amount: ₹9,999, ML Recovery Probability: 82%).
5. **Run AI Agent:** Click **Analyze & Run AI Agent**.
6. **Watch Live Stepper:** Observe the 11-step visual progression in real time.
7. **Policy Gating:** When step 8 (**Check Approval Policy**) triggers, observe the warning: `⚠ Operator Approval Required`.
8. **Approve via Web Dashboard:** Click **Open Dashboard to Approve** to sign off on the recovery execution.
9. **Controlled Demo Page Integration:** Visit `http://localhost:3000/demo-merchant` to test the extension content script button (`⚡ Analyze with NoWorry AI`).
10. **Context Menu:** Highlight any transaction code (e.g. `TX-10492`) on any webpage, right-click, and select **"Analyze with NoWorry AI"**.

---

## 🔒 Security & Privacy

- **Minimum Permissions:** Uses only `storage`, `contextMenus`, `notifications`, and explicit backend host permissions.
- **No Background Scraping:** Does NOT collect browsing history, track user activity, or scrape arbitrary websites.
- **Controlled Invocations:** Only executes analysis when explicitly invoked by the user via the popup, context menu, or controlled demo page.
