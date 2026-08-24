-- =============================================================================
-- BatchSaver PostgreSQL Relational Database Schema
-- Industrial Monitoring & Quality Traceability
-- Version: 0.1.0 (Foundation)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & RBAC
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('OPERATOR', 'SUPERVISOR', 'QUALITY_MANAGER', 'ADMINISTRATOR')),
    active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Batches
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    recipe_id VARCHAR(100) NOT NULL,
    recipe_name VARCHAR(255) NOT NULL,
    line_id VARCHAR(100) NOT NULL,
    vessel_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'IN_PROGRESS', 'HOLD', 'COMPLETED', 'ABORTED')),
    current_health_score NUMERIC(5, 2) DEFAULT 100.0,
    current_quality_state VARCHAR(50) DEFAULT 'NOMINAL',
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    target_volume_kg NUMERIC(10, 2) NOT NULL,
    actual_volume_kg NUMERIC(10, 2),
    operator_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Sensor Readings (High-frequency telemetry)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sensor_id VARCHAR(100) NOT NULL,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    parameter VARCHAR(50) NOT NULL CHECK (parameter IN ('VISCOSITY', 'MOISTURE', 'COLOUR_INDEX', 'TEMPERATURE')),
    raw_value NUMERIC(12, 4) NOT NULL,
    filtered_value NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    quality VARCHAR(20) NOT NULL DEFAULT 'GOOD',
    simulated BOOLEAN DEFAULT TRUE,
    noise_applied NUMERIC(8, 4) DEFAULT 0.0,
    drift_applied NUMERIC(8, 4) DEFAULT 0.0,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_batch_param_time 
ON sensor_readings(batch_id, parameter, timestamp DESC);

-- 4. Quality Measurements (Calculated state & deviations)
CREATE TABLE IF NOT EXISTS quality_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    parameter VARCHAR(50) NOT NULL CHECK (parameter IN ('VISCOSITY', 'MOISTURE', 'COLOUR_INDEX', 'TEMPERATURE')),
    value NUMERIC(12, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    target_value NUMERIC(12, 4) NOT NULL,
    acceptable_min NUMERIC(12, 4) NOT NULL,
    acceptable_max NUMERIC(12, 4) NOT NULL,
    deviation_amount NUMERIC(12, 4) NOT NULL,
    deviation_percentage NUMERIC(8, 4) NOT NULL,
    state VARCHAR(50) NOT NULL CHECK (state IN ('NOMINAL', 'WARNING', 'DEVIATION', 'CRITICAL', 'RECOVERING', 'RECOVERED')),
    raw_reading_id UUID REFERENCES sensor_readings(id)
);

CREATE INDEX IF NOT EXISTS idx_quality_measurements_batch_state 
ON quality_measurements(batch_id, state, timestamp DESC);

-- 5. Deviation Events
CREATE TABLE IF NOT EXISTS deviations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    parameter VARCHAR(50) NOT NULL CHECK (parameter IN ('VISCOSITY', 'MOISTURE', 'COLOUR_INDEX', 'TEMPERATURE')),
    observed_value NUMERIC(12, 4) NOT NULL,
    target_value NUMERIC(12, 4) NOT NULL,
    deviation_percentage NUMERIC(8, 4) NOT NULL,
    direction VARCHAR(30) NOT NULL CHECK (direction IN ('ABOVE_TARGET', 'BELOW_TARGET')),
    severity VARCHAR(30) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    state VARCHAR(50) NOT NULL,
    probable_reason_code VARCHAR(100) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_deviations_active ON deviations(batch_id, active);

-- 6. AI / Minimum-Intervention Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    deviation_event_id UUID NOT NULL REFERENCES deviations(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reason_code VARCHAR(100) NOT NULL,
    explanation TEXT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_actuator_id VARCHAR(100) NOT NULL,
    recommended_value NUMERIC(10, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    duration_seconds INTEGER,
    confidence_score NUMERIC(4, 3) NOT NULL,
    is_minimum_intervention BOOLEAN DEFAULT TRUE,
    safety_limits JSONB NOT NULL,
    expected_outcome JSONB NOT NULL
);

-- 7. Operator Decisions (HITL)
CREATE TABLE IF NOT EXISTS operator_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id UUID NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES users(id),
    decision VARCHAR(50) NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED', 'MODIFIED', 'ESCALATED')),
    modified_value NUMERIC(10, 4),
    modified_duration_seconds INTEGER,
    comments TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Actuator Commands & Responses
CREATE TABLE IF NOT EXISTS actuator_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    recommendation_id UUID REFERENCES recommendations(id),
    operator_decision_id UUID REFERENCES operator_decisions(id),
    actuator_id VARCHAR(100) NOT NULL,
    actuator_type VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_value NUMERIC(10, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    duration_seconds INTEGER,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS actuator_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    command_id UUID NOT NULL REFERENCES actuator_commands(id) ON DELETE CASCADE,
    actuator_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    actual_value_executed NUMERIC(10, 4) NOT NULL,
    execution_duration_seconds NUMERIC(8, 2) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    error_message TEXT
);

-- 9. Recovery Events
CREATE TABLE IF NOT EXISTS recovery_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    deviation_event_id UUID NOT NULL REFERENCES deviations(id),
    actuator_command_id UUID REFERENCES actuator_commands(id),
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recovery_completed_time TIMESTAMPTZ,
    initial_deviation_pct NUMERIC(8, 4) NOT NULL,
    final_deviation_pct NUMERIC(8, 4) NOT NULL,
    parameter VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('IN_PROGRESS', 'SUCCESSFUL', 'PARTIAL', 'FAILED')),
    recovery_duration_seconds NUMERIC(8, 2)
);

-- 10. Immutable Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES users(id),
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    batch_id UUID REFERENCES batches(id),
    previous_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(50),
    details TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_batch_time ON audit_logs(batch_id, timestamp DESC);
