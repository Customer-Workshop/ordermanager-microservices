# Inventory Service

A standalone .NET 8 + Angular 17 microservice decomposed from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder thresholds.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{productId}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{productId}/restock` | Restock a product |
| POST | `/api/inventory/product/{productId}/deduct` | Deduct stock (used by Order service) |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/health` | Health check endpoint |

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
# Restore .NET dependencies
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj

# Install Angular dependencies
cd client-app && npm install && cd ..

# Run the API (serves Angular app too)
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj
```

The service will be available at `http://localhost:5000`.

### Run tests

```bash
dotnet test
```

## Infrastructure

- **Dockerfile**: `docker/Dockerfile` — multi-stage build (Angular + .NET + runtime)
- **Helm chart**: `helm/inventory-service/` — Kubernetes deployment manifests
- **ArgoCD**: `argocd/` — GitOps application manifests for dev and staging
- **CI/CD**: `ci/build-push.yaml` — GitHub Actions pipeline
