# NoWorry AI — Deterministic Demo Scenario Walkthrough

## Demo Transaction Details
- **Transaction Code:** `TX-10492`
- **Customer:** Acme Global Solutions (Enterprise, 18 Months Tenure, LTV ₹125,000, 94% Historical Success Rate)
- **Amount:** ₹9,999.00
- **Failure Reason:** Temporary payment authorization failure
- **Payment Method:** CREDIT_CARD

## Step-by-Step Agent Workflow
1. Navigate to **Executive Dashboard** (`/dashboard`). Observe primary KPIs loaded live from backend database.
2. Click **Run Demo Agent Workflow** in header or navigate to **AI Recovery Agent** (`/agent?tx=TX-10492`).
3. Click **Run Agent**. The agent executes:
   - Step 1: Detect Revenue Loss (₹9,999)
   - Step 2: Investigate Transaction
   - Step 3: Retrieve Customer History (94% success rate)
   - Step 4: Analyze Failure Reason (Temporary authorization freeze)
   - Step 5: Predict Recovery Probability via ML Model (~82%)
   - Step 6: Calculate Expected Recovery (₹8,199.18)
   - Step 7: Select Recovery Action (`RETRY_PAYMENT`)
   - Step 8: Check Approval Policy $\implies$ Amount ₹9,999 falls within ₹1,000–₹10,000 human review bracket $\implies$ **Gated for Human Approval**.
4. Observe the interactive **Human Approval Banner** on screen.
5. Click **Approve & Resume Agent**.
6. The agent resumes:
   - Step 9: Execute Simulated Recovery Action (`RETRY_PAYMENT` $\implies$ `SUCCESS`)
   - Step 10: Verify Recovery Result (`RECOVERED`)
   - Step 11: Create Immutable Audit Log
7. View updated status in **Opportunities**, **Recovery Actions**, and **Audit Logs**!
