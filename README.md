# Inventory Microservice

A standalone .NET 8 + Angular 17 microservice decomposed from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, and reorder thresholds.

## Architecture

| Component | Technology |
|-----------|-----------|
| **Backend** | .NET 8, C#, Entity Framework Core, SQLite |
| **Frontend** | Angular 17, TypeScript |
| **API** | RESTful with Swagger/OpenAPI |
| **Container** | Multi-stage Docker build (Alpine) |
| **Orchestration** | Kubernetes via Helm + ArgoCD |
| **CI/CD** | GitHub Actions, ECR, ArgoCD sync |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| POST | `/api/inventory/product/{productId}/reserve` | Reserve stock (used by monolith order flow) |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/health` | Health check endpoint |

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run locally

```bash
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

### Run tests

```bash
dotnet test --verbosity normal
```

## Project Structure

```
src/InventoryService.Api/       # .NET 8 Web API
client-app/                     # Angular 17 frontend
docker/Dockerfile               # Multi-stage container build
helm/inventory-service/         # Helm chart
argocd/                         # ArgoCD Application manifests (dev, staging)
.github/workflows/              # CI/CD pipeline
tests/                          # xUnit test project
```

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:
- Deploys into `decomposition-dev` / `decomposition-staging` namespaces
- Network policies follow default-deny with explicit allow rules
- ServiceMonitor for Prometheus metrics scraping
- HPA for horizontal pod autoscaling
- ArgoCD-driven GitOps deployments

## License

MIT
