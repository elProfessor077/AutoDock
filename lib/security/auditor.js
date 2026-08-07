/**
 * Container Security Auditor — inspects generated Dockerfile and Docker Compose
 * configurations against DevSecOps best practices.
 */

function auditContainerSecurity(dockerfile = '', dockerCompose = '', config = {}) {
  const checks = [];
  let score = 100;

  // 1. Non-Root USER Check
  const hasUserDirective = /USER\s+(?!root\b)[\w\-]+/i.test(dockerfile);
  if (hasUserDirective) {
    checks.push({
      id: 'non_root_user',
      title: 'Non-Root Execution Guard',
      passed: true,
      desc: 'Container runs under an isolated non-root user account.',
      points: 20,
    });
  } else {
    score -= 20;
    checks.push({
      id: 'non_root_user',
      title: 'Non-Root Execution Guard',
      passed: false,
      desc: 'No non-root USER directive detected. Container defaults to root execution.',
      points: 0,
      recommendation: 'Add "USER node" or "USER 10001" to isolate runtime privileges.',
    });
  }

  // 2. Base Image LTS Tag Pinning Check
  const hasUnpinnedLatest = /FROM\s+[\w\-\.\/]+:latest/i.test(dockerfile);
  const hasPinnedTag = /FROM\s+[\w\-\.\/]+:(?:[0-9\.\-]+(?:-alpine|-slim)?)/i.test(dockerfile) || /FROM\s+scratch/i.test(dockerfile);

  if (!hasUnpinnedLatest && hasPinnedTag) {
    checks.push({
      id: 'lts_tag_pinning',
      title: 'LTS Image Tag Pinning',
      passed: true,
      desc: 'Base image is pinned to an explicit version tag instead of wildcards.',
      points: 20,
    });
  } else {
    score -= 20;
    checks.push({
      id: 'lts_tag_pinning',
      title: 'LTS Image Tag Pinning',
      passed: false,
      desc: 'Base image uses unpinned tags like :latest or unversioned builds.',
      points: 0,
      recommendation: 'Pin base images to explicit version tags (e.g. node:20-alpine).',
    });
  }

  // 3. Multi-Stage Isolation Check
  const stageMatches = (dockerfile.match(/FROM\s+/gi) || []).length;
  if (stageMatches >= 2 || /FROM\s+scratch/i.test(dockerfile)) {
    checks.push({
      id: 'multi_stage_build',
      title: 'Multi-Stage Build Isolation',
      passed: true,
      desc: 'Build dependencies and tools are stripped out from final production image.',
      points: 20,
    });
  } else {
    score -= 15;
    checks.push({
      id: 'multi_stage_build',
      title: 'Multi-Stage Build Isolation',
      passed: false,
      desc: 'Single stage build detected. Dev toolchains may inflate image size.',
      points: 5,
      recommendation: 'Use multi-stage builds (FROM ... AS builder) to strip build bloat.',
    });
  }

  // 4. Container Healthcheck Check
  const hasDockerHealthcheck = /HEALTHCHECK/i.test(dockerfile) || /healthcheck:/i.test(dockerCompose);
  if (hasDockerHealthcheck) {
    checks.push({
      id: 'healthcheck_probe',
      title: 'Active Health Probes',
      passed: true,
      desc: 'Container health probes are configured to detect crashes and restarts.',
      points: 15,
    });
  } else {
    score -= 10;
    checks.push({
      id: 'healthcheck_probe',
      title: 'Active Health Probes',
      passed: false,
      desc: 'No explicit HEALTHCHECK directive or Compose probe detected.',
      points: 5,
      recommendation: 'Add container healthchecks to monitor service availability.',
    });
  }

  // 5. Plaintext Secret Hardcoding Check
  const hasHardcodedSecret = /ENV\s+(?:PASSWORD|SECRET|KEY|API_KEY)=["']?\w+["']?/i.test(dockerfile);
  if (!hasHardcodedSecret) {
    checks.push({
      id: 'secret_shield',
      title: 'Credential Exposure Shield',
      passed: true,
      desc: 'No hardcoded credentials or API keys embedded in ENV instructions.',
      points: 15,
    });
  } else {
    score -= 20;
    checks.push({
      id: 'secret_shield',
      title: 'Credential Exposure Shield',
      passed: false,
      desc: 'Plaintext sensitive secrets detected inside Dockerfile ENV directives.',
      points: 0,
      recommendation: 'Inject credentials at runtime via .env files or secret vaults.',
    });
  }

  // 6. Safe Port Exposure Check
  const hasRootPorts = /EXPOSE\s+(?:22|80|443)\b/i.test(dockerfile);
  if (!hasRootPorts) {
    checks.push({
      id: 'port_isolation',
      title: 'Safe Port Isolation',
      passed: true,
      desc: 'Application exposes unprivileged high-number ports (e.g. 3000, 8000, 8080).',
      points: 10,
    });
  } else {
    score -= 10;
    checks.push({
      id: 'port_isolation',
      title: 'Safe Port Isolation',
      passed: false,
      desc: 'Exposes restricted low ports without unprivileged port remapping.',
      points: 0,
      recommendation: 'Expose unprivileged ports (3000+) inside containers.',
    });
  }

  const finalScore = Math.max(0, Math.min(100, score));

  let grade = 'A+';
  let badgeColor = '#a3be8c'; // green
  if (finalScore < 60) {
    grade = 'F';
    badgeColor = '#bf616a';
  } else if (finalScore < 75) {
    grade = 'C';
    badgeColor = '#d08770';
  } else if (finalScore < 90) {
    grade = 'B';
    badgeColor = '#ebcb8b';
  } else if (finalScore < 98) {
    grade = 'A';
    badgeColor = '#a3be8c';
  }

  return {
    score: finalScore,
    grade,
    badgeColor,
    checks,
    passedCount: checks.filter((c) => c.passed).length,
    totalCount: checks.length,
  };
}

module.exports = { auditContainerSecurity };
