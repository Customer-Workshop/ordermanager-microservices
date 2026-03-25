# Inventory Microservice

A standalone .NET 8 + Angular 17 microservice extracted from the [OrderManager monolith](https://github.com/Cognition-Partner-Workshops/app_dotnet-angular-monolith). Manages stock levels, warehouse locations, and reorder thresholds.

## Architecture

This microservice owns the **Inventory** bounded context:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List all inventory items |
| `/api/inventory/product/{id}` | GET | Get inventory for a product |
| `/api/inventory/product/{id}/restock` | POST | Restock a product |
| `/api/inventory/product/{id}/deduct` | POST | Deduct stock (called by Order service) |
| `/api/inventory/low-stock` | GET | List items at or below reorder level |
| `/api/inventory` | POST | Create a new inventory record |
| `/health` | GET | Health check |

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **API**: RESTful with Swagger/OpenAPI
- **Container**: Multi-stage Docker build
- **Orchestration**: Kubernetes (Helm chart)
- **GitOps**: ArgoCD
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Run the application

```bash
# Restore .NET dependencies
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The application will be available at `https://localhost:5001`.

### Run tests

```bash
dotnet test
```

## Infrastructure

| Path | Description |
|------|-------------|
| `docker/Dockerfile` | Multi-stage build (Angular + .NET + runtime) |
| `helm/inventory-service/` | Helm chart with deployment, service, network policy, HPA, service monitor |
| `argocd/` | ArgoCD Application manifests for dev and staging |
| `.github/workflows/` | CI/CD pipeline — build, test, push to ECR |

## Platform Conformance

This service conforms to the [platform-engineering-shared-services](https://github.com/Cognition-Partner-Workshops/platform-engineering-shared-services) standard:

- Deploys into `decomposition-dev` / `decomposition-staging` namespaces
- Network policies allow ingress from `ingress-nginx` and `monitoring` namespaces
- ServiceMonitor for Prometheus scraping
- HPA for autoscaling in staging
- ArgoCD automated sync with prune and self-heal

## License

MIT
