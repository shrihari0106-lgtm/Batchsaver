# BatchSaver API Overview & Architecture

## 1. Base URL & Protocol
- **REST API Base**: `http://localhost:4000/api/v1`
- **Real-Time WebSocket**: `ws://localhost:4000/ws`
- **Server-Sent Events (SSE)**: `http://localhost:4000/api/v1/stream/events`

## 2. API Endpoints Catalog

### Batches (`/api/v1/batches`)
- `POST /` - Create a new batch
- `GET /` - List active and historical batches
- `GET /:id` - Get full batch summary and metrics
- `PATCH /:id/status` - Update batch status (`SCHEDULED`, `IN_PROGRESS`, `HOLD`, `COMPLETED`, `ABORTED`)

### Sensors (`/api/v1/sensors`)
- `POST /ingest` - Push raw telemetry point
- `GET /statuses` - Get real-time health and connection status of all sensors
- `GET /stream/:batchId/:sensorId` - Query recent telemetry window

### Quality (`/api/v1/quality`)
- `GET /:batchId/overview` - Composite quality overview for all 4 parameters
- `GET /:batchId/health` - Current 0-100 Batch Health Score

### Deviations & AI Recommendations (`/api/v1/deviations` & `/api/v1/recommendations`)
- `GET /deviations?batchId=...` - List active deviations
- `GET /recommendations?batchId=...` - List pending AI recommendations
- `GET /recommendations/:id` - Inspect recommendation rationale, confidence score, and safety limits

### Operator & Actuator Control (`/api/v1/operators` & `/api/v1/actuators`)
- `POST /operators/decision` - Submit operator approval / rejection / modification
- `GET /actuators` - List actuator states and positions
- `POST /actuators/dispatch` - Manual or approved command dispatch

### Audit & Compliance (`/api/v1/audit`)
- `GET /logs` - Query immutable audit logs
- `GET /traceability/:batchId` - Complete batch genealogy report

### Authentication (`/api/v1/auth`)
- `POST /login` - User authentication
- `GET /me` - Validate session token and retrieve user role
