# MQTT Topic Hierarchy & Schemas

## Topic Structure

```
batchsaver/<facility_id>/<line_id>/<vessel_id>/<category>/<subtopic>
```

### Telemetry Topics
- `batchsaver/factory01/line01/vessel01/telemetry/viscosity`
- `batchsaver/factory01/line01/vessel01/telemetry/moisture`
- `batchsaver/factory01/line01/vessel01/telemetry/colour`
- `batchsaver/factory01/line01/vessel01/telemetry/temperature`

### Actuator Control Topics
- `batchsaver/factory01/line01/vessel01/actuators/dosing_pump/command`
- `batchsaver/factory01/line01/vessel01/actuators/dosing_pump/feedback`
- `batchsaver/factory01/line01/vessel01/actuators/stirrer/command`
- `batchsaver/factory01/line01/vessel01/actuators/stirrer/feedback`

## Payload Example

```json
{
  "sensorId": "SENS-VISC-01",
  "batchId": "BATCH-20260824-001",
  "parameter": "VISCOSITY",
  "rawValue": 3215.4,
  "filteredValue": 3210.0,
  "unit": "cP",
  "timestamp": "2026-08-24T13:30:00Z"
}
```
