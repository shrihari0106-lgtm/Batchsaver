# BatchSaver Module Architecture

## The Six-Module Topology

BatchSaver is organized into six functional modules that interact through typed contracts:

```
BatchSaver Platform
├── Module 1: Data Acquisition & Simulation (@batchsaver/module-data-acquisition)
├── Module 2: Quality Monitoring Engine (@batchsaver/module-quality-monitoring)
├── Module 3: AI / Minimum-Intervention Engine (@batchsaver/module-minimum-intervention)
├── Module 4: Operator & Actuator Control (@batchsaver/module-operator-control)
├── Module 5: Dashboard & Visualization (@batchsaver/module-dashboard)
└── Module 6: Traceability, Security & Deployment (@batchsaver/module-traceability-security)
```

---

## Inter-Module Interaction Matrix

| Sender Module | Receiver Module | Data / Contract Transferred | Protocol |
| :--- | :--- | :--- | :--- |
| **Module 1 (Data Acquisition)** | **Module 2 (Quality Monitoring)** | `SensorReading` stream | Event Bus / In-Memory Queue |
| **Module 2 (Quality Monitoring)** | **Module 3 (AI / Min-Intervention)** | `DeviationEvent`, `QualityMeasurement` | Event Dispatcher |
| **Module 3 (AI / Min-Intervention)** | **Module 4 (Operator Control)** | `CorrectionRecommendation` | Internal Service API |
| **Module 4 (Operator Control)** | **Module 1 / Industrial Plant** | `ActuatorCommand` | Actuator Provider Adapter |
| **Module 2 & 3** | **Module 5 (Dashboard)** | `DashboardViewModel`, `WsMessageEnvelope` | WebSocket / REST |
| **All Modules** | **Module 6 (Traceability & Security)** | `AuditEvent`, `Batch`, `RecoveryEvent` | Repository Interfaces |

---

## Module Boundary Guidelines

- **No circular dependencies**: Shared data structures live strictly in `@batchsaver/shared-types`.
- **No hardware leakage**: Real PLC/OPC-UA/Modbus logic must reside within isolated adapter implementations under Module 1 and Module 4.
- **Stateless calculation engines**: Modules 2 and 3 operate as deterministic, functional processing engines wherever possible.
