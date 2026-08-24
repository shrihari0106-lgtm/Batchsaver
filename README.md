# BatchSaver

> **AI-assisted real-time quality monitoring and minimum-intervention correction platform for wet masala manufacturing.**

[![BatchSaver CI](https://github.com/shrihari0106-lgtm/Batchsaver/actions/workflows/ci.yml/badge.svg)](https://github.com/shrihari0106-lgtm/Batchsaver/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-UNLICENSED-blue.svg)]()

---

> [!IMPORTANT]
> **This repository currently contains the BatchSaver architectural foundation. Individual modules will be implemented through controlled development batches.**

---

## 1. Problem Statement

Industrial wet masala processing (curry pastes, ginger-garlic blends, spice emulsions) is notoriously challenging due to:
- **Raw material variability**: Natural moisture and fiber fluctuations across raw spice batches.
- **Thermal and shear sensitivity**: Heating and mechanical shear continuously alter viscosity, colour, and aroma profiles.
- **Over-correction pitfalls**: Operators frequently over-dilute with water or over-heat the batch, resulting in scrapped product batches, inconsistent mouthfeel, and lost margins.

**BatchSaver** solves this by continuously monitoring physical telemetry in real-time, detecting drift before critical deviations occur, and calculating the **minimum effective corrective action** with Human-in-the-Loop (HITL) operator approval.

---

## 2. Monitored Quality Parameters

BatchSaver tracks four critical physical-chemical attributes against strict product recipe targets:

| Parameter | Target Value | Acceptable Critical Band | Engineering Unit | Default Sensor Modality |
| :--- | :--- | :--- | :--- | :--- |
| **Viscosity** | `3200 cP` | `±150 cP` (`3050 - 3350 cP`) | Centipoise (cP) | Inline Rotational Viscometer |
| **Moisture** | `38.0%` | `±1.5%` (`36.5% - 39.5%`) | % w/w | NIR Moisture Sensor |
| **Colour Index** | `62.0` | `±3.0` (`59.0 - 65.0`) | CI Units | Inline Spectrophotometer |
| **Temperature** | `92.0°C` | `±2.0°C` (`90.0°C - 94.0°C`) | °Celsius | RTD PT100 Sensor |

---

## 3. The Six Core Modules

```
BatchSaver Monorepo
├── apps/
│   ├── web/                     # Module 5: Industrial HMI & Dashboard Frontend
│   └── api/                     # Backend REST API, WebSocket & SSE Gateway
│
├── modules/
│   ├── data-acquisition/        # Module 1: Telemetry Ingestion & Realistic Simulation
│   ├── quality-monitoring/      # Module 2: Real-time Tolerances & Batch Health Scoring
│   ├── minimum-intervention/    # Module 3: Explainable Rule/AI Reason Code Engine
│   ├── operator-control/        # Module 4: Human-in-the-Loop & Actuator Safety Interlocks
│   ├── dashboard/               # Module 5: UI View-Models & Visualizer Pipelines
│   └── traceability-security/   # Module 6: PostgreSQL Storage, Audit Logs & RBAC
│
├── packages/
│   ├── shared-types/            # Canonical Domain Models & Interface Contracts
│   ├── shared-utils/            # Industrial Math, Noise Models & Logging
│   ├── config/                  # Centralized Process Parameters & Environment Settings
│   └── api-contracts/           # REST DTOs & Real-Time Event Envelopes
│
├── infrastructure/              # Docker Compose, PostgreSQL DDL, Mosquitto MQTT, OPC-UA
├── docs/                        # Comprehensive Architecture, API & Module Docs
└── tests/                       # Unit, Integration & End-to-End Test Scaffolds
```

---

## 4. Technology Stack

- **Monorepo & Toolchain**: TypeScript 5.x, Node.js 20.x LTS, npm workspaces
- **Backend Service**: TypeScript REST API with WebSocket & SSE real-time event streaming
- **Frontend Dashboard**: Component-based TypeScript web application (Outfit / JetBrains Mono industrial theme)
- **Database & Storage**: PostgreSQL 16 with indexed time-series telemetry and immutable audit logs
- **Industrial Protocols**: Abstracted adapters ready for OPC-UA, Modbus TCP, MQTT 5.0, and PLC DAQ
- **Containerization**: Docker & Docker Compose

---

## 5. Local Setup & Getting Started

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker & Docker Compose (Optional for local PostgreSQL and MQTT)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/shrihari0106-lgtm/Batchsaver.git
cd Batchsaver

# 2. Configure environment variables
cp .env.example .env

# 3. Install workspace dependencies
npm install

# 4. Run type verification
npm run typecheck

# 5. Run test suite
npm test
```

### Starting Local Infrastructure (Optional)
```bash
docker compose -f infrastructure/docker/docker-compose.yml up -d
```

---

## 6. Development & Branch Workflow

All contributions must follow the batch development lifecycle described in [CONTRIBUTING.md](CONTRIBUTING.md).

| Branch Name | Batch Scope | Status |
| :--- | :--- | :--- |
| `feature/batch-01-foundation` | Monorepo scaffolding, shared types, centralized config, docs | **Completed** |
| `feature/batch-02-data-acquisition` | Telemetry simulator, noise/drift models, OPC-UA/MQTT adapters | Upcoming |
| `feature/batch-03-quality-monitoring` | Quality parameter evaluation, moving average filters, tolerance bands | Upcoming |
| `feature/batch-04-deviation-detection` | Six-state quality FSM, composite Health Score (0-100) | Upcoming |
| `feature/batch-05-minimum-intervention`| Reason code engine, minimum corrective dosing, safety limits | Upcoming |
| `feature/batch-06-operator-actuator` | Operator HITL approval workflow, simulated & PLC actuators | Upcoming |
| `feature/batch-07-dashboard` | Real-time industrial HMI, multi-series charts, vessel visualizer | Upcoming |
| `feature/batch-08-traceability` | PostgreSQL schema migrations, immutable audit logging | Upcoming |
| `feature/batch-09-auth-integration` | JWT auth, RBAC permissions, API security middleware | Upcoming |
| `feature/batch-10-testing-deployment` | E2E integration tests, Docker orchestration, production build | Upcoming |

---

## 7. Documentation Index

- [System Architecture](docs/architecture/system-architecture.md)
- [Module Architecture](docs/architecture/module-architecture.md)
- [Module 1: Data Acquisition](docs/modules/module-1-data-acquisition.md)
- [Module 2: Quality Monitoring](docs/modules/module-2-quality-monitoring.md)
- [Module 3: Minimum Intervention](docs/modules/module-3-minimum-intervention.md)
- [Module 4: Operator Control](docs/modules/module-4-operator-control.md)
- [Module 5: Dashboard](docs/modules/module-5-dashboard.md)
- [Module 6: Traceability & Security](docs/modules/module-6-traceability-security.md)
- [Database Schema & Design](docs/database/database-design.md)
- [API Overview](docs/api/api-overview.md)
- [Development Guide](docs/development/development-guide.md)
- [Deployment Guide](docs/deployment/deployment-guide.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

## 8. License

UNLICENSED — Proprietary & Confidential. BatchSaver Architecture Team.
