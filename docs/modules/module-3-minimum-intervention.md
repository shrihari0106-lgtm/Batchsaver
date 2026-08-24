# Module 3: AI / Minimum-Intervention Engine

## 1. Overview & Purpose
Module 3 is the intelligence core of BatchSaver. When deviations occur, it identifies the probable cause and calculates the **minimum effective corrective action** required to steer the batch back to nominal state without overshooting or damaging the food matrix.

## 2. Core Philosophy: Minimum Intervention
In wet masala manufacturing, over-correction (e.g. adding too much water or over-shearing with high agitator RPM) degrades texture and aroma. BatchSaver computes the minimal dosing volume or temperature adjustment needed, minimizing ingredient waste and cycle time.

## 3. Reason Codes & Cause Mapping

| Reason Code | Trigger Conditions | Recommended Action |
| :--- | :--- | :--- |
| `VISCOSITY_HIGH_INSUFFICIENT_WATER` | Viscosity > 3350 cP AND Moisture < 36.5% | Pulse water dosing pump (e.g. +250ml) |
| `VISCOSITY_LOW_OVER_DILUTION` | Viscosity < 3050 cP AND Moisture > 39.5% | Increase temperature setpoint (+1.5°C) to accelerate evaporation |
| `TEMPERATURE_OVERHEATING_JACKET` | Temp > 94.0°C | Modulate cooling jacket proportional valve |
| `COLOUR_UNDER_ROASTING` | Colour Index < 59 | Extend mixing cycle at current heat for +120s |

## 4. AI/ML Architecture Migration
- **Version 1 (Batch 05)**: Deterministic, fully explainable rule engine with transparent calculation steps.
- **Future ML Engine**: Bayesian Optimization / Reinforcement Learning agent adhering to the same `ICorrectionEngine` interface.
