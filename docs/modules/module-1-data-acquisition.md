# Module 1: Data Acquisition & Simulation

## 1. Overview & Purpose
Module 1 handles physical sensor abstraction, realistic telemetry generation (for development and unit testing), and drivers for industrial automation protocols (OPC-UA, Modbus TCP, MQTT, and PLC DAQ cards).

## 2. Key Responsibilities
- **Sensor Abstraction**: Unified `SensorReading` schema for Viscosity, Moisture, Colour Index, and Temperature.
- **Telemetry Simulation**:
  - Configurable sampling intervals (default 1000ms / 1Hz).
  - Gaussian process noise injection (Box-Muller algorithm).
  - Continuous thermal and evaporation process drift.
  - Sensor failure injection (signal dropout, stuck sensor, drift spikes).
- **Industrial Drivers**:
  - `SimulatedSensorAdapter`: Software-only signal generator.
  - `MqttSensorAdapter`: Ingests from edge brokers.
  - `OpcUaSensorAdapter`: Subscribes to industrial PLC nodes.
  - `ModbusTcpSensorAdapter`: Polls holding registers from remote I/O modules.

## 3. Implementation Roadmap (Batch 02)
- Implement `SimulatedSensorProvider` with customizable batch scenarios.
- Connect real-time event emitters to stream readings to Module 2.
