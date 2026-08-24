# Changelog

All notable changes to the BatchSaver platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-24 - Batch 01: Foundation

### Added
- **Monorepo Structure**: Workspace scaffolding across `apps/`, `modules/`, `packages/`, `infrastructure/`, `docs/`, `tests/`, and `scripts/`.
- **Shared Domain Contracts (`@batchsaver/shared-types`)**: Established domain models for `SensorReading`, `Batch`, `BatchStatus`, `QualityMeasurement`, `QualityParameter`, `DeviationEvent`, `ReasonCode`, `CorrectionRecommendation`, `OperatorDecision`, `ActuatorCommand`, `ActuatorResponse`, `RecoveryEvent`, `AuditEvent`, `User`, `UserRole`, and `HealthScore`.
- **Centralized Configuration (`@batchsaver/config`)**: Hardened process parameter definitions for wet masala manufacturing:
  - Viscosity: `3200 cP ± 150 cP`
  - Moisture: `38.0% ± 1.5%`
  - Colour Index: `62.0 ± 3.0`
  - Temperature: `92.0°C ± 2.0°C`
- **Shared Utilities (`@batchsaver/shared-utils`)**: Box-Muller Gaussian noise generator, deviation percentage math, composite Health Score calculator, structured industrial logger.
- **API Contracts (`@batchsaver/api-contracts`)**: REST DTOs and WebSocket event envelopes for `/api/v1/batches`, `/api/v1/sensors`, `/api/v1/quality`, `/api/v1/deviations`, `/api/v1/recommendations`, `/api/v1/actuators`, `/api/v1/operators`, `/api/v1/audit`, `/api/v1/auth`.
- **Module Scaffolding (1-6)**: Provider and engine contracts across all 6 core modules.
- **Infrastructure Scaffolding**: PostgreSQL relational DDL, Docker Compose orchestration, MQTT broker configuration, OPC-UA node schemas.
- **Documentation Suite**: Comprehensive system, module, database, API, development, and deployment specifications.
- **CI / GitHub Foundation**: GitHub Actions CI workflow, PR template, issue templates, and `CONTRIBUTING.md`.
