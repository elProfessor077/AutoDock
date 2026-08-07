'use client';

import React from 'react';

const MATRIX = [
  { feature: 'Interface Type', init: 'Terminal / CLI', AutoDock: 'Visual Drag-and-Drop' },
  { feature: 'Engine Type', init: 'Hardcoded Templates', AutoDock: 'Gemini AI + RAG Vector Engine' },
  { feature: 'LTS Tag Accuracy', init: '❌ Static / Outdated', AutoDock: '✅ RAG-Verified Active LTS Tags' },
  { feature: 'Database Setup', init: '❌ Manual / Missing', AutoDock: '✅ Auto-Generated & Pre-Wired' },
  { feature: 'Security Shielding', init: '❌ None (Assumes Safe)', AutoDock: '✅ Zip Slip Shield & 10MB Guard' },
  { feature: 'Memory Scrubbing', init: '❌ None', AutoDock: '✅ Instant Ephemeral Shredder' },
];

export default function ComparisonTable() {
  return (
    <section className="comparison-container" aria-labelledby="comparison-title">
      <h2 id="comparison-title" className="section-title">Competitive Advantage Matrix</h2>
      <div className="comparison-table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>docker init (Official)</th>
              <th>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/AutoDock-icon.png?v=3" alt="AutoDock Logo" width={22} height={22} style={{ borderRadius: '4px' }} />
                  AutoDock AI
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row, idx) => (
              <tr key={idx}>
                <td>{row.feature}</td>
                <td>{row.init}</td>
                <td style={{ color: 'var(--color-cyan)', fontWeight: 'bold' }}>{row.AutoDock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
