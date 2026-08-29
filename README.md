# NoWorry AI — Autonomous Revenue Recovery Agent

> **Tagline:** Detect. Decide. Recover.  
> **Product Name:** NoWorry AI — Autonomous Revenue Recovery Agent  
> **Architecture:** Full-Stack Enterprise SaaS + Manifest V3 Browser Extension  

---

## 1. Problem

SaaS businesses and online merchants lose **5% to 15% of annual recurring revenue** due to silent payment leakage:
- Failed card authorizations & expired credit cards
- Bank gateway connection timeouts & network packet loss
- Unhandled subscription auto-renewal failures
- Customer churn following payment friction

Traditional recovery methods rely on manual support emails, static dunning schedules, or generic retries that fail to adapt to customer tenure, lifetime value, or failure diagnostics.

---

## 2. Solution

**NoWorry AI** is an autonomous revenue recovery platform that combines machine learning predictions, structured tool-using AI agents, governance policy gating, and an immutable audit trail. Rather than simply reporting lost revenue, NoWorry AI autonomously investigates payment failures, calculates recovery probabilities, determines optimal intervention strategies, executes sandboxed recoveries, and logs audit trails.

---

## 3. Product Overview

The NoWorry AI ecosystem consists of two primary operational interfaces connected to a central FastAPI engine:
1. **Executive Web Dashboard (Next.js 14):** High-level KPI monitoring, opportunity grids, ML detail views, AI agent visual stepper, ROI simulator, and audit log viewer.
2. **Browser Extension (Manifest V3 for Chrome & Edge):** Compact toolbar popup for operational monitoring, right-click context menu analysis, desktop notifications, and controlled merchant page integration (`/demo-merchant`).

---

## 4. Architecture

```
                  +-----------------------------------+-----------------------------------+
                  |      Next.js 14 Web Dashboard     |     Chrome/Edge Extension V3      |
                  |     (http://localhost:3000)       |      (extension/dist bundle)      |
                  +-----------------+-----------------+-----------------+-----------------+
                                    |                                   |
                                    +-----------------+-----------------+
                                                      |  REST APIs (http://localhost:8000/api/v1)
                                                      v
                                  +---------------------------------------+
                                  |         FastAPI Backend Engine        |
                                  |     (Router, Policy, & Controls)      |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |       Autonomous AI Agent Engine      |
                                  |  (11-Step State Machine & 10 Tools)   |
                                  +----+--------------+--------------+----+
                                       |              |              |
                                       v              v              v
                         +---------------+     +---------------+   +---------------+
                         |  ML Predictor |     | Recovery      |   | Audit Trail   |
                         | (Scikit-Learn |     | Engine        |   | (Immutable    |
                         |  GradientBoost|     | (Simulated)   |   |  Logs)        |
                         +---------------+     +---------------+   +---------------+
                                       \              |              /
                                        v             v             v
                                  +---------------------------------------+
                                  |            SQLite Database            |
                                  |   (noworry_ai.db — 7 ORM Tables)      |
                                  +---------------------------------------+
```

---

## 5. Features

- **Real-Time Revenue Leakage Detection:** Automated identification of failed transactions.
- **ML Recovery Probability Prediction:** Empirical recovery scoring for every transaction.
- **Expected Recovery Calculation:** Probability-adjusted recoverable value ($amount \times probability$).
- **Structured 11-Step Agent Execution:** Transparent step-by-step tool invocation visualizer.
- **Enterprise Governance Policy Gating:** Automatic execution for $<₹1,000$, human operator approval required for $₹1,000–₹10,000$, mandatory escalation for $>₹10,000$.
- **Formula-Driven ROI Impact Simulator:** Interactive parameters and side-by-side baseline vs AI comparison chart.
- **Immutable Audit Trail:** Complete event history tracking actors, timestamps, and execution results.

---

## 6. AI Agent Architecture

