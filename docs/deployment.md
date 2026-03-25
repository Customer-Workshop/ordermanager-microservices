# Deployment Guide

## Prerequisites

- Docker installed locally
- kubectl configured for the workshop EKS cluster
- Helm 3.x installed
- AWS CLI configured with ECR push permissions

## Container Image

### Build Locally

```bash
docker build -f docker/Dockerfile -t inventory-service:local .
docker run -p 8080:8080 inventory-service:local
```

Verify at `http://localhost:8080/health` and `http://localhost:8080/swagger`.

### Push to ECR

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 599083837640.dkr.ecr.us-east-1.amazonaws.com

docker tag inventory-service:local \
  599083837640.dkr.ecr.us-east-1.amazonaws.com/workshop/inventory-service:latest

docker push \
  599083837640.dkr.ecr.us-east-1.amazonaws.com/workshop/inventory-service:latest
```

## Kubernetes Deployment

### Helm

```bash
# Dev
helm upgrade --install inventory-service helm/inventory-service \
  -f helm/inventory-service/values.yaml \
  -f helm/inventory-service/values-dev.yaml \
  -n decomposition-dev --create-namespace

# Staging
helm upgrade --install inventory-service helm/inventory-service \
  -f helm/inventory-service/values.yaml \
  -f helm/inventory-service/values-staging.yaml \
  -n decomposition-staging --create-namespace
```

### ArgoCD (GitOps)

```bash
kubectl apply -f argocd/application-dev.yaml
kubectl apply -f argocd/application-staging.yaml
```

## Environment Configuration

| Setting | Dev | Staging |
|---------|-----|---------|
| Replicas | 1 | 2 |
| CPU request/limit | 50m / 250m | 100m / 500m |
| Memory request/limit | 128Mi / 256Mi | 256Mi / 512Mi |
| HPA | Disabled | Enabled (2-4) |
| Persistence | Disabled | 1Gi gp2 |
| Ingress host | `inventory-service-dev.workshop.local` | `inventory-service-staging.workshop.local` |

## Health Checks

- **Liveness**: `GET /health`, initialDelay 15s, period 20s
- **Readiness**: `GET /health`, initialDelay 5s, period 10s

## Monitoring

ServiceMonitor scrapes `/metrics` on port 8080 every 30s.

## Network Policies

- Allows ingress from `ingress-nginx` namespace on port 8080
- Allows ingress from `monitoring` namespace on port 8080
- Allows egress to DNS (UDP/TCP 53) and HTTPS (TCP 443)
- Denies all other traffic

## Verification

```bash
kubectl get pods -n decomposition-dev -l app.kubernetes.io/name=inventory-service
kubectl port-forward svc/inventory-service 8080:80 -n decomposition-dev
curl http://localhost:8080/health
curl http://localhost:8080/api/inventory
```

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| CrashLoopBackOff | Bad config or missing DB | Check `kubectl logs`, verify env vars |
| Health check failing | DB unreachable | Check volume mount, connection string |
| 503 from ingress | Pod not ready | Check readiness probe timing |
| No metrics | ServiceMonitor not picked up | Verify monitoring namespace labels |
