'use client';

import React from 'react';

export default function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-eyebrow">
        <span className="dot" />
        <span>INSTANT CONTAINERIZATION ENGINE</span>
      </div>
      <h1 id="hero-title" className="hero-title">
        Automated Docker &amp; Compose<br />
        <span className="gradient-text">Deployment Blueprints</span>
      </h1>
      <p className="hero-subtitle">
        Upload your source repository archive (.zip). Dockeryze scans dependency manifests,
        retrieves verified LTS base images from its RAG knowledge store, and generates
        production-ready Dockerfile &amp; docker-compose setups in seconds.
      </p>
    </section>
  );
}
