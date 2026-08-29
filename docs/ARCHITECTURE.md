# NoWorry AI Architecture Overview

NoWorry AI is an enterprise autonomous revenue recovery SaaS application.

## Core Layers
1. **Frontend:** Next.js 14+ (TypeScript, Tailwind CSS, Recharts) rendering real-time dashboards, opportunity data grid, live agent stepper visualizer, analytics, ROI simulator, and audit log viewer.
2. **Backend API:** FastAPI (Python 3.13) providing REST endpoints for executive KPIs, opportunity filtering, agent workflow execution, human approval policy gating, and ROI calculations.
3. **AI Agent Engine:** Multi-step tool calling state machine executing an 11-step structured workflow (`DETECT`, `INVESTIGATE`, `RETRIEVE_CUSTOMER`, `ANALYZE`, `PREDICT`, `CALCULATE_EXPECTED`, `SELECT_ACTION`, `CHECK_POLICY`, `EXECUTE`, `VERIFY`, `AUDIT`).
4. **ML Prediction Service:** Scikit-learn classification pipeline (RandomForestClassifier) trained on 50,000 synthetic transaction records predicting revenue recovery probabilities.
5. **Database:** SQLite / PostgreSQL schema storing customers, transactions, opportunities, actions, predictions, agent runs, and audit logs.
