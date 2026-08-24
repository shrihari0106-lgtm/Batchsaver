# Module 4: Operator & Actuator Control

## 1. Overview & Purpose
Module 4 enforces **Human-in-the-Loop (HITL)** safety protocols. Every AI recommendation is presented to the authorized plant operator, who can approve, reject, or modify the parameter before command dispatch to physical or simulated actuators.

## 2. Operator Workflow
1. **Notification**: Operator receives real-time prompt on HMI with deviation rationale, confidence score, and expected stabilization time.
2. **Review & Decision**:
   - **APPROVE**: Dispatches recommended target values directly.
   - **MODIFY**: Adjusts dosing amount or duration within safety bounds.
   - **REJECT**: Dismisses suggestion with mandatory comment for audit logging.
   - **ESCALATE**: Forwards decision to Shift Supervisor or Quality Manager.
3. **Safety Interlocks**:
   - Maximum single-dose volume check (e.g. max 1000ml).
   - Maximum heating rate limit (e.g. max 2.0°C/min).
   - Stirrer RPM clamp (e.g. 50 - 300 RPM).
4. **Command Execution & Feedback**:
   - Dispatch to Actuator Provider.
   - Timeout handling (e.g. 10-second command ACK timeout).
   - Execution verification and error reporting.

## 3. Supported Actuator Types
- **Dosing Pump**: High-precision fluid injection (water / oil / flavouring).
- **Proportional Valve**: Heating / cooling jacket steam or chilled water control.
- **Mixer / Agitator**: Variable frequency drive (VFD) speed adjustment.
