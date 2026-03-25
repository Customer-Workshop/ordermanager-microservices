# Inventory Service

A standalone .NET 8 + Angular 17 microservice extracted from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder alerts.

## Architecture

This microservice owns the **Inventory** bounded context:

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

### Run the service

```bash
# Restore .NET dependencies
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run tests
dotnet test

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The service will be available at `http://localhost:5000`.

## IaC

- **Dockerfile**: `docker/Dockerfile` — multi-stage build (Angular → .NET → Alpine runtime)
- **Helm chart**: `helm/inventory-service/` — Kubernetes deployment manifests
- **ArgoCD**: `argocd/` — GitOps application manifests for dev and staging
- **CI/CD**: `ci/build-push.yaml` — GitHub Actions pipeline for build, test, push to ECR

## Integration with Monolith

The OrderManager monolith calls this service via HTTP for inventory checks during order creation. The monolith's `InventoryHttpClient` replaces the previous in-process `InventoryService`.
