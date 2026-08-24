# Module 6: Traceability, Security & Deployment

## 1. Overview & Purpose
Module 6 ensures regulatory compliance (FDA 21 CFR Part 11 / ISO 22000 / FSSAI standard principles), end-to-end batch genealogy, role-based security, and cloud/edge deployment orchestration.

## 2. Immutable Audit Trail
Every system state transition is recorded in the append-only `audit_logs` table:
- User login / logout
- Recipe selection and parameter threshold modifications
- Deviations detected by Module 2
- AI recommendations produced by Module 3
- Operator approvals, rejections, and manual overrides
- Actuator dispatch and completion telemetry

## 3. Role-Based Access Control (RBAC) Matrix

| User Role | View Telemetry | Approve Recommendations | Modify Safety Limits | Manage Users & Recipes | Export Audit Reports |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Operator** | Yes | Yes | No | No | No |
| **Supervisor** | Yes | Yes (Override) | Yes (Limited) | No | Yes |
| **Quality Manager** | Yes | Yes | Yes | Yes | Yes |
| **Administrator** | Yes | No | Yes | Yes | Yes |

## 4. Security & Compliance
- JWT with short expiry and refresh token rotation.
- Password hashing with Argon2 or bcrypt.
- Granular permission middleware on all API routes.
- TLS 1.3 encryption in transit for all REST, WebSocket, MQTT, and OPC-UA streams.
