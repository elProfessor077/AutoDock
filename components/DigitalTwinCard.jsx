'use client';

import React, { useState } from 'react';
import { simulateDigitalTwin } from '@/lib/simulators/digitalTwinSimulator';

export default function DigitalTwinCard({ ecosystem = 'nodejs', dependencyCount = 15, databases = [] }) {
  const [concurrency, setConcurrency] = useState(50);

  const simulation = simulateDigitalTwin({
    ecosystem,
    dependencyCount,
    databases,
    concurrencyTarget: concurrency
  });

  const { appMetrics, clusterMetrics } = simulation;

  // RAM Usage Percentage relative to Limit
  const idlePct = Math.min(Math.round((appMetrics.idleMemoryMb / appMetrics.recommendedMemoryLimitMb) * 100), 100);
  const peakPct = Math.min(Math.round((appMetrics.peakMemoryMb / appMetrics.recommendedMemoryLimitMb) * 100), 100);

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '16px',
      padding: '24px',
      marginTop: '24px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      color: '#f8fafc',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontSize: '24px',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(96, 165, 250, 0.4)'
          }}>
            ⚡
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, background: 'linear-gradient(90deg, #60a5fa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Digital Twin Resource Simulator
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Simulated RAM/CPU footprint before container deployment
            </p>
          </div>
        </div>

        {/* Concurrency Load Presets */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '3px', borderRadius: '8px' }}>
          {[
            { label: '50 req/s', val: 50 },
            { label: '250 req/s', val: 250 },
            { label: '1,000 req/s', val: 1000 },
          ].map((preset) => (
            <button
              key={preset.val}
              type="button"
              onClick={() => setConcurrency(preset.val)}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                background: concurrency === preset.val ? '#3b82f6' : 'transparent',
                color: concurrency === preset.val ? '#fff' : '#94a3b8',
                transition: 'all 0.2s ease',
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Metric 1: Idle Memory */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', tracking: '0.05em' }}>Idle Boot RAM</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            {appMetrics.idleMemoryMb} <span style={{ fontSize: '12px', fontWeight: 500 }}>MB</span>
          </div>
        </div>

        {/* Metric 2: Peak Memory */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', tracking: '0.05em' }}>Est. Peak RAM</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
            {appMetrics.peakMemoryMb} <span style={{ fontSize: '12px', fontWeight: 500 }}>MB</span>
          </div>
        </div>

        {/* Metric 3: Memory Limit */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', tracking: '0.05em' }}>Docker Limit Cap</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#4ade80', marginTop: '4px' }}>
            {appMetrics.recommendedMemoryLimitMb} <span style={{ fontSize: '12px', fontWeight: 500 }}>MB</span>
          </div>
        </div>

        {/* Metric 4: CPU Cores */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', tracking: '0.05em' }}>CPU Limit</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#facc15', marginTop: '4px' }}>
            {appMetrics.recommendedCpuLimit} <span style={{ fontSize: '12px', fontWeight: 500 }}>Cores</span>
          </div>
        </div>

        {/* Metric 5: Estimated Monthly Cost */}
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', tracking: '0.05em' }}>Est. Cloud Cost</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#fb7185', marginTop: '4px' }}>
            ${clusterMetrics.monthlyCostEstimateUsd} <span style={{ fontSize: '12px', fontWeight: 500 }}>/mo</span>
          </div>
        </div>
      </div>

      {/* RAM Simulation Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#cbd5e1', marginBottom: '8px' }}>
          <span>RAM Utilization Gauge ({appMetrics.peakMemoryMb}MB Peak of {appMetrics.recommendedMemoryLimitMb}MB Limit)</span>
          <strong style={{ color: '#60a5fa' }}>{peakPct}% Allocated</strong>
        </div>

        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
          {/* Peak RAM Bar */}
          <div style={{
            height: '100%',
            width: `${peakPct}%`,
            background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 70%, #ec4899 100%)',
            borderRadius: '6px',
            transition: 'width 0.4s ease-out'
          }} />
        </div>
      </div>
    </div>
  );
}
