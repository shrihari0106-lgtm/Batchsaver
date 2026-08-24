# Contributing to BatchSaver

Thank you for contributing to the BatchSaver platform. BatchSaver is built using a structured, batch-oriented engineering process.

---

## 1. Branch Naming Convention

All development work is organized into structured development batches. Branches MUST follow this exact naming format:

| Branch Name | Scope / Batch Description |
| :--- | :--- |
| `feature/batch-01-foundation` | Monorepo scaffolding, shared domain types, centralized config, docs |
| `feature/batch-02-data-acquisition` | Telemetry simulator, noise/drift models, OPC-UA/MQTT adapters |
| `feature/batch-03-quality-monitoring` | Quality parameter evaluation, moving average filters, tolerance bands |
| `feature/batch-04-deviation-detection` | Six-state quality FSM, composite Health Score (0-100) |
| `feature/batch-05-minimum-intervention`| Reason code engine, minimum corrective dosing, safety limits |
| `feature/batch-06-operator-actuator` | Operator HITL approval workflow, simulated & PLC actuators |
| `feature/batch-07-dashboard` | Real-time industrial HMI, multi-series charts, vessel visualizer |
| `feature/batch-08-traceability` | PostgreSQL schema migrations, immutable audit logging |
| `feature/batch-09-auth-integration` | JWT auth, RBAC permissions, API security middleware |
| `feature/batch-10-testing-deployment` | E2E integration tests, Docker orchestration, production build |

---

## 2. Commit Message Convention

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification with mandatory batch scope:

```
<type>(<scope>): <subject>
```

### Allowed Types:
- `feat`: New feature or capability for a specific batch.
- `fix`: Bug fix.
- `refactor`: Code restructuring without functional alterations.
- `test`: Adding or modifying automated test suites.
- `docs`: Documentation enhancements.
- `chore`: Build scripts, dependencies, or toolchain changes.

### Examples:
- `feat(batch-01): create BatchSaver project foundation`
- `feat(batch-02): implement Gaussian noise and drift simulator`
- `fix(batch-04): correct health score non-linear weighting calculation`

---

## 3. Pull Request Requirements

1. **Target Branch**: All feature branches must target `main`.
2. **Checks**: PRs must pass all automated CI checks (`npm run typecheck`, `npm test`).
3. **No Direct Commits to Main**: Branch protection is strictly enforced.
4. **Clean Diff**: Do not commit secrets, `.env` files, temporary logs, or untracked binary dependencies.

---

## 4. Architectural Rules

- **Loosely Coupled Modules**: Modules must interact only through exported interfaces and contracts.
- **No Hardcoded Process Parameters**: Always import targets and tolerances from `@batchsaver/config`.
- **Clean Service/Repository Layering**: Keep business logic decoupled from transport/controllers and database DDL.
- **Deterministic Testing**: Write unit tests for all domain calculations in `tests/unit/`.