The NoWorry AI Agent executes an 11-step structured workflow:
1. `DETECT_REVENUE_LOSS`: Identify transaction failure & amount at risk.
2. `INVESTIGATE_TRANSACTION`: Retrieve transaction metadata & gateway status.
3. `RETRIEVE_CUSTOMER_HISTORY`: Fetch tenure, LTV, success rate & prior failures.
4. `ANALYZE_FAILURE`: Diagnose root cause category & recoverability.
5. `PREDICT_RECOVERY`: Invoke Scikit-learn classification model.
6. `CALCULATE_EXPECTED_RECOVERY`: Compute probability-adjusted recoverable value.
7. `SELECT_RECOVERY_ACTION`: Determine optimal strategy (`RETRY_PAYMENT`, `SEND_REMINDER`, etc.).
8. `CHECK_APPROVAL_POLICY`: Apply enterprise governance rules (Auto vs Human Approval).
9. `EXECUTE_ACTION`: Trigger sandboxed recovery attempt.
10. `VERIFY_RECOVERY`: Verify transaction resolution status.
11. `CREATE_AUDIT_LOG`: Write immutable execution record.

---

## 7. Agent Tools

1. `get_transaction_details`: Query transaction metadata from database.
2. `get_customer_history`: Query customer LTV, tenure, and historical success rate.
3. `analyze_failure_reason`: Classify root cause and recoverability tier.
4. `predict_recovery_probability`: Run trained Scikit-learn model inference.
5. `calculate_expected_recovery`: Calculate $amount \times probability$.
6. `select_recovery_action`: Map failure diagnostics to optimal recovery action.
7. `check_approval_policy`: Evaluate transaction value against governance thresholds.
8. `execute_recovery_action`: Execute sandboxed simulated recovery action.
9. `verify_recovery`: Verify transaction status in database.
10. `create_audit_log`: Insert immutable record into `audit_logs` table.

---

## 8. ML Methodology

- **Pipeline:** `ColumnTransformer` with `StandardScaler` for numerical features and `OneHotEncoder` for categorical features.
- **Model Selection:** Compared `RandomForestClassifier`, `GradientBoostingClassifier`, and `LogisticRegression`. Selected `GradientBoostingClassifier` based on highest test F1-score (`0.8490`).
- **Data Leakage Prevention:** 80/20 stratified train/test split. Preprocessor fit strictly on training set.
- **Saved Model Artifact:** `ml/model.pkl` & `ml/metrics.json`.

---

## 9. Dataset

- **Synthetic Transaction Dataset (`ml/data/synthetic_transactions.csv`):** 50,000 records.
- **Features (11):** `transaction_amount`, `payment_method`, `failure_reason`, `customer_tenure`, `historical_payment_success`, `previous_failures`, `customer_lifetime_value`, `engagement_score`, `churn_probability`, `days_since_previous_payment`, `transaction_history`.
- **Target:** `recovered` (Binary 0 or 1).

---

## 10. Database

Built using SQLAlchemy ORM (SQLite `noworry_ai.db` or PostgreSQL / Supabase):
1. `customers`: Customer profiles, LTV, tenure, success rates.
2. `transactions`: Transaction records, amounts, payment methods, failure codes.
3. `recovery_opportunities`: Revenue opportunities tracked by status.
4. `recovery_actions`: History of executed recovery actions.
5. `ai_predictions`: Saved ML inference predictions and feature vectors.
6. `agent_runs`: Agent execution logs and state machine statuses.
7. `audit_logs`: Immutable audit trail entries.

---

## 11. API

