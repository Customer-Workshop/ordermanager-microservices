# OrderManager Microservices

Decomposed microservices from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Each service is independently deployable and conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard.

## Architecture

### Inventory Service

Manages stock levels, warehouse locations, and reorder thresholds. Provides a stock reservation API consumed by the monolith's Order module during decomposition.

**Tech Stack:** .NET 8, EF Core (SQLite), Angular 17

**API Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| POST | `/api/inventory/check-and-reserve` | Atomically check and reserve stock |
| GET | `/health` | Health check |

**Run locally:**
```bash
cd services/inventory-service
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

**Run tests:**
```bash
cd services/inventory-service

# Restore and run the API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Run tests
dotnet test
```

## IaC

| Artifact | Path | Description |
|----------|------|-------------|
| Dockerfile | `docker/Dockerfile` | Multi-stage build (Angular + .NET + runtime) |
| Helm chart | `helm/inventory-service/` | K8s deployment, service, network policy, HPA, service monitor |
| ArgoCD | `argocd/` | Application manifests for dev and staging |
| CI/CD | `.github/workflows/build-push.yaml` | Build, test, push to ECR |

## Platform Conformance

All services conform to the platform standard defined in [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services):
- Deploys into `decomposition-dev` / `decomposition-staging` namespaces
- Network policies: default-deny with explicit ingress from nginx and monitoring
- ServiceMonitor for Prometheus scraping
- HPA for auto-scaling in staging
- ArgoCD automated sync with prune and self-heal
