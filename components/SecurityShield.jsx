'use client';

import React from 'react';

const SHIELDS = [
  {
    icon: '🛡️',
    title: '10MB Payload Ceiling',
    desc: 'Protects the server from denial-of-service (DoS) and memory exhaustion attempts.',
  },
  {
    icon: '🔒',
    title: 'Zip Slip Sanitization',
    desc: 'Aborts and rejects directory traversal paths (e.g. "../") before writing files to disk.',
  },
  {
    icon: '🎯',
    title: 'Strict JSON Schema',
    desc: 'Forces Gemini AI to structure responses, eliminating prompt injection & syntax errors.',
  },
  {
    icon: '🧹',
    title: 'Zero Persistent Storage',
    desc: 'An ephemeral digital shredder sweeps and cleans temporary work paths instantly.',
  },
];

export default function SecurityShield() {
  return (
    <section className="security-section" aria-labelledby="security-title">
      <h2 id="security-title" className="section-title">The Security Shield Layer</h2>
      <div className="security-grid">
        {SHIELDS.map((shield, idx) => (
          <div key={idx} className="security-card">
            <span className="security-icon">{shield.icon}</span>
            <div>
              <h3 className="security-card-title">{shield.title}</h3>
              <p className="security-card-desc">{shield.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
