'use client';

import React from 'react';

const MATRIX = [
  { feature: 'Interface Type', init: 'Terminal / CLI', devlaunch: 'Visual Drag-and-Drop' },
  { feature: 'Engine Type', init: 'Hardcoded Templates', devlaunch: 'Gemini AI + RAG Vector Engine' },
  { feature: 'LTS Tag Accuracy', init: '❌ Static / Outdated', devlaunch: '✅ RAG-Verified Active LTS Tags' },
  { feature: 'Database Setup', init: '❌ Manual / Missing', devlaunch: '✅ Auto-Generated & Pre-Wired' },
  { feature: 'Security Shielding', init: '❌ None (Assumes Safe)', devlaunch: '✅ Zip Slip Shield & 10MB Guard' },
  { feature: 'Memory Scrubbing', init: '❌ None', devlaunch: '✅ Instant Ephemeral Shredder' },
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
              <th>🛸 DevLaunch AI</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row, idx) => (
              <tr key={idx}>
                <td>{row.feature}</td>
                <td>{row.init}</td>
                <td style={{ color: '#06b6d4', fontWeight: 'bold' }}>{row.devlaunch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
