# Inventory Service

Standalone microservice decomposed from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder thresholds.

## Tech Stack

- **Backend**: .NET 8, C#, Entity Framework Core, SQLite
- **Frontend**: Angular 17, TypeScript
- **API**: RESTful with Swagger/OpenAPI

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/inventory` | List all inventory items |
| GET | `/api/inventory/product/{id}` | Get inventory for a specific product |
| POST | `/api/inventory/product/{id}/restock` | Restock a product |
| GET | `/api/inventory/low-stock` | List items at or below reorder level |
| GET | `/api/inventory/product/{id}/check?quantity=N` | Check if stock is sufficient |
| POST | `/api/inventory/product/{id}/deduct` | Deduct stock (used by order service) |
| GET | `/health` | Health check endpoint |

## Getting Started

```bash
# Restore and run
dotnet restore
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# Run tests
dotnet test
```

The service will be available at `http://localhost:5000`.

## IaC

- `docker/` — Multi-stage Dockerfile
- `helm/` — Kubernetes Helm chart
- `argocd/` — ArgoCD application manifests (dev, staging)
- `ci/` — GitHub Actions CI/CD pipeline
