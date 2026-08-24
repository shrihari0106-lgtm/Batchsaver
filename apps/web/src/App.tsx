import React, { useState } from 'react';
import './index.css';

interface ParameterState {
  name: string;
  key: string;
  target: number;
  tolerance: number;
  unit: string;
  currentValue: number;
  state: 'NOMINAL' | 'WARNING' | 'DEVIATION' | 'CRITICAL';
}

export const App: React.FC = () => {
  const [batchId] = useState('BATCH-20260824-001');
  const [recipeName] = useState('Royal Garam Wet Masala Emulsion');
  const [healthScore] = useState(98);

  const parameters: ParameterState[] = [
    {
      name: 'Viscosity',
      key: 'VISCOSITY',
      target: 3200,
      tolerance: 150,
      unit: 'cP',
      currentValue: 3215,
      state: 'NOMINAL',
    },
    {
      name: 'Moisture Content',
      key: 'MOISTURE',
      target: 38.0,
      tolerance: 1.5,
      unit: '%',
      currentValue: 37.9,
      state: 'NOMINAL',
    },
    {
      name: 'Colour Index',
      key: 'COLOUR_INDEX',
      target: 62.0,
      tolerance: 3.0,
      unit: 'CI',
      currentValue: 62.4,
      state: 'NOMINAL',
    },
    {
      name: 'Process Temperature',
      key: 'TEMPERATURE',
      target: 92.0,
      tolerance: 2.0,
      unit: '°C',
      currentValue: 92.1,
      state: 'NOMINAL',
    },
  ];

  return (
    <div>
      {/* Top Industrial Navigation Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-logo">BS</div>
          <div>
            <div className="brand-title">BatchSaver Platform</div>
            <div className="brand-subtitle">Industrial AI Quality & Minimum-Intervention HMI</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="badge badge-foundation">
            <span className="pulse-dot"></span>
            BATCH 01: FOUNDATION
          </span>
          <span className="badge badge-nominal">
            <span className="pulse-dot"></span>
            SYSTEM ONLINE
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-container">
        {/* Foundation Notice Banner */}
        <div className="banner-notice">
          <div>
            <h3 style={{ color: '#ffffff', marginBottom: '0.25rem' }}>Architectural Foundation Initialized</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              This React Vite application establishes the frontend foundation for BatchSaver. 
              Module telemetry streams, AI intervention loops, and PLC drivers will be connected in subsequent batches.
            </p>
          </div>
          <span className="badge badge-foundation">VITE + REACT 18</span>
        </div>

        {/* Active Batch Summary HUD */}
        <section className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Batch In Production
              </div>
              <h2 style={{ fontSize: '1.5rem', color: '#ffffff', marginTop: '0.25rem' }}>
                {recipeName}
              </h2>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Batch: <strong className="mono" style={{ color: '#ffffff' }}>{batchId}</strong></span>
                <span>Line: <strong style={{ color: '#ffffff' }}>Line 01 (Vessel A)</strong></span>
                <span>Operator: <strong style={{ color: '#ffffff' }}>Shift Supervisor (HMI-01)</strong></span>
              </div>
            </div>

            {/* Health Score Meter */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Batch Health Score
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--status-nominal)' }}>
                {healthScore}<span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <span className="badge badge-nominal">State: NOMINAL</span>
            </div>
          </div>
        </section>

        {/* 4 Monitored Quality Parameters */}
        <section>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Core Monitored Quality Parameters
          </h3>
          <div className="grid-parameters">
            {parameters.map((p) => (
              <div key={p.key} className="glass-panel param-card">
                <div className="param-header">
                  <div>
                    <div className="param-name">{p.name}</div>
                    <span className="badge badge-nominal" style={{ marginTop: '0.35rem' }}>
                      <span className="pulse-dot"></span>
                      {p.state}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                    TARGET: {p.target} {p.unit}
                  </div>
                </div>

                <div className="param-reading">
                  {p.currentValue}
                  <span className="param-unit">{p.unit}</span>
                </div>

                <div className="param-footer">
                  <span>Acceptable: <strong className="mono">{p.target - p.tolerance} - {p.target + p.tolerance}</strong></span>
                  <span>Tol: <strong className="mono">±{p.tolerance} {p.unit}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modular Architecture Layout */}
        <div className="split-dashboard">
          {/* Module Blueprint */}
          <section className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '1rem' }}>
              BatchSaver Six-Module Architecture
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--accent-cyan)' }}>
                <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Module 1: Data Acquisition</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Sensor abstraction, noise/drift simulation & OPC-UA/MQTT drivers</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--status-nominal)' }}>
                <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Module 2: Quality Engine</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Real-time tolerance evaluation & composite health scoring</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--accent-indigo)' }}>
                <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Module 3: Minimum Intervention</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Explainable reason codes & minimum corrective dosing rules</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--status-warning)' }}>
                <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Module 4: Operator Control</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Human-in-the-loop validation & actuator safety interlocks</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)' }}>
                <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Module 5: Dashboard HMI</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Vessel visualizer, real-time charts & alert feeds</p>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--status-recovering)' }}>
                <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Module 6: Traceability</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>PostgreSQL genealogy, audit logs & RBAC permissions</p>
              </div>
            </div>
          </section>

          {/* Vessel Visualization Blueprint */}
          <section className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', border: '2px dashed var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <span className="mono" style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>92°C</span>
            </div>
            <h4 style={{ color: '#ffffff', marginBottom: '0.25rem' }}>Vessel A: Main Mixing Tank</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Agitator: 120 RPM | Jacket: Active | Valve: Closed</p>
            <span className="badge badge-nominal" style={{ marginTop: '0.75rem' }}>INTERLOCKS OK</span>
          </section>
        </div>
      </main>
    </div>
  );
};
