# Module 5: Dashboard & Visualization

## 1. Overview & Purpose
Module 5 provides the industrial HMI and operations dashboard for plant floor operators, supervisors, and quality managers. It delivers high-density, low-latency telemetry visualization adhering to modern industrial design principles.

## 2. Key Visual Components
- **Batch Health HUD**: Radial gauge and state badge (NOMINAL, WARNING, DEVIATION, CRITICAL, RECOVERING, RECOVERED).
- **Process Telemetry Graphs**:
  - Multi-parameter chart (Viscosity, Moisture, Colour, Temperature).
  - Target band overlays (green nominal zone, amber warning, red critical).
  - Annotation markers for deviation trigger points and actuator interventions.
- **Vessel Process Visualizer**:
  - Live animated SVG schematic of mixing vessel.
  - Agitator rotation indicator, fluid level, jacket heating status.
- **Intervention Panel**:
  - Immediate action card displaying AI recommendations, confidence score, and one-click approve/modify/reject controls.
- **Traceability Timeline**: Chronological log of batch milestones and events.

## 3. Technology Stack
- **Frontend**: Component-based TypeScript web application.
- **State & Streaming**: WebSocket / Server-Sent Events for real-time telemetry streaming.
- **Typography & Theme**: Dark-mode industrial interface (Outfit & JetBrains Mono fonts) for high contrast and readability under plant floor lighting.
