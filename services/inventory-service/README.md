# Inventory Service

A standalone .NET 8 + Angular 17 microservice decomposed from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder thresholds.

## Architecture

This microservice owns the Inventory bounded context:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List all inventory items |
| `/api/inventory/product/{id}` | GET | Get inventory for a specific product |
| `/api/inventory/product/{id}/restock` | POST | Restock a product |
| `/api/inventory/product/{id}/deduct` | POST | Deduct stock (called by Order service) |
| `/api/inventory/low-stock` | GET | List items at or below reorder level |
| `/health` | GET | Health check endpoint |

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **API**: RESTful with Swagger/OpenAPI

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run locally

```bash
# Restore and run
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The API will be available at `http://localhost:5000`.

### Run tests

```bash
dotnet test
```

## IaC

- **Dockerfile**: `docker/Dockerfile` — multi-stage build (Angular → .NET → Alpine runtime)
- **Helm chart**: `helm/inventory-service/` — deployment, service, network policy, service monitor, HPA
- **ArgoCD**: `argocd/` — application manifests for dev and staging
- **CI/CD**: `ci/build-push.yaml` — GitHub Actions pipeline for build, test, ECR push

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Deploys to `decomposition-dev` and `decomposition-staging` namespaces
- Includes network policy (ingress-nginx + monitoring allowed)
- Includes ServiceMonitor for Prometheus scraping
- Includes HPA for horizontal autoscaling in staging
