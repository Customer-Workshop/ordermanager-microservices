# Inventory Service

A standalone .NET 8 + Angular 17 microservice extracted from the OrderManager monolith. Manages stock levels, warehouse locations, and reorder alerts.

## Architecture

This microservice owns the **Inventory** bounded context:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inventory` | GET | List all inventory items |
| `/api/inventory/product/{id}` | GET | Get inventory for a specific product |
| `/api/inventory/product/{id}/restock` | POST | Restock a product |
| `/api/inventory/low-stock` | GET | List items at or below reorder level |
| `/api/inventory/product/{id}/check` | GET | Check if quantity is available |
| `/api/inventory/product/{id}/deduct` | POST | Deduct stock (called by Order service) |
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
# Restore and run .NET API
dotnet restore src/InventoryService.Api/InventoryService.Api.csproj
dotnet run --project src/InventoryService.Api/InventoryService.Api.csproj

# In a separate terminal, install and run Angular client
cd client-app && npm install && npm start
```

### Run tests

```bash
dotnet test
```

## Deployment

- **Dockerfile**: `docker/Dockerfile` (multi-stage build)
- **Helm chart**: `helm/inventory-service/`
- **ArgoCD**: `argocd/` (dev and staging manifests)
- **CI/CD**: `.github/workflows/build-push.yaml`

## Integration with Monolith

The OrderManager monolith calls this service via HTTP for inventory operations:
- Stock checks during order creation
- Stock deductions when orders are placed
- Inventory listing and restocking via the UI

The monolith uses an `InventoryHttpClient` that replaces the original in-process `InventoryService`.
