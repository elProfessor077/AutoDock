/**
 * Cloud Compiler — synthesizes Kubernetes manifests (Deployment & Service),
 * Fly.io fly.toml, and Render.yaml deployment manifests based on ecosystem config.
 */

function compileCloudManifests(config = {}) {
  const appName = (config.projectName || 'AutoDock-app').toLowerCase().replace(/[^a-z0-9\-]/g, '-');
  const port = config.applicationPort || 3000;
  const runtime = config.runtime || 'nodejs';
  const db = config.db || 'none';

  // 1. Kubernetes Deployment Manifest (k8s-deployment.yaml)
  const k8sDeployment = `# ── AutoDock Generated Kubernetes Deployment Manifest ─────────────────
# Application: ${appName} | Port: ${port} | Ecosystem: ${runtime}
# ─────────────────────────────────────────────────────────────────────────────

apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${appName}-deployment
  labels:
    app: ${appName}
    tier: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${appName}
  template:
    metadata:
      labels:
        app: ${appName}
    spec:
      containers:
        - name: ${appName}
          image: ${appName}:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: ${port}
          envFrom:
            - configMapRef:
                name: ${appName}-config
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          readinessProbe:
            httpGet:
              path: /
              port: ${port}
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /
              port: ${port}
            initialDelaySeconds: 15
            periodSeconds: 20
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: false
            runAsNonRoot: true
`;

  // 2. Kubernetes Service Manifest (k8s-service.yaml)
  const k8sService = `# ── AutoDock Generated Kubernetes Service Manifest ────────────────────
apiVersion: v1
kind: Service
metadata:
  name: ${appName}-service
  labels:
    app: ${appName}
spec:
  type: ClusterIP
  ports:
    - port: ${port}
      targetPort: ${port}
      protocol: TCP
      name: http
  selector:
    app: ${appName}
`;

  // 3. Fly.io Deployment Manifest (fly.toml)
  const flyToml = `# ── AutoDock Generated Fly.io fly.toml ─────────────────────────────────
# Deploy with: fly launch && fly deploy
# ─────────────────────────────────────────────────────────────────────────────

app = "${appName}"
primary_region = "iad"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "${port}"
  NODE_ENV = "production"

[[services]]
  protocol = "tcp"
  internal_port = ${port}
  processes = ["app"]

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [[services.http_checks]]
    interval = "10s"
    timeout = "2s"
    grace_period = "5s"
    method = "get"
    path = "/"
    protocol = "http"
`;

  // 4. Render.yaml Blueprint Manifest
  const renderYaml = `# ── AutoDock Generated Render.yaml Infrastructure Blueprint ─────────────
services:
  - type: web
    name: ${appName}
    env: docker
    dockerfilePath: ./Dockerfile
    plan: free
    region: oregon
    envVars:
      - key: PORT
        value: "${port}"
      - key: NODE_ENV
        value: production
${db !== 'none' ? `    # Connected Database: ${db}` : ''}
`;

  return {
    k8sDeployment,
    k8sService,
    flyToml,
    renderYaml,
  };
}

module.exports = { compileCloudManifests };