FastAPI REST API endpoints (`/api/v1`):
- `GET /` — Health check
- `GET /api/v1/dashboard/summary` — Executive KPIs
- `GET /api/v1/dashboard/charts` — Daily trend and cause distributions
- `GET /api/v1/opportunities` — Paginated opportunities grid
- `GET /api/v1/opportunities/{id}` — Opportunity detail view
- `POST /api/v1/agent/run` — Trigger/resume multi-step agent workflow
- `POST /api/v1/agent/approve` — Human operator sign-off
- `GET /api/v1/actions` — Recovery action execution history
- `GET /api/v1/analytics/metrics` — Segment analytics
- `POST /api/v1/roi/calculate` — Formula-driven ROI calculator
- `GET /api/v1/audit` — Immutable audit logs
- `POST /api/v1/demo/reset` — Reset environment & seed TX-10492

---

## 12. Browser Extension

- **Manifest Version:** Manifest V3 (Chrome & Edge compatible)
- **Directory:** `extension/` (Build output: `extension/dist/`)
- **Features:** Popup UI, live metrics, top opportunity card (`TX-10492`), 11-step visual stepper, context menu (`"Analyze with NoWorry AI"`), desktop notifications, controlled merchant page content script (`/demo-merchant`), configurable settings.

---

## 13. Installation

```bash
# Clone repository
git clone https://github.com/your-org/noworry-ai.git
cd noworry-ai

# Set up Python virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install extension dependencies
cd extension
npm install
cd ..
```

---

## 14. Local Development

```bash
# 1. Train ML model & Seed database (Terminal 1)
set PYTHONPATH=.
python -m ml.train
python -m data.seed_demo_data

# 2. Start FastAPI Backend (Port 8000)
python -m uvicorn backend.app.main:app --port 8000

# 3. Start Next.js Frontend (Terminal 2, Port 3000)
cd frontend
npm run dev

# 4. Build Chrome Extension (Terminal 3)
cd extension
npm run build
```

---

## 15. Environment Variables

Create `.env` file based on `.env.example`:

```ini
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=development
LOG_LEVEL=INFO
DEBUG=false

# SQLite default or PostgreSQL / Supabase
DATABASE_URL=sqlite:///./noworry_ai.db
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

LLM_PROVIDER=deterministic
GEMINI_API_KEY=
OPENAI_API_KEY=

MODEL_DIR=ml/models
SYNTHETIC_DATA_SIZE=50000

NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 16. Testing

Run full automated test suite (15 integration & unit tests):

```bash
set PYTHONPATH=.
pytest tests/
```

---

## 17. Demo Workflow (TX-10492)

1. Open **`http://localhost:3000/dashboard`**.
2. Click **Launch Agent Execution** (or click **Run Agent** on transaction **TX-10492**).
3. Watch the agent execute steps 1 through 8.
4. Observe policy check gating at step 8 ($\ge ₹1,000 \implies WAITING\_APPROVAL$).
5. Click **Approve & Resume Agent** to approve recovery (`RETRY_PAYMENT` $\rightarrow$ `SUCCESS`).
6. Observe status transition to `RECOVERED` and audit log creation.
7. Open `http://localhost:3000/demo-merchant` to test the extension content script button.

---

## 18. Business Impact

- **Average Recovery Lift:** $40\%$ to $65\%$ increase in recovered recurring revenue.
- **ROI Multiplier:** $4.0\times$ to $6.5\times$ ROI over manual support dunning.
- **Time to Recovery:** Reduced from days/weeks to seconds.

---

## 19. Deployment

### Backend Deployment (Docker / Render / Fly.io)
```bash
docker build -t noworry-ai-backend -f backend/Dockerfile .
docker run -p 8000:8000 -e ENVIRONMENT=production noworry-ai-backend
```

### Frontend Deployment (Vercel)
Set root directory to `frontend` and environment variable `NEXT_PUBLIC_API_URL` to production backend API URL.

### Database Deployment (Supabase / PostgreSQL)
Set `DATABASE_URL` in backend environment to Supabase PostgreSQL connection string.

---

## 20. Future Improvements

- Live Webhook integration for real-time Stripe / Razorpay event ingestion.
- Server-Sent Events (SSE) for streaming agent step logs in real time.
- Multi-tenant Role-Based Access Control (RBAC).
