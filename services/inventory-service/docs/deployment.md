# Deployment Guide

This document covers deploying the Inventory Service to the workshop Kubernetes platform.

## Prerequisites

- Docker installed locally
- kubectl configured for the workshop EKS cluster
- Helm 3.x installed
- AWS CLI configured with ECR push permissions
- ArgoCD access (optional, for GitOps verification)

## Container Image

### Build Locally

```bash
cd services/inventory-service

docker build -f docker/Dockerfile -t inventory-service:local .
docker run -p 8080:8080 inventory-service:local
```

Verify at `http://localhost:8080/health` and `http://localhost:8080/swagger`.

### Push to ECR

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 599083837640.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag inventory-service:local \
  599083837640.dkr.ecr.us-east-1.amazonaws.com/workshop/inventory-service:latest

docker push \
  599083837640.dkr.ecr.us-east-1.amazonaws.com/workshop/inventory-service:latest
```

## Kubernetes Deployment

### Helm (Manual)

```bash
# Dev environment
helm upgrade --install inventory-service \
  services/inventory-service/helm/inventory-service \
  -f services/inventory-service/helm/inventory-service/values.yaml \
  -f services/inventory-service/helm/inventory-service/values-dev.yaml \
  -n decomposition-dev --create-namespace

# Staging environment
helm upgrade --install inventory-service \
  services/inventory-service/helm/inventory-service \
  -f services/inventory-service/helm/inventory-service/values.yaml \
  -f services/inventory-service/helm/inventory-service/values-staging.yaml \
  -n decomposition-staging --create-namespace
```

### ArgoCD (GitOps)

Apply the ArgoCD Application manifests:

```bash
# Dev
kubectl apply -f services/inventory-service/argocd/application-dev.yaml

# Staging
kubectl apply -f services/inventory-service/argocd/application-staging.yaml
```

ArgoCD will automatically sync changes from the Helm chart in this repository.

## Environment Configuration

### Dev Environment

| Setting | Value |
|---------|-------|
| Replicas | 1 |
| Image tag | `dev-latest` |
| Ingress host | `inventory-dev.workshop.local` |
| CPU request/limit | 50m / 250m |
| Memory request/limit | 128Mi / 256Mi |
| Database | In-memory SQLite (`Data Source=inventory.db`) |
| HPA | Disabled |
| Persistence | Disabled |

### Staging Environment

| Setting | Value |
|---------|-------|
| Replicas | 2 |
| Image tag | `staging-latest` |
| Ingress host | `inventory-staging.workshop.local` |
| CPU request/limit | 100m / 500m |
| Memory request/limit | 256Mi / 512Mi |
| Database | Persistent SQLite (`/data/inventory.db`) |
| HPA | Enabled (2-4 replicas, 75% CPU target) |
| Persistence | 1Gi gp2 volume |

### Production (Base Values)

| Setting | Value |
|---------|-------|
| Replicas | 1 (controlled by HPA) |
| Image tag | `latest` |
| Ingress host | `inventory.workshop.local` |
| CPU request/limit | 100m / 500m |
| Memory request/limit | 256Mi / 512Mi |
| Database | Persistent SQLite (`/data/inventory.db`) |
| HPA | Disabled by default |
| Persistence | 1Gi gp2 volume |

## Network Policies

The Helm chart deploys a NetworkPolicy that:

- **Allows ingress** from the `ingress-nginx` namespace on port 8080
- **Allows ingress** from the `monitoring` namespace on port 8080 (Prometheus scraping)
- **Allows egress** to DNS (UDP/TCP port 53)
- **Allows egress** to HTTPS (TCP port 443)
- **Denies** all other traffic

This follows the default-deny pattern from the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services/blob/main/k8s/network-policies/default-deny.yaml).

## Monitoring

### Health Checks

The deployment configures both probes against `/health`:

- **Liveness probe**: `initialDelaySeconds: 15`, `periodSeconds: 20`
- **Readiness probe**: `initialDelaySeconds: 5`, `periodSeconds: 10`

The health endpoint checks database connectivity via `Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore`.

### Prometheus Metrics

A `ServiceMonitor` resource is created when `monitoring.enabled=true` (default). Prometheus scrapes metrics from:

- **Port**: `http` (8080)
- **Path**: `/metrics`
- **Interval**: 30s

## CI/CD Pipeline

The GitHub Actions workflow automatically:

1. **On PR to main**: Runs `dotnet restore` → `dotnet build` → `dotnet test`
2. **On push to main**: Builds Docker image → Pushes to ECR → ArgoCD auto-syncs

The pipeline only triggers when files under `services/inventory-service/**` are modified.

## Verification

After deployment, verify the service is running:

```bash
# Check pod status
kubectl get pods -n decomposition-dev -l app.kubernetes.io/name=inventory-service

# Check service
kubectl get svc -n decomposition-dev

# Check ingress
kubectl get ingress -n decomposition-dev

# Port-forward for local testing
kubectl port-forward svc/inventory-service 8080:80 -n decomposition-dev

# Test health endpoint
curl http://localhost:8080/health

# Test API
curl http://localhost:8080/api/inventory
```

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Pod CrashLoopBackOff | Missing DB path, bad config | Check `kubectl logs`, verify env vars |
| Health check failing | Database unreachable | Check persistent volume mount, connection string |
| 503 from ingress | Pod not ready | Check readiness probe, increase `initialDelaySeconds` |
| No metrics in Prometheus | ServiceMonitor not picked up | Verify `monitoring` namespace label selector |
| ArgoCD out of sync | Helm values changed | Trigger manual sync or check auto-sync config |
