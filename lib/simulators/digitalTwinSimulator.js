/**
 * Digital Twin Container Resource Simulator & Profiler
 * 
 * Mathematical modeling engine that analyzes runtime environment, dependency
 * manifest density, and database connection pools to simulate container memory,
 * CPU consumption, and cloud hosting cost estimates prior to deployment.
 */

// Baseline runtime footprints (Idle RAM in MB & CPU baseline)
const RUNTIME_BASELINES = {
  nodejs: { baseRamMb: 35, baseCpu: 0.25, ramPerDepMb: 0.4 },
  python: { baseRamMb: 45, baseCpu: 0.25, ramPerDepMb: 0.5 },
  go: { baseRamMb: 12, baseCpu: 0.15, ramPerDepMb: 0.1 },
  rust: { baseRamMb: 8, baseCpu: 0.10, ramPerDepMb: 0.05 },
  java: { baseRamMb: 180, baseCpu: 0.50, ramPerDepMb: 1.2 },
  ruby: { baseRamMb: 55, baseCpu: 0.30, ramPerDepMb: 0.6 },
  php: { baseRamMb: 40, baseCpu: 0.25, ramPerDepMb: 0.3 },
  unknown: { baseRamMb: 40, baseCpu: 0.25, ramPerDepMb: 0.4 }
};

// Database container resource footprints (RAM in MB)
const DB_RESOURCE_MAP = {
  postgres: { idleRamMb: 45, peakRamMb: 256, cpus: '0.50' },
  redis: { idleRamMb: 15, peakRamMb: 128, cpus: '0.25' },
  mongodb: { idleRamMb: 60, peakRamMb: 512, cpus: '0.50' },
  mysql: { idleRamMb: 50, peakRamMb: 384, cpus: '0.50' }
};

/**
 * Simulate container resource profile
 * 
 * @param {Object} params
 * @param {string} params.ecosystem - Primary runtime ecosystem (nodejs, python, go, etc.)
 * @param {number} params.dependencyCount - Number of manifest dependencies
 * @param {Array<string>} params.databases - Array of connected databases (postgres, redis, etc.)
 * @param {number} params.concurrencyTarget - Target concurrent requests (default: 50)
 */
export function simulateDigitalTwin({
  ecosystem = 'nodejs',
  dependencyCount = 15,
  databases = [],
  concurrencyTarget = 50
}) {
  const normEco = (ecosystem || 'nodejs').toLowerCase();
  const ecoBaseline = RUNTIME_BASELINES[normEco] || RUNTIME_BASELINES.unknown;

  // 1. Calculate App Container RAM
  const depOverheadMb = Math.min(dependencyCount * ecoBaseline.ramPerDepMb, 120);
  const dbPoolOverheadMb = databases.length * 12;
  const concurrencyOverheadMb = Math.round(concurrencyTarget * 0.8);

  const idleMemoryMb = Math.round(ecoBaseline.baseRamMb + depOverheadMb + dbPoolOverheadMb);
  const peakMemoryMb = Math.round(idleMemoryMb + concurrencyOverheadMb + (ecoBaseline.baseRamMb * 0.8));

  // Recommended Hard Limits (with 25% safety buffer)
  const rawLimitMb = Math.ceil((peakMemoryMb * 1.25) / 64) * 64; // Round up to nearest 64MB block
  const recommendedMemoryLimitMb = Math.max(rawLimitMb, 128);
  const recommendedMemoryReservationMb = Math.max(Math.ceil((idleMemoryMb * 1.1) / 32) * 32, 64);

  // Recommended CPU Cores Limit
  let cpuLimitCores = ecoBaseline.baseCpu;
  if (concurrencyTarget > 100) cpuLimitCores += 0.5;
  if (databases.length > 1) cpuLimitCores += 0.25;
  const recommendedCpuLimit = Math.min(cpuLimitCores, 2.0).toFixed(2);

  // Calculate Database Service Footprints if databases are present
  const simulatedServices = [
    {
      name: 'app',
      idleRamMb: idleMemoryMb,
      peakRamMb: peakMemoryMb,
      limitMemoryMb: recommendedMemoryLimitMb,
      limitCpu: recommendedCpuLimit
    }
  ];

  let totalClusterMemoryMb = recommendedMemoryLimitMb;

  for (const db of databases) {
    const dbProfile = DB_RESOURCE_MAP[db.toLowerCase()] || { idleRamMb: 30, peakRamMb: 128, cpus: '0.25' };
    simulatedServices.push({
      name: db,
      idleRamMb: dbProfile.idleRamMb,
      peakRamMb: dbProfile.peakRamMb,
      limitMemoryMb: dbProfile.peakRamMb,
      limitCpu: dbProfile.cpus
    });
    totalClusterMemoryMb += dbProfile.peakRamMb;
  }

  // Monthly Cost Estimate ($0.008 per MB-month on typical cloud VPS)
  const monthlyCostEstimateUsd = Math.max(Math.ceil((totalClusterMemoryMb / 1024) * 6), 5);

  return {
    ecosystem: normEco,
    dependencyCount,
    concurrencyTarget,
    appMetrics: {
      idleMemoryMb,
      peakMemoryMb,
      recommendedMemoryLimitMb,
      recommendedMemoryReservationMb,
      recommendedCpuLimit
    },
    clusterMetrics: {
      totalServices: simulatedServices.length,
      totalPeakMemoryMb: simulatedServices.reduce((sum, s) => sum + s.peakRamMb, 0),
      totalLimitMemoryMb: totalClusterMemoryMb,
      monthlyCostEstimateUsd
    },
    simulatedServices
  };
}
