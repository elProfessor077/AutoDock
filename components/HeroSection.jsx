'use client';

import React from 'react';

export default function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="hero-title">
        Deploy Instantly With<br />
        <span className="gradient-text">AI Blueprints</span>
      </h1>
      <p className="hero-subtitle">
        Drop your project archive (.zip). Dockeryze scans requirements,
        retrieves verified deployment patterns from its vector base, and creates
        a secure Dockerfile & compose setup in seconds.
      </p>
    </section>
  );
}
