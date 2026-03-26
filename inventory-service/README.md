# Inventory Service

A standalone .NET 8 + Angular 17 microservice decomposed from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder thresholds.

## Architecture

| Component | Technology |
|-----------|------------|
| Backend | .NET 8, C#, Entity Framework Core, SQLite |
| Frontend | Angular 17, TypeScript |
| API | RESTful with Swagger/OpenAPI |
| Container | Multi-stage Docker build |
| Orchestration | Kubernetes (Helm chart) |
| GitOps | ArgoCD |
| Monitoring | Prometheus ServiceMonitor |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by order service) |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/health` | Health check endpoint |

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run locally

```bash
# Restore and run .NET API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Install and build Angular client (optional)
cd client-app && npm install && npm run build && cd ..
```

### Run tests

```bash
dotnet test
```

## IaC

- `docker/Dockerfile` — Multi-stage build
- `helm/inventory-service/` — Helm chart with deployment, service, ingress, network policy, HPA, service monitor
- `argocd/` — ArgoCD application manifests for dev and staging
- `ci/build-push.yaml` — GitHub Actions CI/CD pipeline

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Deploys into dedicated namespaces (`inventory-dev`, `inventory-staging`)
- Default-deny network policies with explicit ingress/egress rules
- Prometheus ServiceMonitor for metrics scraping
- ArgoCD automated sync with prune and self-heal
