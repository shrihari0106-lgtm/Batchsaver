# BatchSaver Development Guide

## 1. Prerequisites
- **Node.js**: >= 20.x (LTS)
- **npm**: >= 10.x
- **Docker & Docker Compose** (Optional for local PostgreSQL and Mosquitto)
- **Git**

## 2. Quickstart

```bash
# 1. Clone repository
git clone https://github.com/shrihari0106-lgtm/Batchsaver.git
cd Batchsaver

# 2. Setup environment configuration
cp .env.example .env

# 3. Install dependencies
npm install

# 4. Run type check
npm run typecheck

# 5. Run tests
npm test
```

## 3. Monorepo Structure

```
BatchSaver/
├── apps/
│   ├── web/                     (Frontend dashboard app)
│   └── api/                     (Backend API service)
├── modules/
│   ├── data-acquisition/        (Module 1: Telemetry & Simulation)
│   ├── quality-monitoring/      (Module 2: Real-time Quality & FSM)
│   ├── minimum-intervention/    (Module 3: AI / Rule Engine)
│   ├── operator-control/        (Module 4: HITL & Actuator Control)
│   ├── dashboard/               (Module 5: UI View Models)
│   └── traceability-security/   (Module 6: DB, Audit & RBAC)
├── packages/
│   ├── shared-types/            (All shared domain models)
│   ├── shared-utils/            (Math, validation, time, logger)
│   ├── config/                  (Centralized process parameters)
│   └── api-contracts/           (DTOs & endpoint contracts)
└── infrastructure/              (Docker, PostgreSQL, MQTT, OPC-UA)
```

## 4. Development Workflow Rules
- Never hardcode process parameter targets in code; always import from `@batchsaver/config`.
- Keep modules loosely coupled through shared interfaces in `@batchsaver/shared-types`.
- Write unit tests under `tests/unit/` for all calculation functions.
