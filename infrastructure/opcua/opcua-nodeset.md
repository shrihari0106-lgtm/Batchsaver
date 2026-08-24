# OPC-UA Information Model & NodeSet Architecture

## Namespace
- `http://batchsaver.industrial.ai/UA/MasalaProcess/` (Index: 2)

## Object Hierarchy

```
Root
└── Objects
    └── BatchSaver
        ├── Vessel01
        │   ├── Telemetry
        │   │   ├── Viscosity (ns=2;s=Vessel01.Telemetry.Viscosity, DataType: Double, EURange: 2500..4000 cP)
        │   │   ├── Moisture (ns=2;s=Vessel01.Telemetry.Moisture, DataType: Double, EURange: 30..45 %)
        │   │   ├── ColourIndex (ns=2;s=Vessel01.Telemetry.ColourIndex, DataType: Double, EURange: 50..75 CI)
        │   │   └── Temperature (ns=2;s=Vessel01.Telemetry.Temperature, DataType: Double, EURange: 70..110 °C)
        │   ├── Actuators
        │   │   ├── WaterDosingPump (Methods: DoseMl(Double), SetRate(Double))
        │   │   ├── JacketHeater (Variables: Setpoint, Feedback)
        │   │   └── MainAgitator (Variables: SpeedRpm, Status)
        │   └── BatchContext
        │       ├── ActiveBatchId (DataType: String)
        │       ├── RecipeName (DataType: String)
        │       └── HealthScore (DataType: Double)
```
