'use client';

import React from 'react';

const STEPS = [
  {
    num: '01',
    title: 'Drop Your Archive',
    desc: 'Select or drag-drop your zip file. All packages are scanned client-side & server-side to enforce limits.',
  },
  {
    num: '02',
    title: 'RAG Pre-Filtering',
    desc: 'The pipeline extracts configuration files and queries the RAG vector base for exact LTS base image versions.',
  },
  {
    num: '03',
    numClass: 'highlight',
    title: 'Download Blueprint',
    desc: 'Receive an optimized Dockerfile and compose setup instantly. Run docker compose up to launch.',
  },
];

export default function FeatureGrid() {
  return (
    <>
      <h2 className="section-title">How It Works</h2>
      <section className="features-grid" aria-label="Feature Steps">
        {STEPS.map((step) => (
          <article key={step.num} className="feature-card">
            <span className="feature-number">Step {step.num}</span>
            <h3 className="feature-title">{step.title}</h3>
            <p className="feature-desc">{step.desc}</p>
          </article>
        ))}
      </section>
    </>
  );
}
