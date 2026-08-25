# Module 2 — Quality Monitoring Engine

## Overview

Module 2 is the core quality assessment engine of the **BatchSaver** platform. It receives continuous real-time sensor streams from Module 1 (Data Acquisition) and evaluates process variables against configured targets and tolerances for wet masala manufacturing.

It determines:
- Real-time parameter quality status (`NOMINAL`, `WARNING`, `DEVIATION`, `CRITICAL`, `RECOVERING`, `RECOVERED`)
- Signed, absolute, and percentage deviations from target
- Individual parameter health scores (0–100)
- Weighted composite **Batch Health Score** (0–100) with human-readable explanations
- Process trend direction (`STABLE`, `RISING`, `FALLING`, `DRIFTING_HIGH`, `DRIFTING_LOW`)
- Decoupled domain events for Module 3 (Minimum Intervention Engine) and Module 5 (Dashboard)

Module 2 does **NOT** decide corrective actions or issue actuator commands — that responsibility belongs strictly to Module 3 and Module 4.

---

## Architecture & Data Flow

```text
  Module 1: SensorReading
            ↓
  Validation (null/NaN, physical limits, staleness, quality flag, units)
            ↓
  Unit Conversion Layer (°F → °C, K → °C, etc.)
            ↓
  Deviation Metrics Calculation (signed, absolute, %, direction)
            ↓
  State Machine with Hysteresis & Persistence Filter
            ↓
  Sliding-Window Trend Analyzer (linear regression slope)
            ↓
  Parameter & Composite Batch Health Score Calculator
            ↓
  Domain Events Generation (QualityWarningDetected, QualityDeviationDetected, etc.)
            ↓
  In-Memory / Database Storage & Module 3 Contract Dispatch
```

---

## Centralized Configuration

All thresholds and tolerances are configured centrally in `@batchsaver/config`:

| Parameter | Target | Unit | Warning Tolerance | Critical Tolerance | Acceptable Range |
|---|---|---|---|---|---|
| **Viscosity** | 3,200 | cP | ±100 cP | ±150 cP | 3,050 – 3,350 cP |
| **Moisture** | 38.0 | % | ±1.0% | ±1.5% | 36.5 – 39.5% |
| **Colour Index** | 62.0 | CI | ±2.0 CI | ±3.0 CI | 59.0 – 65.0 CI |
| **Temperature** | 92.0 | °C | ±1.5 °C | ±2.0 °C | 90.0 – 94.0 °C |

All values can be overridden via environment variables (`PARAM_VISCOSITY_TARGET`, `PARAM_VISCOSITY_TOLERANCE`, etc.) without code modifications.

---

## Quality States & State Machine

State transitions are rule-based and deterministic:

- **`NOMINAL`**: Value within warning tolerance band
- **`WARNING`**: Value exceeds warning tolerance but remains within critical tolerance
- **`DEVIATION`**: Value exceeds critical tolerance (acceptable specification)
- **`CRITICAL`**: Value exceeds 1.5× critical tolerance
- **`RECOVERING`**: Value returning toward target following a deviation/critical event
- **`RECOVERED`**: Value inside acceptable specification and stable for `recoveryStabilityCount` consecutive readings

### Hysteresis & Flicker Prevention
- **Persistence Count**: Requires `stateChangePersistenceCount` (default: 2) consecutive readings in a new state before accepting the state transition.
- **Recovery Count**: Requires `recoveryStabilityCount` (default: 3) consecutive nominal readings before transitioning to `RECOVERED`.

---

## Batch Health Score

The composite **Batch Health Score** (0–100) is calculated using weighted industrial parameter scores:

| Parameter | Weight |
|---|---|
| **Viscosity** | 35% |
| **Moisture** | 30% |
| **Temperature** | 20% |
| **Colour Index** | 15% |

### Human-Readable Explanation Example
```text
Batch Health Score: 82

Main contributors:
- Viscosity: moderate deviation (+6.25%)
- Moisture: within target (-0.26%)
- Colour Index: within target (+0.16%)
- Temperature: minor deviation (+1.63%)
```

---

## Domain Events (Module 3 Contract)

Module 2 emits decoupled domain events consumed by Module 3 without tight coupling:

- `QualityWarningDetected`
- `QualityDeviationDetected`
- `QualityCriticalDetected`
- `QualityRecoveryStarted`
- `QualityRecovered`
- `BatchHealthChanged`

Module 3 subscribes to these events via `IQualityEventConsumer` interface and `toModule3DeviationPayload()` converter helper.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/quality/current/:batchId` | Current quality snapshot & overview |
| `GET` | `/api/v1/quality/history/:batchId` | Historical quality measurements |
| `GET` | `/api/v1/quality/health/:batchId` | Current Batch Health Score & explanations |
| `GET` | `/api/v1/quality/trends/:batchId` | Sliding-window trend analysis |
| `GET` | `/api/v1/quality/deviations/:batchId` | Active quality deviations |

---

## Testing

Run unit & integration tests:

```bash
# Run unit tests
npm test

# Run type checking
npm run typecheck
```
